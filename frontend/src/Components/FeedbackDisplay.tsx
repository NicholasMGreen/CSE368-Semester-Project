import React from 'react';

interface Annotation {
  text: string;
  feedback: string;
  type: string;
}

interface AnalysisResults {
  overall_assessment: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_feedback: string;
  recommendations: string[];
  keywords: string[];
  annotations: Annotation[];
}

interface FeedbackDisplayProps {
  results: AnalysisResults;
  resumeText: string;
  onBack: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ results, resumeText, onBack }) => {
  // Function to highlight resume text based on annotations
  const renderHighlightedResume = () => {
    console.log('resumeText:', resumeText);
    console.log('resumeText length:', resumeText?.length);
    console.log('annotations:', results.annotations);

    if (!resumeText || resumeText.trim().length === 0) {
      return <div className="resume-content">No resume text available</div>;
    }

    if (!results.annotations || results.annotations.length === 0) {
      return <div className="resume-content" dangerouslySetInnerHTML={{ __html: resumeText }} />;
    }

    let highlightedContent = resumeText;
    
    // Sort annotations by length descending to avoid partial matches interfering with longer ones
    const sortedAnnotations = [...results.annotations].sort((a, b) => b.text.length - a.text.length);

    sortedAnnotations.forEach((anno) => {
      if (!anno.text) return;

      // Create a regex to find the exact text
      // We use a temporary placeholder to avoid double-highlighting
      const escapedText = anno.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedText, 'g');
      
      highlightedContent = highlightedContent.replace(regex, (match) => {
        return `<span class="highlighted-section type-${anno.type}" data-feedback="${anno.feedback.replace(/"/g, '&quot;')}" data-type="${anno.type}">${match}</span>`;
      });
    });

    return <div className="resume-content" dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  return (
    <div className="feedback-display-container">
      <div className="feedback-header">
        <button className="back-button" onClick={onBack}>← Back to Editor</button>
        <h2>Resume Analysis Results</h2>
      </div>

      <div className="results-grid">
        <div className="main-feedback">
          <section className="score-section">
            <div className="score-circle">
              <span className="score-value">{results.match_score}</span>
              <span className="score-label">Match Score</span>
            </div>
            <div className="overall-assessment">
              <h3>Overall Assessment</h3>
              <p>{results.overall_assessment}</p>
            </div>
          </section>

          <section className="resume-view">
            <h3>Annotated Resume</h3>
            <p className="instruction">Hover over highlighted sections to see feedback.</p>
            {renderHighlightedResume()}
          </section>
        </div>

        <div className="sidebar-feedback">
          <section className="skills-section">
            <h3>Skills Analysis</h3>
            <div className="skills-group">
              <h4>Matched Skills</h4>
              <div className="tags">
                {results.matched_skills.map(skill => <span key={skill} className="tag match">{skill}</span>)}
              </div>
            </div>
            <div className="skills-group">
              <h4>Missing Skills</h4>
              <div className="tags">
                {results.missing_skills.map(skill => <span key={skill} className="tag missing">{skill}</span>)}
              </div>
            </div>
          </section>

          <section className="recommendations-section">
            <h3>Recommendations</h3>
            <ul>
              {results.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </section>

          <section className="keywords-section">
            <h3>Suggested Keywords</h3>
            <div className="tags">
              {results.keywords.map(kw => <span key={kw} className="tag keyword">{kw}</span>)}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .feedback-display-container {
          max-width: 1100px;
          margin: 20px auto;
          padding: 32px;
          background: var(--background);
          text-align: left;
        }
        .feedback-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }
        .back-button {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 500;
          font-size: 1rem;
        }
        .results-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 32px;
        }
        .main-feedback, .sidebar-feedback {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        section {
          background: var(--surface);
          padding: 24px;
          border-radius: var(--radius-l);
          box-shadow: var(--shadow);
        }
        .score-section {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 8px solid var(--primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .score-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
        }
        .score-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--on-surface-variant);
        }
        .resume-view {
          position: relative;
        }
        .resume-content {
          background: #fff;
          border: 1px solid var(--outline);
          padding: 24px;
          border-radius: var(--radius-m);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .instruction {
          font-size: 0.85rem;
          color: var(--on-surface-variant);
          margin-bottom: 12px;
        }
        .highlighted-section {
          cursor: help;
          position: relative;
          transition: background-color 0.2s;
        }
        .highlighted-section.type-improvement {
          background-color: rgba(255, 242, 0, 0.2);
          border-bottom: 2px solid #ffd700;
        }
        .highlighted-section.type-match {
          background-color: rgba(76, 175, 80, 0.1);
          border-bottom: 2px solid #4caf50;
        }
        .highlighted-section.type-missing {
          background-color: rgba(244, 67, 54, 0.1);
          border-bottom: 2px solid #f44336;
        }
        .highlighted-section:hover {
          filter: brightness(0.95);
        }
        .highlighted-section::after {
          content: attr(data-feedback);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #323232;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
          width: 250px;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
          pointer-events: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .highlighted-section:hover::after {
          visibility: visible;
          opacity: 1;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .tag.match { background: #e6f4ea; color: #1e8e3e; }
        .tag.missing { background: #fce8e6; color: #d93025; }
        .tag.keyword { background: #e8f0fe; color: #1a73e8; }
        
        .skills-group {
          margin-bottom: 20px;
        }
        .skills-group h4 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: var(--on-surface-variant);
        }
        ul {
          margin: 0;
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
          color: var(--on-surface);
        }
      `}</style>
    </div>
  );
};

export default FeedbackDisplay;
