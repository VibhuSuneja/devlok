import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

function Header({ typeFilter, setTypeFilter, linkFilter, setLinkFilter, searchQuery, setSearchQuery }) {
  const { user, isAdmin, isLoggedIn } = useContext(AuthContext);

  // Generate initials from user name (up to 2 chars)
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <header className="header">
      <div className="brand">
        <h1 className="brand-title">DEVLOK</h1>
        <span className="brand-sub">The Knowledge Core</span>
      </div>

      <div className="header-center">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        <div className="sep" />
        <div className="filter-stack">
          <FilterBar 
            filter={typeFilter} 
            setFilter={setTypeFilter} 
            linkFilter={linkFilter} 
            setLinkFilter={setLinkFilter} 
          />
        </div>
      </div>

      <div className="header-actions">
        <Link to="/today" className="today-link">🔥 Daily Concept</Link>
        <Link to="/affirmations" className="today-link" style={{ borderColor: '#6c3483', color: '#9b59b6', background: 'rgba(108,52,131,0.08)' }}>✦ Affirmations</Link>
        <Link to="/journal" className="today-link" style={{ borderColor: '#8b6914', color: '#c9a84c', background: 'rgba(139,105,20,0.08)' }}>📜 Journal</Link>
        <Link to="/ask" className="today-link" style={{ borderColor: 'var(--mind)', color: '#fff', background: 'rgba(160,196,220,0.1)' }}>🕉️ Ask Rishi</Link>
        {/* ── Meditate dropdown ── */}
        <div className="meditate-menu-wrap" id="meditate-menu-wrap">
          <span className="today-link meditate-menu-trigger" style={{ borderColor: 'var(--sacred)', color: 'var(--sacred)', background: 'rgba(92,184,138,0.08)', cursor: 'default' }}>
            🧘 Meditate ▾
          </span>
          <div className="meditate-dropdown" id="meditate-dropdown">
            <Link to="/meditate" className="meditate-dropdown-item" id="meditate-general-link">
              <span className="meditate-dropdown-icon">🌸</span>
              <span className="meditate-dropdown-text">
                <strong>General Meditation</strong>
                <small>5-min breathwork · Lotus</small>
              </span>
            </Link>
            <Link to="/chakra-meditate" className="meditate-dropdown-item" id="meditate-chakra-link">
              <span className="meditate-dropdown-icon">🔮</span>
              <span className="meditate-dropdown-text">
                <strong>7 Chakra Journey</strong>
                <small>Solfeggio frequencies · 7 min</small>
              </span>
            </Link>
          </div>
        </div>

        {/* Admin-only link */}
        {isAdmin && (
          <Link to="/admin" className="admin-link">Access Core</Link>
        )}

        {/* Auth state — logged in: avatar + profile link; out: sign in */}
        {isLoggedIn ? (
          <Link to="/profile" className="user-avatar-link" title={`${user.name} · ${user.shraddha || 0} Shraddha`}>
            <span className="user-avatar">{initials}</span>
          </Link>
        ) : (
          <Link to="/signup" className="signin-link">Sign in</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
