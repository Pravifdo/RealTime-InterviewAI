import React, { useState } from 'react';
import './PreInterviewSetup.css';

export default function PreInterviewSetup({ socket, roomID, onSetupComplete }) {
  const [questions, setQuestions] = useState([
    { question: '', keywords: '', category: 'General', difficulty: 'Medium' }
  ]);
  const [title, setTitle] = useState('Technical Interview');
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', keywords: '', category: 'General', difficulty: 'Medium' }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const saveTemplate = () => {
    // Validate
    const validQuestions = questions.filter(q => q.question.trim() && q.keywords.trim());
    
    if (validQuestions.length === 0) {
      alert('Please add at least one question with keywords!');
      return;
    }

    setSaving(true);

    // Format questions for backend
    const formattedQuestions = validQuestions.map(q => ({
      question: q.question.trim(),
      keywords: q.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k),
      category: q.category,
      difficulty: q.difficulty
    }));

    // Emit to socket
    socket.emit('save-interview-template', {
      roomId: roomID,
      questions: formattedQuestions,
      title: title
    });

    // Listen for confirmation
    socket.once('template-saved', (response) => {
      setSaving(false);
      if (response.success) {
        alert(`✅ Interview template saved!\n${response.questionCount} questions ready.`);
        if (onSetupComplete) {
          onSetupComplete(formattedQuestions);
        }
      } else {
        alert('❌ Error saving template: ' + (response.error || 'Unknown error'));
      }
    });
  };

  return (
    <div className="pre-interview-setup">
      <div className="setup-header">
        <h2>🎯 Pre-Interview Setup</h2>
        <p>Add questions and expected keywords before starting the interview</p>
      </div>

      <div className="setup-form">
        <div className="form-group">
          <label>Interview Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Frontend Developer Interview"
            className="title-input"
          />
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h3>Questions & Keywords</h3>
            <button onClick={addQuestion} className="add-btn">
              ➕ Add Question
            </button>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(index)}
                    className="remove-btn"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Question</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    placeholder="Enter your interview question..."
                    rows="3"
                    className="question-textarea"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Expected Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={q.keywords}
                    onChange={(e) => updateQuestion(index, 'keywords', e.target.value)}
                    placeholder="e.g., react, component, state, props, hooks"
                    className="keywords-input"
                  />
                  <small className="hint">
                    💡 These keywords will be used to automatically score answers
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={q.category}
                    onChange={(e) => updateQuestion(index, 'category', e.target.value)}
                    className="select-input"
                  >
                    <option>General</option>
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>Problem Solving</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={q.difficulty}
                    onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
                    className="select-input"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="setup-actions">
          <button
            onClick={saveTemplate}
            disabled={saving}
            className="save-btn"
          >
            {saving ? '⏳ Saving...' : '💾 Save & Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
