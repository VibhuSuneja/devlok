import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import CharacterModal from '../components/CharacterModal.jsx';
import RelationshipModal from '../components/RelationshipModal.jsx';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('entities'); // entities | connections | submissions
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [characterModal, setCharacterModal] = useState({ open: false, data: null });
  const [relationshipModal, setRelationshipModal] = useState({ open: false, data: null });
  const { logout } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [charRes, relRes, subRes] = await Promise.all([
        axios.get('/characters'),
        axios.get('/relationships'),
        axios.get('/submissions', { headers: { Authorization: `Bearer ${localStorage.getItem('devlok_token')}` } })
      ]);
      setCharacters(charRes.data);
      setRelationships(relRes.data);
      setSubmissions(subRes.data);
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

  const handleReviewSubmission = async (id, status) => {
    if (window.confirm(`Are you sure you want to ${status} this submission?`)) {
      try {
        await axios.put(`/submissions/${id}/review`, { status }, { 
          headers: { Authorization: `Bearer ${localStorage.getItem('devlok_token')}` } 
        });
        fetchData();
      } catch (err) {
        console.error('Review error:', err);
        alert(err.response?.data?.message || 'Failed to review submission');
      }
    }
  };

  if (loading) return null;

  return (
    <div className="admin-page">
      <div className="admin-header-bar">
        <h1 className="admin-header-title">ARCHIVIST CORE</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn btn-cancel ${activeTab === 'entities' ? 'active-tab' : ''}`} onClick={() => setActiveTab('entities')} style={{borderColor: activeTab === 'entities' ? 'var(--amber)' : ''}}>Entities</button>
          <button className={`btn btn-cancel ${activeTab === 'connections' ? 'active-tab' : ''}`} onClick={() => setActiveTab('connections')} style={{borderColor: activeTab === 'connections' ? 'var(--amber)' : ''}}>Connections</button>
          <button className={`btn btn-cancel ${activeTab === 'submissions' ? 'active-tab' : ''}`} onClick={() => setActiveTab('submissions')} style={{borderColor: activeTab === 'submissions' ? 'var(--amber)' : ''}}>
            Queue {submissions.length > 0 && `(${submissions.length})`}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-cancel" onClick={logout}>Sever Session</button>
          <a href="/" className="btn btn-primary">The Map</a>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'entities' && (
          <>
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
          </>
        )}

        {activeTab === 'connections' && (
          <>
            <div className="admin-section-header">
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
          </>
        )}

        {activeTab === 'submissions' && (
          <>
            <div className="admin-section-header">
              <h2 className="admin-section-title">CONTRIBUTION QUEUE ({submissions.length})</h2>
            </div>
            
            {submissions.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>The queue is empty. No scholarly contributions pending.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Correction / Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(s => {
                    const char = characters.find(c => c.id === s.targetId);
                    return (
                      <tr key={s._id}>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>{s.user?.name || 'Unknown Scholar'}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--amber-dim)', marginBottom: '4px' }}>
                            {s.type === 'correction' ? `Correction on [${char?.label || s.targetId}]` : 'New Entry'}
                          </div>
                          {s.type === 'correction' && (
                            <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                              <span style={{ opacity: 0.6 }}>Field: </span> {s.data?.field} <br/>
                              <span style={{ opacity: 0.6 }}>Proposed: </span> {s.data?.newValue}
                            </div>
                          )}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Citation</span>
                            {s.sourceCitation}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="btn btn-primary" onClick={() => handleReviewSubmission(s._id, 'approved')}>Approve</button>
                            <button className="btn btn-danger" onClick={() => handleReviewSubmission(s._id, 'rejected')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

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
