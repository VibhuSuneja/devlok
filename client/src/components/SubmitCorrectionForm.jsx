import React, { useState, useContext } from 'react';
import axios from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { useSound } from '../hooks/useSound.js';

function SubmitCorrectionForm({ node, onCancel, onSuccess }) {
  const [field, setField] = useState('desc');
  const [newValue, setNewValue] = useState('');
  const [sourceCitation, setSourceCitation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { playSound } = useSound();
  const { updateUser, user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!sourceCitation || sourceCitation.trim().length < 5) {
      setError('A meaningful scriptural source citation is strictly required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post('/submissions', {
        type: 'correction',
        targetId: node.id,
        data: { field, newValue },
        sourceCitation
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('devlok_token')}`
        }
      });
      
      // Update UI state points locally to avoid needing a full refetch
      if (user) {
        updateUser({ shraddha: (user.shraddha || 0) + 50 });
      }
      playSound('shraddha');
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="correction-form-container">
      <h4 className="correction-title">Suggest a Correction for {node.label}</h4>
      <p className="correction-subtitle">
        Help preserve the authenticity of Devlok. Verified corrections award +250 Shraddha.
      </p>

      {error && <div className="correction-error">{error}</div>}

      <form onSubmit={handleSubmit} className="correction-form">
        <div className="form-group">
          <label>Aspect to correct:</label>
          <select value={field} onChange={(e) => setField(e.target.value)}>
            <option value="desc">Origin & Essence (Description)</option>
            <option value="source">Chronicles (Sources)</option>
            <option value="sanskrit">Sanskrit Name</option>
          </select>
        </div>

        <div className="form-group">
          <label>Proposed New Text:</label>
          <textarea 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)}
            required
            rows={4}
            placeholder="Provide the accurate text based on the source..."
          />
        </div>

        <div className="form-group">
          <label className="required-label">Scriptural Source Citation (Required):</label>
          <input 
            type="text" 
            value={sourceCitation} 
            onChange={(e) => setSourceCitation(e.target.value)}
            required
            placeholder="e.g. Mahabharata, Adi Parva, Ch 12"
          />
          <small className="source-hint">No source = No entry. Devlok relies on canonical texts.</small>
        </div>

        <div className="correction-actions">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubmitCorrectionForm;
