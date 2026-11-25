import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import io
import re
import html
import PyPDF2
import docx
from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2:3b"
REQUEST_TIMEOUT = 300

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class Annotation(BaseModel):
    line_id: int
    feedback: str
    type: str            # "match", "improvement", or "missing"
    improved_text: str = ""  # only filled in for "improvement"

class AnalysisResponse(BaseModel):
    overall_assessment: str
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_feedback: str
    recommendations: List[str]
    keywords: List[str]
    annotations: List[Annotation]
    resume_lines: List[dict] = []
    extracted_resume_text: Optional[str] = None

MAX_RESUME_LINES = 60

# Small models lose track of line ids past roughly ten at a time, so the review
# step runs over batches instead of asking for every line in one pass.
LINES_PER_BATCH = 8

def html_to_text(text: str) -> str:
    """Convert Quill/markup HTML into plain text so the model sees real lines.

    The editor submits HTML (<p>, <li>, <br>). Feeding that to the LLM makes every
    quoted fragment miss, which is the bug behind the missing highlights.
    """
    if not text:
        return ""
    text = re.sub(r"(?i)<br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</(p|li|div|h[1-6]|tr)>", "\n", text)
    text = re.sub(r"(?s)<[^>]+>", "", text)
    text = html.unescape(text)
    return text.replace("\xa0", " ")

def is_reviewable(line: dict) -> bool:
    """Decide whether a line is worth sending to the model.

    Section headings, the candidate's name, and contact details aren't content the
    reviewer can meaningfully improve. Asking about them produced nonsense like
    rewriting "EXPERIENCE" into a sentence about REST APIs.
    """
    text = line["text"]

    # The name is always the first line of a resume.
    if line["id"] == 0:
        return False

    # "SUMMARY", "WORK EXPERIENCE" - headings are written in caps.
    if text.isupper() and len(text.split()) <= 3:
        return False

    # Contact details.
    if "@" in text or re.search(r"\(\d{3}\)\s*\d{3}-\d{4}", text):
        return False

    # Too short to say anything useful about.
    if len(text.split()) < 3:
        return False

    return True

def split_resume_lines(text: str) -> List[dict]:
    """Split resume text into numbered lines.

    The LLM only ever references these ids, so it never has to echo resume text
    back verbatim and cannot corrupt it with small rewrites.
    """
    lines = []
    for raw in html_to_text(text).splitlines():
        clean = " ".join(raw.split()).lstrip("\u2022\u25cf\u25aa-*").strip()
        if not clean:
            continue
        lines.append({"id": len(lines), "text": clean})
        if len(lines) >= MAX_RESUME_LINES:
            break
    return lines

def create_overview_prompt(resume_lines, job_desc):
    """Prompt for the whole-resume judgement: score, skills, recommendations.

    This is a separate call from the per-line review because these questions are
    about the resume as a whole, not about any single line.
    """
    resume_text = "\n".join(line["text"] for line in resume_lines)
    return f"""
    You are an expert HR recruiter and career coach.
    Analyze the following resume against the job description provided.

    RESUME:
    {resume_text}

    JOB DESCRIPTION:
    {job_desc}

    Return STRICTLY a JSON object with this structure:
    {{
        "overall_assessment": "Two or three sentences on the candidate's fit.",
        "match_score": 0-100 integer,
        "matched_skills": ["skills the resume shows that the job asks for"],
        "missing_skills": ["skills the job asks for that the resume does not show"],
        "experience_feedback": "How well the work experience and projects line up with the job.",
        "recommendations": ["concrete way to improve the resume"],
        "keywords": ["keywords from the job description worth adding"]
    }}

    RULES:
    - The match_score is a rough similarity estimate, not a hiring prediction.
    - Judge skills by meaning, not exact wording. "Built FastAPI endpoints" counts
      as REST API experience. "Containerized services with Docker" counts as
      containerization.
    - Base every statement on the resume text. Do not invent qualifications.
    Do not include any text before or after the JSON object.
    """

def create_review_prompt(batch_lines, job_desc, focus_sections=""):
    """Prompt for reviewing one small batch of resume lines.

    Batching keeps the model accurate: with ids spread across a whole resume it
    starts attaching feedback to the wrong lines.
    """
    numbered = "\n".join(f"[{line['id']}] {line['text']}" for line in batch_lines)
    valid_ids = ", ".join(str(line["id"]) for line in batch_lines)

    # The user chooses which sections are worth rewriting. Without a choice we
    # review everything.
    if focus_sections:
        focus_rule = f"- Focus rewrites on these sections: {focus_sections}."
    else:
        focus_rule = "- Suggest rewrites for any line that could be stronger."

    return f"""
    You are an expert HR recruiter reviewing individual lines of a resume.

    JOB DESCRIPTION:
    {job_desc}

    RESUME LINES TO REVIEW:
    {numbered}

    Return STRICTLY a JSON object with this structure:
    {{
        "annotations": [
            {{
                "line_id": 0,
                "type": "improvement",
                "feedback": "Why this line is good, weak, or missing something",
                "improved_text": "A stronger version of this exact line"
            }}
        ]
    }}

    RULES:
    - "line_id" MUST be one of: {valid_ids}. Use each id at most once.
    - "type" MUST be exactly one of:
        "match"       - the line already supports the job description
        "improvement" - the line could be rewritten to be stronger
        "missing"     - the line is unclear or leaves out something the job wants
    - Give a verdict for EVERY line listed above, even if it is already strong.
    - "improved_text" is REQUIRED when type is "improvement". It must be a rewrite
      of that one line only, in the same voice and about the same work.
    - "improved_text" MUST be empty for "match" and "missing".
    - NEVER invent employers, dates, tools, technologies, job titles, or numbers.
      If the original line has no metric, the rewrite has no metric. Keep every
      number that appears in the original and add no new ones.
    - Keep "improved_text" a similar length to the original line.
    {focus_rule}
    Do not include any text before or after the JSON object.
    """

