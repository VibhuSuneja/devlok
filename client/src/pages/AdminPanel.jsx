import React, { useState, useEffect } from 'react';
import axios from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import CharacterModal from '../components/CharacterModal.jsx';
import RelationshipModal from '../components/RelationshipModal.jsx';

// ── Auth header helper (avoids repeating throughout) ─────────────────────────
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('devlok_token')}` },
});

function AdminPanel() {
  const [activeTab, setActiveTab]           = useState('entities');
  const [characters, setCharacters]         = useState([]);
  const [relationships, setRelationships]   = useState([]);
  const [submissions, setSubmissions]       = useState([]);
  const [gurkulWaitlist, setGurkulWaitlist] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 900);
  const [characterModal, setCharacterModal]   = useState({ open: false, data: null });
  const [relationshipModal, setRelationshipModal] = useState({ open: false, data: null });
  const { logout } = useAuth();

  // Track viewport width for responsive toggle
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [charRes, relRes, subRes, waitlistRes] = await Promise.all([
        axios.get('/characters'),
        axios.get('/relationships'),
        axios.get('/submissions', authHeader()),
        axios.get('/gurukul/waitlist', authHeader()),
      ]);
      setCharacters(charRes.data);
      setRelationships(relRes.data);
      setSubmissions(subRes.data);
      setGurkulWaitlist(waitlistRes.data?.entries || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleReviewSubmission = async (id, status) => {
    if (window.confirm(`Are you sure you want to ${status} this submission?`)) {
      try {
        await axios.put(`/submissions/${id}/review`, { status }, authHeader());
        fetchData();
      } catch (err) {
        console.error('Review error:', err);
        alert(err.response?.data?.message || 'Failed to review submission');
      }
    }
  };

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

  const tabs = [
    { id: 'entities',    label: 'Entities' },
    { id: 'connections', label: 'Connections' },
    { id: 'submissions', label: `Queue${submissions.length > 0 ? ` (${submissions.length})` : ''}` },
    { id: 'gurukul',     label: `Gurukul${gurkulWaitlist.length > 0 ? ` (${gurkulWaitlist.length})` : ''}` },
  ];

  return (
    <div className="admin-page">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="admin-header-bar">
        <h1 className="admin-header-title">ARCHIVIST CORE</h1>

        <div className="admin-tab-row">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`btn btn-cancel admin-tab-btn ${activeTab === t.id ? 'active-tab' : ''}`}
              style={{ borderColor: activeTab === t.id ? (t.id === 'gurukul' ? 'var(--sacred)' : 'var(--amber)') : '' }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-session-controls">
          <button className="btn btn-cancel" onClick={logout}>Sever Session</button>
          <a href="/" className="btn btn-primary">The Map</a>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="admin-content">

        {/* ENTITIES */}
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

            {isMobile ? (
              <div className="admin-card-list">
                {characters.map(c => (
                  <div key={c.id} className="admin-card">
                    <div className="admin-card-head">
                      <span className="admin-card-label">{c.label}</span>
                      <span className="admin-card-badge" style={{ color: 'var(--amber-dim)' }}>{c.type}</span>
                    </div>
                    <div className="admin-card-meta">
                      <span className="admin-card-field">ID: <code>{c.id}</code></span>
                      <span className="admin-card-field">Yuga: {c.yuga}</span>
                    </div>
                    <div className="admin-card-actions">
                      <button className="btn btn-cancel admin-touch-btn" onClick={() => setCharacterModal({ open: true, data: c })}>Edit</button>
                      <button className="btn btn-danger admin-touch-btn" onClick={async () => {
                        if (window.confirm(`Dissolve ${c.label}?`)) {
                          await axios.delete(`/characters/${c.id}`);
                          fetchData();
                        }
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Label</th><th>Type</th><th>Yuga</th><th>Action</th></tr>
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
            )}
          </>
        )}

        {/* CONNECTIONS */}
        {activeTab === 'connections' && (
          <>
            <div className="admin-section-header">
              <h2 className="admin-section-title">CONNECTIONS ({relationships.length})</h2>
              <button className="btn btn-primary" onClick={() => setRelationshipModal({ open: true, data: null })}>
                + Link Fates
              </button>
            </div>

            {isMobile ? (
              <div className="admin-card-list">
                {relationships.map(r => (
                  <div key={r._id} className="admin-card">
                    <div className="admin-card-head">
                      <span className="admin-card-label">{r.source}</span>
                      <span className="admin-card-badge" style={{ color: 'var(--amber-dim)' }}>→ {r.target}</span>
                    </div>
                    <div className="admin-card-meta">
                      <span className="admin-card-field">{r.label} <span style={{ opacity: 0.5 }}>({r.type})</span></span>
                    </div>
                    <div className="admin-card-actions">
                      <button className="btn btn-danger admin-touch-btn" onClick={async () => {
                        if (window.confirm(`Sever connection?`)) {
                          await axios.delete(`/relationships/${r._id}`);
                          fetchData();
                        }
                      }}>Sever</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Source</th><th>Type</th><th>Target</th><th>Action</th></tr>
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
            )}
          </>
        )}

        {/* SUBMISSION QUEUE */}
        {activeTab === 'submissions' && (
          <>
            <div className="admin-section-header">
              <h2 className="admin-section-title">CONTRIBUTION QUEUE ({submissions.length})</h2>
            </div>

            {submissions.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                The queue is empty. No scholarly contributions pending.
              </p>
            ) : isMobile ? (
              <div className="admin-card-list">
                {submissions.map(s => {
                  const char = characters.find(c => c.id === s.targetId);
                  return (
                    <div key={s._id} className="admin-card admin-card--submission">
                      <div className="admin-card-head">
                        <span className="admin-card-label">
                          {s.type === 'correction' ? `Correction: ${char?.label || s.targetId}` : 'New Entry'}
                        </span>
                        <span className="admin-card-badge" style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="admin-card-meta">
                        <span className="admin-card-field">Scholar: <strong>{s.user?.name || 'Unknown'}</strong></span>
                        {s.type === 'correction' && (
                          <span className="admin-card-field">
                            Field: {s.data?.field} → <em>{s.data?.newValue}</em>
                          </span>
                        )}
                      </div>
                      {s.sourceCitation && (
                        <div className="admin-card-citation">
                          <span className="admin-card-citation-label">Citation</span>
                          {s.sourceCitation}
                        </div>
                      )}
                      <div className="admin-card-actions">
                        <button className="btn btn-primary admin-touch-btn" onClick={() => handleReviewSubmission(s._id, 'approved')}>✦ Approve</button>
                        <button className="btn btn-danger admin-touch-btn" onClick={() => handleReviewSubmission(s._id, 'rejected')}>Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Date</th><th>User</th><th>Correction / Source</th><th>Action</th></tr>
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

        {/* GURUKUL WAITLIST */}
        {activeTab === 'gurukul' && (
          <>
            <div className="admin-section-header">
              <h2 className="admin-section-title">GURUKUL WAITLIST ({gurkulWaitlist.length} / 20)</h2>
              <div style={{
                background: 'rgba(92,184,138,0.1)', border: '1px solid rgba(92,184,138,0.3)',
                padding: '6px 16px', fontSize: '0.78rem', color: 'var(--sacred)', borderRadius: '2px',
              }}>
                {Math.round((Math.min(gurkulWaitlist.length, 20) / 20) * 100)}% to launch
              </div>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(92,184,138,0.06)', border: '1px solid rgba(92,184,138,0.15)', padding: '16px 20px', borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                <span>{Math.min(gurkulWaitlist.length, 20)} of 20 seekers joined</span>
                <span>{Math.max(0, 20 - gurkulWaitlist.length)} remaining to open cohort</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(92,184,138,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((Math.min(gurkulWaitlist.length, 20) / 20) * 100)}%`,
                  background: 'linear-gradient(90deg, #3a9a6a, #5cb88a)',
                  transition: 'width 0.8s ease', boxShadow: '0 0 10px rgba(92,184,138,0.5)',
                }} />
              </div>
            </div>

            {gurkulWaitlist.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                No waitlist entries yet. Share the /gurukul link to start collecting signups.
              </p>
            ) : isMobile ? (
              <div className="admin-card-list">
                {gurkulWaitlist.map((entry, i) => (
                  <div key={entry._id} className="admin-card">
                    <div className="admin-card-head">
                      <span style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: '0.7rem', color: 'var(--amber-dim)' }}>#{i + 1}</span>
                      <span className="admin-card-badge">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-card-meta">
                      <span className="admin-card-field" style={{ fontWeight: 500, color: 'var(--text)' }}>{entry.email}</span>
                      <span className="admin-card-field">{entry.name || '—'} · <span style={{ opacity: 0.6 }}>{entry.source}</span></span>
                    </div>
                    <div className="admin-card-actions">
                      <button className="btn btn-danger admin-touch-btn" onClick={async () => {
                        if (window.confirm(`Remove ${entry.email} from waitlist?`)) {
                          try {
                            await axios.delete(`/gurukul/waitlist/${entry._id}`, authHeader());
                            fetchData();
                          } catch (e) { alert('Failed to delete'); }
                        }
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>Email</th><th>Name</th><th>Source</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {gurkulWaitlist.map((entry, i) => (
                    <tr key={entry._id}>
                      <td style={{ color: 'var(--amber-dim)', fontFamily: '"Cinzel Decorative", serif', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>{entry.email}</td>
                      <td style={{ color: 'var(--text-dim)' }}>{entry.name || '—'}</td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{entry.source}</td>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger" style={{ fontSize: '0.7rem', padding: '4px 10px' }} onClick={async () => {
                          if (window.confirm(`Remove ${entry.email} from waitlist?`)) {
                            try {
                              await axios.delete(`/gurukul/waitlist/${entry._id}`, authHeader());
                              fetchData();
                            } catch (e) { alert('Failed to delete'); }
                          }
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))}
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
