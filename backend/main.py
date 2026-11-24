import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import io
import PyPDF2
import docx

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

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class Annotation(BaseModel):
    text: str
    feedback: str
    type: str  # e.g., "improvement", "missing", "match"

class AnalysisResponse(BaseModel):
    overall_assessment: str
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_feedback: str
    recommendations: List[str]
    keywords: List[str]
    annotations: List[Annotation]
    extracted_resume_text: Optional[str] = None

def create_prompt(resume, job_desc):
    return f"""
    You are an expert HR recruiter and career coach. 
    Analyze the following resume against the job description provided.
    
    RESUME:
    {resume}
    
    JOB DESCRIPTION:
    {job_desc}
    
    Perform a detailed analysis and return the result STRICTLY as a JSON object with the following structure:
    {{
        "overall_assessment": "General overview of the candidate's fit.",
        "match_score": 0-100 integer,
        "matched_skills": ["skill1", "skill2"],
        "missing_skills": ["skill1", "skill2"],
        "experience_feedback": "Detailed feedback on work experience.",
        "recommendations": ["improvement1", "improvement2"],
        "keywords": ["keyword1", "keyword2"],
        "annotations": [
            {{
                "text": "Exact text from the resume to highlight",
                "feedback": "Why this needs improvement or why it's a good match",
                "type": "improvement"
            }}
        ]
    }}
    Ensure the "text" in annotations matches the resume content exactly (case sensitive, same punctuation) so it can be highlighted in the UI.
    Provide at least 3-5 annotations of different types (match, improvement, missing).
    Do not include any text before or after the JSON object.
    """

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith('.txt'):
        return content.decode('utf-8')
    elif filename.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
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
    job_description_file: Optional[UploadFile] = File(None)
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

    prompt = create_prompt(final_resume_text, final_job_description)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=60
        )
        response.raise_for_status()
        result_json = response.json().get("response", "{}")
        print(f"Ollama response: {result_json}")
        data = json.loads(result_json)
        # Add extracted_resume_text to the dict before returning
        data["extracted_resume_text"] = final_resume_text
        return data
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