def call_ollama(prompt: str) -> dict:
    """Send one prompt to Ollama and return the parsed JSON object."""
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        },
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    raw = response.json().get("response", "{}")
    return json.loads(raw)

def numbers_in(text: str) -> set:
    """Every number in a line, so we can catch invented metrics."""
    return set(re.findall(r"\d+(?:\.\d+)?", text))

def clean_annotations(raw_annotations, batch_lines):
    """Keep only trustworthy annotations from one batch.

    Anything that cites a line that wasn't in the batch, or that invents a number
    in its rewrite, is dropped. An invented metric is worse than no suggestion.
    """
    lines_by_id = {line["id"]: line for line in batch_lines}
    cleaned = []

    for anno in raw_annotations:
        if not isinstance(anno, dict):
            continue
        try:
            line_id = int(anno.get("line_id"))
        except (TypeError, ValueError):
            continue
        if line_id not in lines_by_id:
            continue

        anno_type = str(anno.get("type", "")).strip().lower()
        if anno_type not in ("match", "improvement", "missing"):
            anno_type = "improvement"

        improved_text = str(anno.get("improved_text") or "").strip()
        # Only improvement annotations carry a rewrite.
        if anno_type != "improvement":
            improved_text = ""

        original = lines_by_id[line_id]["text"]
        if improved_text:
            # A rewrite may reuse numbers from the original but never add new ones.
            if not numbers_in(improved_text) <= numbers_in(original):
                print(f"Dropped invented number in rewrite for line {line_id}: {improved_text}")
                improved_text = ""
            # An identical rewrite tells the user nothing.
            if improved_text.lower() == original.lower():
                improved_text = ""

        cleaned.append({
            "line_id": line_id,
            "feedback": str(anno.get("feedback", "")),
            "type": anno_type,
            "improved_text": improved_text,
        })

    return cleaned

def extract_text_from_pdf_with_ocr(content: bytes) -> str:
    """Extract text from PDF using OCR (for image-based PDFs)."""
    try:
        # Convert PDF pages to images
        images = convert_from_bytes(content)
        text = ""
        for image in images:
            # Use pytesseract to extract text from each page image
            page_text = pytesseract.image_to_string(image)
            text += page_text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OCR extraction failed: {str(e)}")

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith('.txt'):
        return content.decode('utf-8')
    elif filename.endswith('.pdf'):
        try:
            # First, try standard PDF text extraction
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            # Check if we got meaningful text (at least 50 non-whitespace characters)
            if len(text.strip()) < 50:
                print("Standard PDF extraction yielded minimal text, trying OCR...")
                text = extract_text_from_pdf_with_ocr(content)

            if len(text.strip()) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from PDF. The PDF may be empty, corrupted, or contain only images without readable text."
                )

            return text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not extract text from PDF: {str(e)}")
    elif filename.endswith('.docx'):
        try:
            doc = docx.Document(io.BytesIO(content))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not extract text from DOCX: {str(e)}")
    else:
        # Fallback for other files if needed, or error
        return content.decode('utf-8', errors='ignore')

@app.post("/analyze")
async def analyze_resume(
    resume_text: str = Form(None),
    job_description: str = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    job_description_file: Optional[UploadFile] = File(None),
    focus_sections: str = Form(""),
):
    # Process Resume
    final_resume_text = resume_text
    if resume_file:
        final_resume_text = await extract_text_from_file(resume_file)
    
    if not final_resume_text:
        raise HTTPException(status_code=400, detail="No resume content provided")

    # Process Job Description
    final_job_description = job_description
    if job_description_file:
        final_job_description = await extract_text_from_file(job_description_file)
        
    if not final_job_description:
        raise HTTPException(status_code=400, detail="No job description provided")

    resume_lines = split_resume_lines(final_resume_text)
    if not resume_lines:
        raise HTTPException(status_code=400, detail="No usable resume lines found")

    try:
        # First call judges the resume as a whole.
        overview = call_ollama(create_overview_prompt(resume_lines, final_job_description))

        # Then the lines are reviewed in small batches, which keeps the small model
        # from losing track of which id belongs to which line. Only content lines are
        # reviewed; headings and contact details are still displayed, just not scored.
        reviewable = [line for line in resume_lines if is_reviewable(line)]
        annotations = []
        for start in range(0, len(reviewable), LINES_PER_BATCH):
            batch = reviewable[start:start + LINES_PER_BATCH]
            try:
                review = call_ollama(
                    create_review_prompt(batch, final_job_description, focus_sections)
                )
            except Exception as error:
                # One bad batch shouldn't lose the rest of the review.
                print(f"Batch starting at line {start} failed: {error}")
                continue
            annotations.extend(clean_annotations(review.get("annotations", []), batch))

        overview["annotations"] = annotations
        overview["resume_lines"] = resume_lines
        overview["extracted_resume_text"] = final_resume_text
        overview["focus_sections"] = focus_sections
        return overview
    except requests.exceptions.ConnectionError:
        # The most common setup problem, so say what to do instead of failing silently.
        message = (
            "Could not reach Ollama on http://127.0.0.1:11434. "
            "Make sure the Ollama app is running, then try again."
        )
        print(f"Error in analyze_resume: {message}")
        raise HTTPException(status_code=503, detail=message)
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
