import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from '../api/axios.js';

// ── Shraddha ranks (mirror server) ───────────────────────────────────────────
const RANKS = [
  { min: 0,    label: 'Curious Seeker',       next: 100 },
  { min: 100,  label: 'Student of the Epics', next: 300 },
  { min: 300,  label: 'Devoted Reader',        next: 600 },
  { min: 600,  label: 'Dharma Scholar',        next: 1000 },
  { min: 1000, label: 'Mahapandit',            next: 2000 },
  { min: 2000, label: 'Chiranjivi',            next: null },
];

function getRankInfo(points) {
  let r = RANKS[0];
  for (const rank of RANKS) {
    if (points >= rank.min) r = rank;
  }
  const progress = r.next ? Math.min(100, Math.round(((points - r.min) / (r.next - r.min)) * 100)) : 100;
  return { label: r.label, progress, next: r.next };
}

const NODE_COLORS = {
  deva: '#d4973a', devi: '#c45c8a',  hero: '#5c8ac4',
  sage: '#5cb88a', asura: '#c45c5c', celestial: '#9a6ed4',
};

const TOTAL_CONCEPTS = 30; // TODO: update this when concepts.json grows beyond 30

export default function ProfilePage() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookmarkedChars, setBookmarkedChars] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get('/users/bookmarks')
      .then(res => setBookmarkedChars(res.data))
      .catch(err => console.error('Bookmark fetch error:', err))
      .finally(() => setLoadingBookmarks(false));
  }, [user]);

  if (!user) return null;

  const { label: rankLabel, progress: rankProgress, next: rankNext } = getRankInfo(user.shraddha || 0);
  const conceptsReadCount = user.conceptsRead?.length || 0;
  const conceptProgress = Math.round((conceptsReadCount / TOTAL_CONCEPTS) * 100);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      {/* ── Back link ── */}
      <Link to="/" className="profile-back">← Back to the Graph</Link>

      {/* ── Profile header ── */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <div className="shraddha-badge">
            <span className="shraddha-icon">✦</span>
            <span className="shraddha-points">{user.shraddha || 0} Shraddha</span>
            <span className="shraddha-rank">{rankLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Shraddha progress to next rank ── */}
      {rankNext && (
        <div className="profile-section">
          <h2 className="profile-section-title">Path to {RANKS.find(r => r.min > (user.shraddha || 0))?.label || 'Chiranjivi'}</h2>
          <div className="reading-progress-bar">
            <div className="reading-progress-fill" style={{ width: `${rankProgress}%` }} />
          </div>
          <p className="reading-progress-label">{user.shraddha || 0} / {rankNext} Shraddha</p>
        </div>
      )}

      {/* ── Bookmarks ── */}
      <div className="profile-section">
        <div className="profile-section-header">
          <h2 className="profile-section-title">
            BOOKMARKED BEINGS
            <span className="profile-count">({bookmarkedChars.length})</span>
          </h2>
          {bookmarkedChars.length > 0 && (
            <Link to={`/constellation?ids=${bookmarkedChars.map(c => c.id).join(',')}`} className="view-constellation-link">
              View as Constellation →
            </Link>
          )}
        </div>

        {loadingBookmarks ? (
          <p className="profile-loading">Loading your constellation…</p>
        ) : bookmarkedChars.length === 0 ? (
          <div className="profile-empty">
            <p className="profile-empty-text">Your constellation is empty.</p>
            <p className="profile-empty-sub">Click ☆ on any character in the graph to save them here.</p>
            <Link to="/" className="profile-explore-btn">Explore the Graph →</Link>
          </div>
        ) : (
          <div className="bookmark-grid">
            {bookmarkedChars.map(char => (
              <Link
                key={char.id}
                to={`/character/${char.id}`}
                className="character-card-mini"
                style={{ borderColor: `${NODE_COLORS[char.type] || '#d4973a'}33` }}
              >
                <span className="char-mini-dot" style={{ background: NODE_COLORS[char.type] || '#d4973a' }} />
                <span className="char-mini-sanskrit">{char.sanskrit}</span>
                <span className="char-mini-label">{char.label}</span>
                <span className="char-mini-type" style={{ color: NODE_COLORS[char.type] || '#d4973a' }}>{char.type}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Concepts Read ── */}
      <div className="profile-section">
        <h2 className="profile-section-title">
          CONCEPTS READ
          <span className="profile-count">({conceptsReadCount} / {TOTAL_CONCEPTS})</span>
        </h2>
        <div className="reading-progress-bar">
          <div className="reading-progress-fill" style={{ width: `${conceptProgress}%` }} />
        </div>
        <p className="reading-progress-label">{conceptProgress}% of the current library explored</p>
        <Link to="/today" className="profile-explore-btn" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
          Read Today's Concept →
        </Link>
      </div>

      {/* ── Shraddha breakdown ── */}
      <div className="profile-section shraddha-breakdown">
        <h2 className="profile-section-title">HOW TO EARN SHRADDHA</h2>
        <div className="shraddha-table">
          <div className="shraddha-row"><span>Bookmark a character</span><span className="shraddha-reward">+5</span></div>
          <div className="shraddha-row"><span>Read a daily concept</span><span className="shraddha-reward">+10</span></div>
          <div className="shraddha-row"><span>Submit a contribution</span><span className="shraddha-reward">+50</span></div>
          <div className="shraddha-row"><span>Contribution approved</span><span className="shraddha-reward">+200</span></div>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div className="profile-footer">
        <button className="profile-logout-btn" onClick={handleLogout}>Sign out</button>
      </div>
    </div>
  );
}
