import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TemplateManagement.css';

export default function TemplateManagement() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    questions: [{ question: '', keywords: '', category: 'Technical', difficulty: 'Medium' }]
  });
  const [saving, setSaving] = useState(false);

  // Use environment variable for API URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const API_BASE = `${BACKEND_URL}/api/interviews/templates`;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setNewTemplate({
      ...newTemplate,
      questions: [...newTemplate.questions, { question: '', keywords: '', category: 'Technical', difficulty: 'Medium' }]
    });
  };

  const removeQuestion = (index) => {
    const updated = newTemplate.questions.filter((_, i) => i !== index);
    setNewTemplate({ ...newTemplate, questions: updated });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...newTemplate.questions];
    updated[index][field] = value;
    setNewTemplate({ ...newTemplate, questions: updated });
  };

  const createTemplate = async () => {
    if (!newTemplate.title.trim()) {
      alert('Please enter a template title!');
      return;
    }

    const validQuestions = newTemplate.questions.filter(q => q.question.trim() && q.keywords.trim());
    if (validQuestions.length === 0) {
      alert('Please add at least one question with keywords!');
      return;
    }

    setSaving(true);

    const formatted = {
      title: newTemplate.title,
      questions: validQuestions.map(q => ({
        question: q.question.trim(),
        keywords: q.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k),
        category: q.category,
        difficulty: q.difficulty
      }))
    };

    try {
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Template Created!\n\nID: ${data.templateId}\n\nYou can now use this template in interviews.`);
        setShowCreateForm(false);
        setNewTemplate({
          title: '',
          questions: [{ question: '', keywords: '', category: 'Technical', difficulty: 'Medium' }]
        });
        fetchTemplates();
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('❌ Error creating template: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id, title) => {
    if (!window.confirm(`Delete template "${title}"?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/interviews/templates/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Template deleted');
        fetchTemplates();
      }
    } catch (error) {
      alert('❌ Error deleting template');
    }
  };

  const copyTemplateId = (id) => {
    navigator.clipboard.writeText(id);
    alert('✅ Template ID copied to clipboard!');
  };

  return (
    <div className="template-management">
      <div className="tm-header">
        <div>
          <h1>📚 Interview Template Management</h1>
          <p>Create and manage interview question templates</p>
        </div>
        <button onClick={() => navigate('/joinInterview')} className="back-btn">
          ← Back to Interview
        </button>
      </div>

      <div className="tm-actions">
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-btn">
          {showCreateForm ? '✖ Cancel' : '➕ Create New Template'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h2>Create New Template</h2>
          
          <div className="form-group">
            <label>Template Title</label>
            <input
              type="text"
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              placeholder="e.g., Senior Frontend Developer Interview"
              className="title-input"
            />
          </div>

          <div className="questions-section">
            <div className="section-header">
              <h3>Questions & Keywords</h3>
              <button onClick={addQuestion} className="add-question-btn">
                ➕ Add Question
              </button>
            </div>

            {newTemplate.questions.map((q, index) => (
              <div key={index} className="question-card">
                <div className="card-header">
                  <span className="q-number">Q{index + 1}</span>
                  {newTemplate.questions.length > 1 && (
                    <button onClick={() => removeQuestion(index)} className="remove-btn">
                      🗑️ Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Question</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    placeholder="Enter your interview question..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Expected Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={q.keywords}
                    onChange={(e) => updateQuestion(index, 'keywords', e.target.value)}
                    placeholder="e.g., react, component, state, props, hooks"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={q.category}
                      onChange={(e) => updateQuestion(index, 'category', e.target.value)}
                    >
                      <option>Technical</option>
                      <option>Behavioral</option>
                      <option>Problem Solving</option>
                      <option>General</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => updateQuestion(index, 'difficulty', e.target.value)}
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

          <button onClick={createTemplate} disabled={saving} className="save-template-btn">
            {saving ? '⏳ Creating...' : '💾 Create Template'}
          </button>
         
        </div>
      )}

      <div className="templates-list">
        <h2>Existing Templates ({templates.length})</h2>

        {loading ? (
          <div className="loading">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <p>📭 No templates yet</p>
            <p>Create your first template to get started!</p>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template, index) => (
              <div key={template.id} className="template-item">
                <div className="template-badge">#{index + 1}</div>
                <h3>{template.title}</h3>
                <div className="template-meta">
                  <span>📝 {template.questionCount} Questions</span>
                  <span className={`status ${template.status}`}>
                    {template.status === 'ready' ? '✅ Ready' : '📋 Draft'}
                  </span>
                </div>
                <div className="template-id">
                  <small>ID:</small>
                  <code>{template.id}</code>
                </div>
                <div className="template-actions">
                  <button onClick={() => copyTemplateId(template.id)} className="copy-id-btn">
                    📋 Copy ID
                  </button>
                  <button onClick={() => deleteTemplate(template.id, template.title)} className="delete-btn">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
