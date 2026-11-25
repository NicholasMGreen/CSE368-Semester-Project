# CSE 368 - Introduction to Artificial Intelligence: Semester Group Project
Project Title: AI-Powered Resume Reviewer Using Large Language Models
Group Size: 3 Students
Total Points: 100
Submission Deadline: December 7, 2026
Submission Platform: UBLearns
Project Type: Software Development and Application of LLMs

================================================================================
1. PROJECT OVERVIEW
================================================================================
- Build a working software application using Python and a locally running LLM.
- Demonstrate concepts from CSE 368: Transformers, LLMs, prompt engineering, embeddings, and Retrieval-Augmented Generation (RAG).
- CRITICAL CONSTRAINT: Must use a locally running LLM through Ollama or an equivalent local model runtime. Paid API services are not required and should not be necessary.

================================================================================
2. PROJECT OBJECTIVES
================================================================================
1. Integrate a pretrained LLM into a Python application.
2. Construct effective prompts for a specific application.
3. Process and analyze user-provided documents.
4. Use an LLM to compare two pieces of text.
5. Generate structured and meaningful AI responses.
6. Evaluate the quality and reliability of LLM-generated output.
7. Identify hallucinations and limitations of LLM-based applications.
8. Work collaboratively to develop an AI-powered software product.

================================================================================
3. FUNCTIONAL REQUIREMENTS (CORE FEATURES)
================================================================================
3.1 Resume and Job Description Input
- Allow users to provide a candidate's resume and a job description.
- Support both direct text entry and document uploads (PDF and TXT recommended; DOCX encouraged).

3.2 LLM Integration
- Connect to a locally running LLM using Ollama or an equivalent local runtime.
- Construct a prompt combining the supplied resume and job description and send it to the LLM for analysis.

3.3 Resume Analysis
The generated analysis must contain:
- Overall assessment of the resume.
- Skills matching the job requirements.
- Missing or unclear qualifications.
- Relevant work experience and projects.
- Recommendations for improving the resume.
- Suggested keywords that could improve the resume.

3.4 Resume-to-Job Match Score
- Provide an approximate match score between 0 and 100.
- Explain how the score is generated and why it should not be interpreted as an objectively validated probability of getting the job.

3.5 Structured Output
- Present results in an organized and readable format.
- Encouraged to enforce structured JSON output from the LLM and render it in a user-friendly format in the UI.

3.6 User Interface
- Implement a simple graphical interface (CLI-only is NOT sufficient).
- Recommended technologies: Streamlit, Flask, FastAPI with a frontend, or another Python-based UI framework.

================================================================================
4. ADVANCED FEATURES (CHOOSE AT LEAST ONE)
================================================================================
4.1 Option A: Retrieval-Augmented Generation (RAG)
- Build a small collection of job descriptions or skill requirements.
- Generate embeddings for the documents and store them in a vector database.
- Retrieve relevant information using semantic similarity to improve resume evaluation.

4.2 Option B: Resume Improvement Assistant
- Allow users to request suggestions for improving specific resume sections.
- Generate improved descriptions of projects or work experience.
- Suggest relevant keywords based on the job description.
- Guardrail: Ensure the application does not invent qualifications or experience.

4.3 Option C: Multiple Job Matching
- Allow users to provide multiple job descriptions.
- Compare one resume against multiple positions and rank them by estimated compatibility.
- Explain why a particular job is a stronger match.

4.4 Option D: Resume Comparison and Evaluation
- Compare two versions of the same resume.
- Identify improvements and remaining weaknesses.
- Explain which version better matches a particular job description.

================================================================================
5. TESTING AND EVALUATION
================================================================================
- Test the application using at least 5 different resume/job-description combinations.
- Address the following evaluation questions:
  1. Does the application correctly identify matching skills?
  2. Does it identify missing or unclear qualifications?
  3. Are the recommendations relevant to the job description?
  4. Does the application generate incorrect or fabricated information?
  5. Are the results consistent when similar inputs are provided?
- Include at least 2 examples critically evaluating the LLM's output.
- Discuss limitations: hallucinations, inaccurate match scores, incomplete information, and sensitivity to prompt design.

================================================================================
6. GROUP ORGANIZATION (3 MEMBERS)
================================================================================
Note: All members must contribute to implementation, testing, and understanding of the complete application.

- Member 1: Frontend and Application Development
  * Develop UI, resume/JD input, file upload/display, and component integration.
- Member 2: LLM Integration and Prompt Engineering
  * Set up local LLM, Python-to-LLM communication, prompt design/iteration, and structured LLM responses.
- Member 3: Evaluation and Advanced Features
  * Implement the selected advanced feature, develop test cases, evaluate LLM results, and analyze hallucinations/limitations.

================================================================================
7. PROJECT MILESTONES
================================================================================
- Milestone 1 (Basic Prototype): Install Ollama + download local LLM; connect Python to LLM; accept resume & JD; generate initial review.
- Milestone 2 (Application Development): Build GUI; implement file uploads; improve prompt construction; display structured evaluation results.
- Milestone 3 (Advanced Functionality): Implement >= 1 advanced feature; improve response quality; test with multiple examples.
- Milestone 4 (Final Evaluation & Submission): Complete testing/evaluation; document limitations/hallucinations; write technical report; finalize/organize source code; submit deliverables.

================================================================================
8. REQUIRED DELIVERABLES
================================================================================
8.1 Deliverable 1: Source Code (ZIP file)
- All Python source files, frontend/backend code, prompt templates, configuration files, and sample synthetic/public resumes and job descriptions.
- Security rule: Do NOT submit API keys, passwords, or private personal information.

8.2 Deliverable 2: Technical Project Report (PDF, ~5-8 pages excluding references/appendices)
Must include:
1. Introduction and project motivation
2. Application architecture and design
3. Technologies and LLM models used
4. Prompt engineering approach
5. Implementation details and screenshots
6. Description of the advanced feature
7. Testing methodology and results
8. Examples of incorrect outputs or hallucinations
9. Limitations and possible improvements
10. Contributions of each group member

8.3 Deliverable 3: Individual Contribution Statement (1 per member)
Each student must submit a short statement covering:
- What they implemented
- Which parts of the project they contributed to
- What they learned about LLM applications
- One technical challenge they encountered

================================================================================
9. GRADING RUBRIC (100 POINTS TOTAL)
================================================================================
- Core application functionality: 25 pts
- LLM integration and prompt engineering: 15 pts
- Advanced feature implementation: 15 pts
- Technical project report: 15 pts
- User interface and usability: 10 pts
- Testing and evaluation: 10 pts
- Individual contribution: 10 pts

================================================================================
10. IMPORTANT GUIDELINES & CONSTRAINTS
================================================================================
- Primary Goal: Build a working AI-powered software application, not simply demonstrate an existing chatbot.
- Local LLM is mandatory; open-source libraries and pretrained models are allowed.
- Use synthetic or anonymized resumes for testing (no real confidential PII).
- AI-generated results must not be presented as objectively accurate hiring recommendations.