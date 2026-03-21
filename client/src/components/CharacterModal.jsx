import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';

function CharacterModal({ isOpen, data, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    id: '', label: '', type: 'deva', size: 15, filter: 'purana', yuga: 'eternal', sanskrit: '', epithets: [], desc: '', source: ''
  });

  useEffect(() => {
    if (data) setFormData({ ...data, epithetsString: data.epithets?.join(', ') || '' });
    else setFormData({ id: '', label: '', type: 'deva', size: 15, filter: 'purana', yuga: 'eternal', sanskrit: '', epithets: [], epithetsString: '', desc: '', source: '' });
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const epithets = formData.epithetsString?.split(',').map(s => s.trim()).filter(s => s) || [];
    try {
      if (data) await axios.put(`/characters/${data.id}`, { ...formData, epithets });
      else await axios.post('/characters', { ...formData, epithets });
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
        <h2 className="modal-title">{data ? 'Aura Refinement' : 'New Divine Manifestation'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row-split">
            <div className="form-row">
              <label className="form-label">Internal ID</label>
              <input 
                className="form-input" 
                value={formData.id} 
                onChange={(e) => setFormData({ ...formData, id: e.target.value })} 
                disabled={!!data}
                required
              />
            </div>
            <div className="form-row">
              <label className="form-label">Display Label</label>
              <input 
                className="form-input" 
                value={formData.label} 
                onChange={(e) => setFormData({ ...formData, label: e.target.value })} 
                required
              />
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label className="form-label">Entity Essence</label>
              <select 
                className="form-select" 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="deva">DEVA</option>
                <option value="devi">DEVI</option>
                <option value="hero">HERO</option>
                <option value="asura">ASURA</option>
                <option value="sage">SAGE</option>
                <option value="celestial">CELESTIAL</option>
                <option value="avatar">AVATAR</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Yuga Era</label>
              <select 
                className="form-select" 
                value={formData.yuga} 
                onChange={(e) => setFormData({ ...formData, yuga: e.target.value })}
              >
                <option value="satya">SATYA</option>
                <option value="treta">TRETA</option>
                <option value="dvapara">DVAPARA</option>
                <option value="kali">KALI</option>
                <option value="eternal">ETERNAL</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Sanskrit Name</label>
            <input 
              className="form-input" 
              value={formData.sanskrit} 
              onChange={(e) => setFormData({ ...formData, sanskrit: e.target.value })} 
            />
          </div>

          <div className="form-row">
            <label className="form-label">Divine Epithets (Comma separated)</label>
            <input 
              className="form-input" 
              value={formData.epithetsString} 
              onChange={(e) => setFormData({ ...formData, epithetsString: e.target.value })} 
            />
          </div>

          <div className="form-row">
            <label className="form-label">Sacred Descriptions & Chronicles</label>
            <textarea 
              className="form-textarea" 
              value={formData.desc} 
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })} 
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>Withdraw</button>
            <button type="submit" className="btn btn-primary">Sacrifice (Save)</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CharacterModal;
