import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  const tips = [
    "Analyzing your resume against the job description...",
    "Extracting key skills and experience...",
    "Identifying matches and gaps...",
    "Generating personalized recommendations...",
    "Crafting improvement suggestions...",
    "Almost there! Finalizing your feedback..."
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentTip(0);
      setProgress(0);
      return;
    }

    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 6000);

    // Smooth progress bar (reaches ~90% over 30 seconds, never completes)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 0.5;
      });
    }, 100);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <svg className="checkmark" viewBox="0 0 50 50">
            <circle className="checkmark-circle" cx="25" cy="25" r="20" />
            <path className="checkmark-check" d="M14 27l7 7 16-16" />
          </svg>
        </div>

        <h2 className="loading-title">Analyzing Your Resume</h2>

        <div className="loading-tip">
          {tips.map((tip, index) => (
            <p
              key={index}
              className={`tip ${index === currentTip ? 'active' : ''}`}
            >
              {tip}
            </p>
          ))}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="loading-subtext">This may take 30-60 seconds for OCR-based PDFs</p>
      </div>

      <style>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .loading-content {
          background: white;
          padding: 56px 72px;
          border-radius: var(--radius-xl);
          text-align: center;
          max-width: 540px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--outline);
        }

        .loading-spinner {
          position: relative;
          width: 96px;
          height: 96px;
          margin: 0 auto 36px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        }

        .spinner-ring:nth-child(2) {
          width: 76%;
          height: 76%;
          top: 12%;
          left: 12%;
          border-top-color: var(--accent);
          animation-delay: -0.4s;
        }

        .spinner-ring:nth-child(3) {
          width: 52%;
          height: 52%;
          top: 24%;
          left: 24%;
          border-top-color: var(--accent-light);
          animation-delay: -0.8s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .checkmark {
          display: none;
        }

        .loading-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--on-surface);
          margin: 0 0 20px 0;
          letter-spacing: -0.02em;
        }

        .loading-tip {
          position: relative;
          height: 56px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .tip {
          position: absolute;
          width: 100%;
          margin: 0;
          font-size: 0.95rem;
          color: var(--on-surface-variant);
          line-height: 1.6;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tip.active {
          opacity: 1;
          transform: translateY(0);
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--surface-elevated);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid var(--outline);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-dark), var(--primary), var(--accent-light));
          background-size: 200% 100%;
          border-radius: 999px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: shimmer 2.5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .loading-subtext {
          font-size: 0.85rem;
          color: var(--on-surface-variant);
          margin: 0;
          font-weight: 500;
        }

        @media (max-width: 600px) {
          .loading-content {
            padding: 40px 32px;
            margin: 20px;
          }

          .loading-title {
            font-size: 1.5rem;
          }

          .loading-spinner {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
