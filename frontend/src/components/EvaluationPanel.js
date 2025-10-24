import React, { useState, useEffect } from 'react';
import './EvaluationPanel.css';

export default function EvaluationPanel({ socket, roomID }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentKeywords, setCurrentKeywords] = useState('');
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (!socket) return;

    // Listen for answer evaluations
    socket.on('answer-evaluated', (data) => {
      console.log('Answer evaluated:', data);
      
      const { questionIndex, answer, evaluation } = data;
      
      // Update answers
      setAnswers(prev => {
        const updated = [...prev];
        updated[questionIndex] = {
          answer,
          ...evaluation
        };
        return updated;
      });
      
      // Update scores
      setScores(prev => {
        const updated = [...prev];
        updated[questionIndex] = evaluation.score;
        return updated;
      });
    });

    // Listen for score updates
    socket.on('scores-updated', (data) => {
      console.log('Scores updated:', data);
      setAverageScore(data.averageScore);
      setTotalQuestions(data.totalQuestions);
      if (data.scores) {
        setScores(data.scores);
      }
    });

    // Listen for new answers (from participant)
    socket.on('new-answer', (answerData) => {
      console.log('New answer received:', answerData);
    });

    return () => {
      socket.off('answer-evaluated');
      socket.off('scores-updated');
      socket.off('new-answer');
    };
  }, [socket]);

  const sendQuestion = () => {
    if (!currentQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    // Extract keywords from input (comma-separated)
    const keywords = currentKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const questionData = {
      question: currentQuestion,
      keywords: keywords.length > 0 ? keywords : []
    };

    const questionIndex = questions.length;

    // Emit question
    socket.emit('new-question', questionData);
    
    // Save question with keywords
    socket.emit('save-question', {
      question: currentQuestion,
      keywords: questionData.keywords,
      roomID,
      questionIndex
    });

    // Add to local state
    setQuestions(prev => [...prev, questionData]);

    // Clear inputs
    setCurrentQuestion('');
    setCurrentKeywords('');

    console.log('Question sent:', questionData);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="evaluation-panel">
      {/* Score Dashboard */}
      <div className="score-dashboard">
        <div className="score-card main-score">
          <div className="score-label">Average Score</div>
          <div className="score-value" style={{ color: getScoreColor(averageScore) }}>
            {averageScore.toFixed(1)}%
          </div>
          <div className="score-sublabel">{totalQuestions} Questions</div>
        </div>
        
        <div className="score-breakdown">
          {scores.map((score, index) => (
            <div key={index} className="mini-score-card">
              <div className="mini-score-label">Q{index + 1}</div>
              <div className="mini-score-value" style={{ color: getScoreColor(score) }}>
                {score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Input */}
      <div className="question-input-section">
        <h3>📝 Ask Question</h3>
        <textarea
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="question-input"
          rows="3"
        />
        
        <input
          type="text"
          value={currentKeywords}
          onChange={(e) => setCurrentKeywords(e.target.value)}
          placeholder="Expected keywords (comma-separated): e.g. react, component, state"
          className="keywords-input"
        />
        
        <button onClick={sendQuestion} className="send-question-btn">
          Send Question
        </button>
        
        <p className="hint">
          💡 Add keywords to enable automatic scoring. Leave empty for auto-extraction.
        </p>
      </div>

      {/* Questions & Answers History */}
      <div className="qa-history">
        <h3>📋 Questions & Answers</h3>
        {questions.map((q, index) => (
          <div key={index} className="qa-item">
            <div className="qa-question">
              <div className="qa-header">
                <span className="qa-number">Q{index + 1}</span>
                <span className="qa-keywords">
                  Keywords: {q.keywords.length > 0 ? q.keywords.join(', ') : 'Auto-extracted'}
                </span>
              </div>
              <div className="qa-text">{q.question}</div>
            </div>
            
            {answers[index] && (
              <div className="qa-answer">
                <div className="qa-header">
                  <span className="answer-label">Answer</span>
                  <span className="answer-score" style={{ color: getScoreColor(answers[index].score) }}>
                    Score: {answers[index].score}%
                  </span>
                </div>
                <div className="qa-text">{answers[index].answer}</div>
                
                {answers[index].matchedKeywords && answers[index].matchedKeywords.length > 0 && (
                  <div className="keyword-match">
                    <span className="match-label">✅ Matched Keywords:</span>
                    <span className="matched-keywords">
                      {answers[index].matchedKeywords.join(', ')}
                    </span>
                  </div>
                )}
                
                {answers[index].participantKeywords && (
                  <div className="keyword-match">
                    <span className="match-label">🔑 Participant Keywords:</span>
                    <span className="participant-keywords">
                      {answers[index].participantKeywords.join(', ')}
                    </span>
                  </div>
                )}
                
                <div className="match-percentage">
                  Match: {answers[index].matchPercentage}%
                </div>
              </div>
            )}
            
            {!answers[index] && (
              <div className="waiting-answer">
                Waiting for answer...
              </div>
            )}
          </div>
        ))}
        
        {questions.length === 0 && (
          <div className="empty-state">
            No questions asked yet. Start by asking a question above.
          </div>
        )}
      </div>
    </div>
  );
}
