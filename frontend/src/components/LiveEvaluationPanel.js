import React, { useState, useEffect } from 'react';
import './LiveEvaluationPanel.css';

export default function LiveEvaluationPanel({ socket, roomID, savedQuestions, templateId }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for answer evaluations
    socket.on('answer-evaluated', (data) => {
      console.log('AI Answer evaluated:', data);
      
      // Update evaluations
      setEvaluations(prev => {
        const newEvals = [...prev];
        newEvals[data.questionIndex] = {
          score: data.score,
          feedback: data.feedback,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          matchedConcepts: data.matchedConcepts || [],
          evaluationType: data.evaluationType || 'AI'
        };
        return newEvals;
      });

      // Update average score
      if (data.averageScore !== undefined) {
        setAverageScore(data.averageScore);
      }
    });

    // Listen for question sent confirmation
    socket.on('question-sent', (data) => {
      setAskedQuestions(prev => [...prev, data.questionIndex]);
    });

    return () => {
      socket.off('answer-evaluated');
      socket.off('question-sent');
    };
  }, [socket]);

  const askQuestion = (index) => {
    if (!savedQuestions || !savedQuestions[index]) {
      alert('Question not found!');
      return;
    }

    socket.emit('ask-question', {
      roomId: roomID,
      questionIndex: index,
      templateId: templateId
    });

    setCurrentQuestionIndex(index);
    console.log(`Asking question ${index + 1} (Template ID: ${templateId})`);
  };

  const askNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < savedQuestions.length) {
      askQuestion(nextIndex);
    } else {
      alert('All questions have been asked!');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ecc94b';
    if (score >= 40) return '#ed8936';
    return '#f56565';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (!savedQuestions || savedQuestions.length === 0) {
    return (
      <div className="live-evaluation-panel">
        <div className="no-questions">
          <p>⚠️ No questions saved. Please complete the pre-interview setup first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-evaluation-panel">
      <div className="panel-header">
        <h3>📊 Live Evaluation Dashboard</h3>
        <div className="average-score-badge">
          <span className="badge-label">Average Score</span>
          <span className="badge-value" style={{ color: getScoreColor(averageScore) }}>
            {averageScore.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="questions-control">
        <div className="control-header">
          <h4>Interview Questions ({savedQuestions.length} total)</h4>
          <div className="progress-info">
            {askedQuestions.length} / {savedQuestions.length} asked
          </div>
        </div>

        <div className="questions-list">
          {savedQuestions.map((q, index) => {
            const isAsked = askedQuestions.includes(index);
            const evaluation = evaluations[index];
            const isCurrent = currentQuestionIndex === index;

            return (
              <div 
                key={index} 
                className={`question-item ${isCurrent ? 'current' : ''} ${isAsked ? 'asked' : ''}`}
              >
                <div className="question-row">
                  <div className="question-info">
                    <span className="q-number">Q{index + 1}</span>
                    <span className="q-text">{q.question}</span>
                  </div>
                  
                  <div className="question-actions">
                    {evaluation ? (
                      <div className="score-display" style={{ 
                        backgroundColor: getScoreColor(evaluation.score) 
                      }}>
                        {evaluation.score.toFixed(0)}%
                        <small>{getScoreLabel(evaluation.score)}</small>
                      </div>
                    ) : (
                      <button
                        onClick={() => askQuestion(index)}
                        className={`ask-btn ${isAsked ? 'asked' : ''}`}
                        disabled={isAsked}
                      >
                        {isAsked ? '✓ Asked' : '📢 Ask'}
                      </button>
                    )}
                  </div>
                </div>

                {evaluation && (
                  <div className="evaluation-details">
                    <div className="ai-badge">{evaluation.evaluationType}</div>
                    
                    <div className="ai-feedback">
                      <strong>AI Feedback:</strong>
                      <p>{evaluation.feedback}</p>
                    </div>
                    
                    {evaluation.strengths && evaluation.strengths.length > 0 && (
                      <div className="strengths-section">
                        <strong>✅ Strengths:</strong>
                        <ul>
                          {evaluation.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.improvements && evaluation.improvements.length > 0 && (
                      <div className="improvements-section">
                        <strong>📈 Improvements:</strong>
                        <ul>
                          {evaluation.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="concepts-match">
                      <strong>Covered Concepts:</strong>{' '}
                      {evaluation.matchedConcepts.length > 0 
                        ? evaluation.matchedConcepts.join(', ')
                        : 'None identified'}
                    </div>
                  </div>
                )}

                {!isAsked && (
                  <div className="expected-keywords">
                    <small>
                      <strong>Expected keywords (hidden during interview):</strong>{' '}
                      {q.keywords.join(', ')}
                    </small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="quick-actions">
          <button
            onClick={askNextQuestion}
            className="next-question-btn"
            disabled={currentQuestionIndex >= savedQuestions.length - 1}
          >
            ▶️ Ask Next Question
          </button>
        </div>
      </div>

      <div className="evaluation-summary">
        <h4>Evaluation Summary</h4>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-value">{askedQuestions.length}</div>
            <div className="card-label">Questions Asked</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{evaluations.filter(e => e).length}</div>
            <div className="card-label">Answers Received</div>
          </div>
          <div className="summary-card">
            <div className="card-value" style={{ color: getScoreColor(averageScore) }}>
              {averageScore.toFixed(1)}%
            </div>
            <div className="card-label">Average Score</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{savedQuestions.length - askedQuestions.length}</div>
            <div className="card-label">Questions Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
