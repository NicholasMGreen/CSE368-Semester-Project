import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import FileUploader from '../Components/FileUploader';
import FeedbackDisplay from '../Components/FeedbackDisplay';

const ResumeReviewer: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [resumeInputMode, setResumeInputMode] = useState<'text' | 'file'>('text');
  const [jdInputMode, setJdInputMode] = useState<'text' | 'file'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleResumeFileSelect = (file: File | null) => {
    setResumeFile(file);
  };

  const handleJdFileSelect = (file: File | null) => {
    setJobDescriptionFile(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (jdInputMode === 'text') {
      if (!jobDescription.trim()) {
        alert('Please enter a job description.');
        return;
      }
      formData.append('job_description', jobDescription);
    } else {
      if (!jobDescriptionFile) {
        alert('Please upload a job description file.');
        return;
      }
      formData.append('job_description_file', jobDescriptionFile);
    }

    let currentResumeText = resumeText;

    if (resumeInputMode === 'text') {
      if (!resumeText.trim() || resumeText === '<p><br></p>') {
        alert('Please enter your resume text.');
        return;
      }
      formData.append('resume_text', resumeText);
    } else {
      if (!resumeFile) {
        alert('Please select a resume file to upload.');
        return;
      }
      formData.append('resume_file', resumeFile);
      currentResumeText = `[Content of ${resumeFile.name}]`;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysisResults({ ...data, originalText: currentResumeText });
    } catch (error) {
      console.error('Error submitting resume:', error);
      alert('An error occurred while analyzing your resume.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setAnalysisResults(null);
  };

  if (analysisResults) {
    return (
      <FeedbackDisplay 
        results={analysisResults} 
        resumeText={analysisResults.originalText} 
        onBack={handleBack} 
      />
    );
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent'
  ];

  return (
    <div className="resume-reviewer-container">
      <h2>Submit Your Resume</h2>
      <div className="input-section">
        <div className="resume-input-header">
          <h3>Job Description</h3>
          <div className="input-mode-selector">
            <button 
              className={jdInputMode === 'text' ? 'active' : ''} 
              onClick={() => setJdInputMode('text')}
            >
              Type text
            </button>
            <button 
              className={jdInputMode === 'file' ? 'active' : ''} 
              onClick={() => setJdInputMode('file')}
            >
              Upload File
            </button>
          </div>
        </div>

        {jdInputMode === 'text' ? (
          <div className="job-description-container">
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={5}
            />
          </div>
        ) : (
          <FileUploader onFileSelect={handleJdFileSelect} label="job description" />
        )}

        <div className="resume-input-header">
          <h3>Resume</h3>
          <div className="input-mode-selector">
            <button 
              className={resumeInputMode === 'text' ? 'active' : ''} 
              onClick={() => setResumeInputMode('text')}
            >
              Type Resume
            </button>
            <button 
              className={resumeInputMode === 'file' ? 'active' : ''} 
              onClick={() => setResumeInputMode('file')}
            >
              Upload File
            </button>
          </div>
        </div>

        {resumeInputMode === 'text' ? (
          <div className="text-editor-container">
            <ReactQuill 
              theme="snow" 
              value={resumeText} 
              onChange={setResumeText} 
              modules={modules}
              formats={formats}
              placeholder="Paste or type your resume here..."
            />
          </div>
        ) : (
          <FileUploader onFileSelect={handleResumeFileSelect} label="your resume" />
        )}
      </div>

      <button 
        className="submit-resume-button" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Analyzing...' : 'Submit for Review'}
      </button>

      <style>{`
        .resume-reviewer-container {
          max-width: 800px;
          margin: 20px auto;
          padding: 32px;
          text-align: left;
          background: var(--surface);
          border-radius: var(--radius-l);
          box-shadow: var(--shadow);
        }
        .resume-reviewer-container h2 {
          margin-top: 0;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .job-description-container {
          margin-bottom: 24px;
        }
        .job-description-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--on-surface);
        }
        .job-description-container textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--outline);
          border-radius: var(--radius-m);
          font-family: var(--sans);
          font-size: 1rem;
          resize: vertical;
          box-sizing: border-box;
        }
        .job-description-container textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
        .resume-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .resume-input-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 500;
        }
        .input-mode-selector {
          display: flex;
          gap: 12px;
        }
        .input-mode-selector button {
          padding: 6px 16px;
          cursor: pointer;
          border: 1px solid var(--outline);
          background: transparent;
          color: var(--on-surface-variant);
          border-radius: var(--radius-xl);
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .input-mode-selector button:hover {
          background: rgba(26, 115, 232, 0.04);
          border-color: var(--primary);
        }
        .input-mode-selector button.active {
          background: rgba(26, 115, 232, 0.1);
          color: var(--primary);
          border-color: var(--primary);
        }
        .text-editor-container {
          margin-bottom: 32px;
        }
        .ql-toolbar.ql-snow {
          border-top-left-radius: var(--radius-m);
          border-top-right-radius: var(--radius-m);
          border-color: var(--outline);
          background: #f8f9fa;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: var(--radius-m);
          border-bottom-right-radius: var(--radius-m);
          border-color: var(--outline);
          height: 300px;
          font-family: var(--sans);
          font-size: 1rem;
        }
        .input-section {
          margin-bottom: 32px;
        }
        .submit-resume-button {
          display: block;
          width: 100%;
          padding: 12px 24px;
          background-color: var(--primary);
          color: var(--on-primary);
          border: none;
          border-radius: var(--radius-m);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
        }
        .submit-resume-button:hover:not(:disabled) {
          background-color: var(--primary-hover);
          box-shadow: 0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15);
        }
        .submit-resume-button:disabled {
          background-color: var(--outline);
          cursor: not-allowed;
          box-shadow: none;
        }
        .file-info {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f1f3f4;
          padding: 12px 16px;
          border-radius: var(--radius-m);
          color: var(--on-surface);
        }
        .clear-button {
          background: none;
          border: none;
          color: var(--on-surface-variant);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
          line-height: 1;
        }
        .clear-button:hover {
          color: var(--error);
        }
      `}</style>
    </div>
  );
};

export default ResumeReviewer;
