import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { useBookmarks } from '../hooks/useBookmarks.js';

const COLORS = {
  deva: '#d4973a', devi: '#c45c8a', hero: '#5c8ac4',
  sage: '#5cb88a', asura: '#c45c5c', celestial: '#9a6ed4',
  avatar: '#ffab00', darshana: '#a0c4dc'
};

function CharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(AuthContext);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);

  // Initials for header avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  useEffect(() => {
    const fetchChar = async () => {
      try {
        const res = await axios.get(`/characters/${id}`);
        setCharacter(res.data);
        document.title = `${res.data.label} — Devlok`;

        const updateMeta = (name, property, content) => {
          let tag = document.querySelector(`meta[${name ? `name="${name}"` : `property="${property}"`}]`);
          if (!tag) {
            tag = document.createElement('meta');
            if (name) tag.setAttribute('name', name);
            if (property) tag.setAttribute('property', property);
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        };

        const descSnippet = res.data.desc ? res.data.desc.substring(0, 150) : '';
        updateMeta('description', null, descSnippet);
        updateMeta(null, 'og:title', `${res.data.label} | Devlok`);
        updateMeta(null, 'og:description', descSnippet);
        updateMeta(null, 'og:url', window.location.href);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchChar();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 2500);
      return;
    }
    setBmLoading(true);
    await toggleBookmark(id);
    setBmLoading(false);
  };

  const bookmarked = isBookmarked(id);

  if (loading) return (
    <div style={{ position:'fixed', inset:0, background:'var(--void)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'"Cinzel Decorative", serif', color:'var(--amber-glow)', fontSize:'1rem', letterSpacing:'.3em' }}>Summoning...</div>
    </div>
  );
  if (error || !character) return (
    <div style={{ position:'fixed', inset:0, background:'var(--void)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'20px' }}>
      <div style={{ fontFamily:'"Cinzel Decorative", serif', color:'var(--text-dim)', fontSize:'.9rem', letterSpacing:'.2em' }}>This being has not yet been mapped.</div>
      <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--amber-dim)', color:'var(--amber)', padding:'8px 20px', cursor:'pointer', fontFamily:'"Cormorant Garamond", serif', fontSize:'.85rem', letterSpacing:'.15em', textTransform:'uppercase' }}>← Return to the Map</button>
    </div>
  );

  return (
    <div className="char-page-root">
      {/* ── Mini Header ────────────────────────────────────────────── */}
      <header className="char-page-header">
        <Link to="/" className="char-page-back">← Devlok</Link>
        <span className="char-page-header-title">Divine Being</span>
        <div className="char-page-header-actions">
          {isLoggedIn ? (
            <Link to="/profile" className="user-avatar-link" title={`${user.name} · ${user.shraddha || 0} Shraddha`}>
              <span className="user-avatar">{initials}</span>
            </Link>
          ) : (
            <Link to="/signup" className="signin-link">Sign in</Link>
          )}
        </div>
      </header>

      {/* ── Character detail ───────────────────────────────────────── */}
      <div className="char-page-body">
        <div className="char-page-glow" style={{ background: `radial-gradient(circle, ${COLORS[character.type]}22 0%, transparent 70%)` }} />

        <div className="char-page-card">
          {/* Sanskrit name */}
          <h1 className="char-page-sanskrit" style={{ color: COLORS[character.type], textShadow: `0 0 40px ${COLORS[character.type]}55` }}>
            {character.sanskrit}
          </h1>
          <h2 className="char-page-label">{character.label}</h2>

          {/* Badges */}
          <div className="char-page-badges">
            <span className="char-page-badge" style={{ color: COLORS[character.type], borderColor: `${COLORS[character.type]}55` }}>
              {character.yuga} Yuga
            </span>
            <span className="char-page-badge" style={{ color: COLORS[character.type], borderColor: `${COLORS[character.type]}55` }}>
              {character.type}
            </span>
          </div>

          {/* Epithets */}
          {character.epithets?.length > 0 && (
            <div className="char-page-epithets">
              {character.epithets.map(e => (
                <span key={e} className="epithet-tag" style={{ color: COLORS[character.type], borderColor: `${COLORS[character.type]}44` }}>
                  {e}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="char-page-divider" style={{ background: `linear-gradient(90deg, transparent, ${COLORS[character.type]}55, transparent)` }} />

          {/* Description */}
          <p className="char-page-desc">{character.desc}</p>

          {/* Source */}
          {character.source && (
            <p className="char-page-source">Sources: {character.source}</p>
          )}

          {/* Actions */}
          <div className="char-page-actions">
            <button
              className={`char-page-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              disabled={bmLoading}
              style={{ borderColor: COLORS[character.type], color: bookmarked ? '#000' : COLORS[character.type], background: bookmarked ? COLORS[character.type] : 'transparent' }}
              title={isLoggedIn ? (bookmarked ? 'Remove bookmark' : 'Bookmark this being') : 'Sign in to bookmark'}
            >
              {bmLoading ? '…' : bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>

            <button
              onClick={() => navigate(`/?focus=${id}`)}
              className="char-page-explore-btn"
              style={{ background: COLORS[character.type], color: '#000' }}
            >
              Explore in Graph →
            </button>

            <button
              onClick={handleShare}
              className="char-page-share-btn"
              style={{ borderColor: COLORS[character.type], color: COLORS[character.type] }}
            >
              {copied ? '✓ Copied!' : '↗ Share'}
            </button>
          </div>

          {/* Login hint for non-users */}
          {showLoginHint && (
            <div className="char-page-login-hint">
              <Link to="/signup">Sign in</Link> to bookmark this being and earn Shraddha
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
