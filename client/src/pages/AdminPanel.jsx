import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import CharacterModal from '../components/CharacterModal.jsx';
import RelationshipModal from '../components/RelationshipModal.jsx';

function AdminPanel() {
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [characterModal, setCharacterModal] = useState({ open: false, data: null });
  const [relationshipModal, setRelationshipModal] = useState({ open: false, data: null });
  const { logout } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [charRes, relRes] = await Promise.all([
        axios.get('/characters'),
        axios.get('/relationships')
      ]);
      setCharacters(charRes.data);
      setRelationships(relRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearCharacters = async () => {
    if (window.confirm('Archive all characters? This action is terminal.')) {
      try {
        await Promise.all(characters.map(c => axios.delete(`/characters/${c.id}`)));
        fetchData();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) return null;

  return (
    <div className="admin-page">
      <div className="admin-header-bar">
        <h1 className="admin-header-title">ARCHIVIST CORE</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-cancel" onClick={logout}>Sever Session</button>
          <a href="/" className="btn btn-primary">The Map</a>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-section-header">
          <h2 className="admin-section-title">ENTITIES ({characters.length})</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-danger" onClick={clearCharacters}>Purge All</button>
            <button className="btn btn-primary" onClick={() => setCharacterModal({ open: true, data: null })}>
              + New Avatar
            </button>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Label</th>
              <th>Type</th>
              <th>Yuga</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {characters.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td style={{ fontWeight: '500' }}>{c.label}</td>
                <td>{c.type}</td>
                <td>{c.yuga}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-cancel" onClick={() => setCharacterModal({ open: true, data: c })}>Edit</button>
                  <button className="btn btn-danger" onClick={async () => {
                    if (window.confirm(`Dissolve ${c.label}?`)) {
                      await axios.delete(`/characters/${c.id}`);
                      fetchData();
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Similar table for relationships if needed */}
        <div className="admin-section-header" style={{ marginTop: '40px' }}>
          <h2 className="admin-section-title">CONNECTIONS ({relationships.length})</h2>
          <button className="btn btn-primary" onClick={() => setRelationshipModal({ open: true, data: null })}>
            + Link Fates
          </button>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Target</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {relationships.map(r => (
              <tr key={r._id}>
                <td>{r.source}</td>
                <td style={{ color: 'var(--amber-dim)' }}>{r.label} ({r.type})</td>
                <td>{r.target}</td>
                <td>
                  <button className="btn btn-danger" onClick={async () => {
                    if (window.confirm(`Sever connection?`)) {
                      await axios.delete(`/relationships/${r._id}`);
                      fetchData();
                    }
                  }}>Sever</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CharacterModal 
        isOpen={characterModal.open} 
        data={characterModal.data}
        onClose={() => setCharacterModal({ open: false, data: null })}
        onSaved={fetchData}
      />

      <RelationshipModal 
        isOpen={relationshipModal.open} 
        data={relationshipModal.data}
        characters={characters}
        onClose={() => setRelationshipModal({ open: false, data: null })}
        onSaved={fetchData}
      />
    </div>
  );
}

export default AdminPanel;
