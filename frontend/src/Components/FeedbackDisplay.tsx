import React from 'react';

interface Annotation {
  line_id: number;
  feedback: string;
  type: string;
  improved_text?: string;
}

export interface ResumeLine {
  id: number;
  text: string;
}

export interface AnalysisResults {
  overall_assessment: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_feedback: string;
  recommendations: string[];
  keywords: string[];
  annotations: Annotation[];
  resume_lines?: ResumeLine[];
  // Set by the reviewer page from extracted_resume_text, used as a fallback.
  originalText?: string;
}

interface FeedbackDisplayProps {
  results: AnalysisResults;
  resumeText: string;
  onBack: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ results, resumeText, onBack }) => {
  const annotations = results.annotations ?? [];
  const lines = results.resume_lines ?? [];
  // The model can omit any of these keys; default to empty so the page never crashes.
  const matchedSkills = results.matched_skills ?? [];
  const missingSkills = results.missing_skills ?? [];
  const recommendations = results.recommendations ?? [];
  const keywords = results.keywords ?? [];

  // Index annotations by the line id the model returned. No string matching, so a
  // one-character difference in the model's wording can no longer lose a highlight.
  const byLineId = new Map<number, Annotation>();
  annotations.forEach((anno) => {
    if (typeof anno.line_id === 'number') byLineId.set(anno.line_id, anno);
  });

  const renderHighlightedResume = () => {
    if (lines.length === 0) {
      // Backend always sends resume_lines; this is only a fallback for stale responses.
      return (
        <div className="resume-content">
          {resumeText ? resumeText : 'No resume text available'}
        </div>
      );
    }

    return (
      <div className="resume-content">
        {lines.map((line) => {
          const anno = byLineId.get(line.id);
          const classes = ['resume-line', anno ? `type-${anno.type}` : ''].join(' ').trim();
          return (
            <div key={line.id} className={classes}>
              <span className="line-text">{line.text}</span>
              {anno && (
                <span className="line-feedback">{anno.feedback}</span>
              )}
              {anno?.improved_text && (
                <div className="line-suggestion">
                  <span className="suggestion-label">Suggested rewrite</span>
                  {anno.improved_text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
            <div className="legend">
              <span className="legend-item"><span className="swatch type-match" /> Good as-is</span>
              <span className="legend-item"><span className="swatch type-improvement" /> Could be stronger</span>
              <span className="legend-item"><span className="swatch type-missing" /> Unclear or missing</span>
            </div>
            {renderHighlightedResume()}
          </section>
        </div>

        <div className="sidebar-feedback">
          <section className="skills-section">
            <h3>Skills Analysis</h3>
            <div className="skills-group">
              <h4>Matched Skills</h4>
              <div className="tags">
                {matchedSkills.map(skill => <span key={skill} className="tag match">{skill}</span>)}
              </div>
            </div>
            <div className="skills-group">
              <h4>Missing Skills</h4>
              <div className="tags">
                {missingSkills.map(skill => <span key={skill} className="tag missing">{skill}</span>)}
              </div>
            </div>
          </section>

          <section className="experience-section">
            <h3>Work Experience</h3>
            <p>{results.experience_feedback || 'No feedback on work experience.'}</p>
          </section>

          <section className="recommendations-section">
            <h3>Recommendations</h3>
            <ul>
              {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </section>

          <section className="keywords-section">
            <h3>Suggested Keywords</h3>
            <div className="tags">
              {keywords.map(kw => <span key={kw} className="tag keyword">{kw}</span>)}
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
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 0.85rem;
          color: var(--on-surface-variant);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .swatch {
          width: 12px;
          height: 12px;
          border-radius: 3px;
          display: inline-block;
        }
        .swatch.type-match { background-color: rgba(76, 175, 80, 0.5); }
        .swatch.type-improvement { background-color: rgba(255, 215, 0, 0.6); }
        .swatch.type-missing { background-color: rgba(244, 67, 54, 0.5); }
        .resume-line {
          padding: 2px 6px;
          margin-left: -6px;
          border-radius: var(--radius-s);
          white-space: pre-wrap;
        }
        .resume-line.type-match {
          background-color: rgba(76, 175, 80, 0.1);
          border-left: 3px solid #4caf50;
        }
        .resume-line.type-improvement {
          background-color: rgba(255, 242, 0, 0.2);
          border-left: 3px solid #ffd700;
        }
        .resume-line.type-missing {
          background-color: rgba(244, 67, 54, 0.1);
          border-left: 3px solid #f44336;
        }
        .line-feedback {
          display: block;
          margin-top: 4px;
          font-size: 0.85rem;
          color: var(--on-surface-variant);
          font-style: italic;
        }
        .line-suggestion {
          margin-top: 6px;
          padding: 6px 10px;
          border-radius: var(--radius-s);
          background: #e8f0fe;
          border-left: 3px solid var(--primary);
          font-size: 0.9rem;
          color: var(--on-surface);
        }
        .suggestion-label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--primary);
          font-weight: 600;
          margin-bottom: 2px;
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
