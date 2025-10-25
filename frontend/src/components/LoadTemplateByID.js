import React, { useState, useEffect } from 'react';
import './LoadTemplateByID.css';

export default function LoadTemplateByID({ socket, roomID, onTemplateLoaded }) {
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Fetch available templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/interviews/templates`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadTemplate = (id) => {
    if (!id) {
      alert('Please select or enter a template ID');
      return;
    }

    setLoading(true);
    console.log(`Loading template ID: ${id} for room: ${roomID}`);

    socket.emit('load-template-by-id', {
      templateId: id,
      roomId: roomID
    });

    socket.once('template-loaded', (response) => {
      setLoading(false);
      if (response.success) {
        console.log(`✅ Template "${response.title}" loaded with ${response.questions.length} questions`);
        alert(`✅ Template Loaded!\n\nTitle: ${response.title}\nQuestions: ${response.questions.length}`);
        
        if (onTemplateLoaded) {
          onTemplateLoaded(response.questions, response.templateId);
        }
      } else {
        alert('❌ Error loading template: ' + (response.error || 'Template not found'));
        console.error('Template load error:', response.error);
      }
    });
  };

  const selectTemplate = (template) => {
    setTemplateId(template.id);
    loadTemplate(template.id);
  };

  return (
    <div className="load-template-container">
      <div className="load-header">
        <div>
          <h2>📚 Load Interview Template</h2>
          <p>Select a pre-saved interview template to start</p>
        </div>
        <a href="/templates" target="_blank" rel="noopener noreferrer" className="manage-link">
          ⚙️ Manage Templates
        </a>
      </div>

      {loadingTemplates ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available templates...</p>
        </div>
      ) : availableTemplates.length > 0 ? (
        <div className="templates-grid">
          {availableTemplates.map((template, index) => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => selectTemplate(template)}
            >
              <div className="template-number">#{index + 1}</div>
              <h3>{template.title}</h3>
              <div className="template-info">
                <span className="question-count">
                  📝 {template.questionCount} Questions
                </span>
                <span className="template-status">
                  {template.status === 'ready' ? '✅ Ready' : '📋 Draft'}
                </span>
              </div>
              <button className="select-btn">
                Select Template
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-templates">
          <p>📭 No templates found</p>
          <small>Create templates using the management panel</small>
        </div>
      )}

      <div className="divider">
        <span>OR</span>
      </div>

      <div className="manual-input">
        <div className="input-group">
          <label>Enter Template ID Manually</label>
          <div className="input-row">
            <input
              type="text"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              placeholder="e.g., 673a5f8c9d1e2f3a4b5c6d7e"
              className="template-id-input"
              disabled={loading}
            />
            <button
              onClick={() => loadTemplate(templateId)}
              disabled={loading || !templateId.trim()}
              className="load-btn"
            >
              {loading ? '⏳ Loading...' : '🚀 Load Template'}
            </button>
          </div>
        </div>
      </div>

      <div className="helper-text">
        <p>💡 <strong>Quick Start:</strong></p>
        <ul>
          <li>Click on a template card to load it instantly</li>
          <li>Or enter a template ID manually and click "Load Template"</li>
          <li>Questions and keywords will be loaded automatically</li>
        </ul>
      </div>
    </div>
  );
}
