import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';

function Header({ typeFilter, setTypeFilter, linkFilter, setLinkFilter, searchQuery, setSearchQuery }) {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses[0]?.emailAddress === 'admin@devlok.com';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

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

      {/* Desktop nav */}
      <div className="header-actions">
        <Link to="/today" className="today-link" title="Daily Concept">
          🔥<span className="nav-text"> Daily Concept</span>
        </Link>
        <Link to="/affirmations" className="today-link" title="Affirmations"
          style={{ borderColor: '#6c3483', color: '#9b59b6', background: 'rgba(108,52,131,0.08)' }}>
          ✦<span className="nav-text"> Affirmations</span>
        </Link>
        <Link to="/journal" className="today-link" title="Journal"
          style={{ borderColor: '#8b6914', color: '#c9a84c', background: 'rgba(139,105,20,0.08)' }}>
          📜<span className="nav-text"> Journal</span>
        </Link>
        <Link to="/ask" className="today-link" title="Ask Rishi"
          style={{ borderColor: 'var(--mind)', color: '#fff', background: 'rgba(160,196,220,0.1)' }}>
          🕉️<span className="nav-text"> Ask Rishi</span>
        </Link>
        
        <div className="meditate-menu-wrap" id="meditate-menu-wrap">
          <span className="today-link meditate-menu-trigger" title="Meditate"
            style={{ borderColor: 'var(--sacred)', color: 'var(--sacred)', background: 'rgba(92,184,138,0.08)', cursor: 'default' }}>
            🧘<span className="nav-text"> Meditate ▾</span>
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

        {isLoaded && isAdmin && (
          <Link to="/admin" className="admin-link">
            ⚙<span className="nav-text"> Core</span>
          </Link>
        )}

        <SignedIn>
          <Link to="/profile" className="profile-nav-link" title="My Profile">
            <span className="profile-nav-icon">👤</span>
            <span className="nav-text">My Profile</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="signin-link today-link"
              style={{ background: 'transparent', border: '1px solid var(--amber)', cursor: 'pointer' }}>
              <span className="nav-text">Sign in</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Mobile: right side — hamburger + auth */}
      <div className="header-mobile-right">
        <SignedIn>
          <Link to="/profile" className="profile-nav-link profile-nav-link--mobile" title="My Profile">
            👤
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="signin-link signin-link--mobile" style={{ background: 'transparent', border: '1px solid var(--amber)', cursor: 'pointer', fontSize: '.6rem', padding: '5px 10px' }}>Sign in</button>
          </SignInButton>
        </SignedOut>
        <button
          className={`mobile-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          id="mobile-hamburger-btn"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-drawer" id="mobile-nav-drawer">
          <Link to="/today" className="mobile-nav-item" onClick={closeMenu}>🔥 Daily Concept</Link>
          <Link to="/affirmations" className="mobile-nav-item" onClick={closeMenu}>✦ Affirmations</Link>
          <Link to="/journal" className="mobile-nav-item" onClick={closeMenu}>📜 Journal</Link>
          <Link to="/ask" className="mobile-nav-item" onClick={closeMenu}>🕉️ Ask Rishi</Link>
          <Link to="/meditate" className="mobile-nav-item" onClick={closeMenu}>🌸 Meditation</Link>
          <Link to="/chakra-meditate" className="mobile-nav-item" onClick={closeMenu}>🔮 Chakra Journey</Link>
          <Link to="/profile" className="mobile-nav-item mobile-nav-item--profile" onClick={closeMenu}>👤 My Profile</Link>
          {isLoaded && isAdmin && (
            <Link to="/admin" className="mobile-nav-item" onClick={closeMenu}>⚙ Access Core</Link>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
