# Testing Guide: AI-Powered Resume Reviewer

To test the application, follow these steps to set up the environment and run both the backend and frontend.

## Prerequisites
1.  **Ollama**: Install from [ollama.com](https://ollama.com) and ensure it's running.
2.  **Python 3.9+**: For the backend.
3.  **Node.js & npm**: For the frontend.

## Step 1: Set up the Local LLM
1.  Start the Ollama application.
2.  Open a terminal and pull the required model:
    ```bash
    ollama pull llama3.2:3b
    ```

## Step 2: Start the Backend
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  (Optional) Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    python3 main.py
    ```
    The backend will start at `http://localhost:8000`.

## Step 3: Start the Frontend
1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically start at `http://localhost:5173`.

## Step 4: Verify Connectivity
You can use the provided verification script to check if Ollama is configured correctly:
```bash
python3 verify_env.py
```

## Step 5: Manual Testing Scenarios
Once both servers are running:
1.  Open `http://localhost:5173` in your browser.
2.  **Test Case 1: Text Entry**
    - Paste a job description into the "Job Description" text area.
    - Type or paste resume content into the rich text editor.
    - Click **Submit** and verify the analysis results appear.
3.  **Test Case 2: File Upload**
    - Toggle "Upload File" for both sections.
    - Upload a sample `.pdf`, `.docx`, or `.txt` file for the resume.
    - Upload a sample file for the job description.
    - Click **Submit** and verify the backend correctly extracts text and provides feedback.
4.  **Test Case 3: Interactive Feedback**
    - On the results page, hover over highlighted sections of the resume to see specific AI suggestions.
