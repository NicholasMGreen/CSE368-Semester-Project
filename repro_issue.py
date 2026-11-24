import requests
import os

url = "http://localhost:8000/analyze"

# Create a dummy PDF
from reportlab.pdfgen import canvas
pdf_path = "test_resume.pdf"
c = canvas.Canvas(pdf_path)
c.drawString(100, 750, "John Doe Resume")
c.drawString(100, 730, "Skills: Python, FastAPI, React")
c.drawString(100, 710, "Experience: Software Engineer at Tech Corp")
c.save()

files = {
    'resume_file': ('test_resume.pdf', open(pdf_path, 'rb'), 'application/pdf')
}
data = {
    'job_description': 'We are looking for a Python developer with FastAPI and React experience.'
}

print("Sending request...")
response = requests.post(url, files=files, data=data)

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print("Response keys:", result.keys())
    print("Extracted Resume Text:", result.get("extracted_resume_text"))
    print("Match Score:", result.get("match_score"))
else:
    print("Error:", response.text)

# Cleanup
if os.path.exists(pdf_path):
    os.remove(pdf_path)
