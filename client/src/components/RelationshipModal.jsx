import React, { useState } from 'react';
import axios from '../api/axios.js';

function RelationshipModal({ isOpen, characters, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    source: '', target: '', label: '', type: 'family'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/relationships', formData);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">Forge Fateful Connection</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">Source Being</label>
            <select 
              className="form-select" 
              value={formData.source} 
              onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
              required
            >
              <option value="">Select Origin...</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Relationship Path</label>
            <input 
              className="form-input" 
              placeholder="e.g. Father of, Allied with, Avatar of"
              value={formData.label} 
              onChange={(e) => setFormData({ ...formData, label: e.target.value })} 
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">Target Being</label>
            <select 
              className="form-select" 
              value={formData.target} 
              onChange={(e) => setFormData({ ...formData, target: e.target.value })} 
              required
            >
              <option value="">Select Destination...</option>
              {characters.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Connection Nature</label>
            <select 
              className="form-select" 
              value={formData.type} 
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="family">FAMILY (Lineage)</option>
              <option value="divine">DIVINE (Sacred Link)</option>
              <option value="conflict">CONFLICT (Enemy/Rival)</option>
              <option value="alliance">ALLIANCE (Friend/Ally)</option>
              <option value="guru">GURU (Knowledge Path)</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Withdraw</button>
            <button type="submit" className="btn btn-primary">Seal Connection</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RelationshipModal;
