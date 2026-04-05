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
        <Link to="/ask" className="today-link" style={{ borderColor: 'var(--mind)', color: '#fff', background: 'rgba(160,196,220,0.1)' }}>🕉️ Ask Rishi</Link>

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
