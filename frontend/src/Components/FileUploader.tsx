import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, label = 'your resume' }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      setFileName(null);
      onFileSelect(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setFileName(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <div 
        className="upload-dropzone" 
        onClick={handleButtonClick}
      >
        <div className="upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 15H13V9H16L12 5L8 9H11V15Z" fill="currentColor"/>
            <path d="M20 18H4V11H2V18C2 19.103 2.897 20 4 20H20C21.103 20 22 19.103 22 18V11H20V18Z" fill="currentColor"/>
          </svg>
        </div>
        <p>{fileName ? 'File selected' : `Click to upload ${label}`}</p>
        <p className="upload-hint">PDF, DOCX, or TXT</p>
      </div>
      {fileName && (
        <div className="file-info">
          <span>{fileName}</span>
          <button type="button" onClick={handleClearFile} className="clear-button">
            ✕
          </button>
        </div>
      )}
      <style>{`
        .upload-dropzone {
          border: 2px dashed var(--outline);
          border-radius: var(--radius-m);
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8f9fa;
        }
        .upload-dropzone:hover {
          border-color: var(--primary);
          background: rgba(26, 115, 232, 0.04);
        }
        .upload-icon {
          color: var(--primary);
          margin-bottom: 12px;
        }
        .upload-icon svg {
          width: 48px;
          height: 48px;
        }
        .upload-dropzone p {
          margin: 0;
          color: var(--on-surface);
          font-weight: 500;
        }
        .upload-hint {
          font-size: 0.85rem;
          color: var(--on-surface-variant) !important;
          margin-top: 4px !important;
          font-weight: 400 !important;
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
