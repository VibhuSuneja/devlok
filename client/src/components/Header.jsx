import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignedIn, SignedOut, useUser, UserButton } from '@clerk/clerk-react';
import FilterBar from './FilterBar.jsx';
import SearchBar from './SearchBar.jsx';

function Header({ typeFilter, setTypeFilter, linkFilter, setLinkFilter, searchQuery, setSearchQuery, onOpenPaths }) {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress === 'admin@devlok.com';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="brand">
        <h1 className="brand-title">DEVLOK</h1>
        <span className="brand-sub">The Knowledge Core</span>
      </div>

      <div className="header-center">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        <div className="filters-container-minimal">
          <FilterBar
            filter={typeFilter}
            setFilter={setTypeFilter}
            linkFilter={linkFilter}
            setLinkFilter={setLinkFilter}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="meditate-menu-wrap" style={{ margin: '0 8px' }}>
          <button className="today-link experience-trigger">
            Experience ▾
          </button>
          <div className="meditate-dropdown experience-dropdown">
            <Link to="/today" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🔥</span>
              <span className="meditate-dropdown-text">
                <strong>Daily Concept</strong>
                <small>Wisdom for the day</small>
              </span>
            </Link>
            <Link to="/contribute" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">✍</span>
              <span className="meditate-dropdown-text">
                <strong>Contribute</strong>
                <small>Add concepts, ties, and paths</small>
              </span>
            </Link>
            <button type="button" className="meditate-dropdown-item meditate-dropdown-item--button" onClick={onOpenPaths}>
              <span className="meditate-dropdown-icon">✧</span>
              <span className="meditate-dropdown-text">
                <strong>Guided Paths</strong>
                <small>Curated journeys through the graph</small>
              </span>
            </button>
            <Link to="/journal" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🜜</span>
              <span className="meditate-dropdown-text">
                <strong>Journal</strong>
                <small>Record your growth</small>
              </span>
            </Link>
            <Link to="/ask" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🕉</span>
              <span className="meditate-dropdown-text">
                <strong>Ask Rishi</strong>
                <small>Graph-native inquiry</small>
              </span>
            </Link>
            <Link to="/soul" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🪔</span>
              <span className="meditate-dropdown-text">
                <strong>Soul Mirror</strong>
                <small>Your spiritual identity</small>
              </span>
            </Link>
            <Link to="/meditate" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🌸</span>
              <span className="meditate-dropdown-text">
                <strong>Meditation</strong>
                <small>Find your center</small>
              </span>
            </Link>
            <Link to="/chakra-meditate" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">🔮</span>
              <span className="meditate-dropdown-text">
                <strong>Chakra Journey</strong>
                <small>Seven energy centers</small>
              </span>
            </Link>
            <Link to="/affirmations" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">✦</span>
              <span className="meditate-dropdown-text">
                <strong>Affirmations</strong>
                <small>Voice of power</small>
              </span>
            </Link>
            <Link to="/dana" className="meditate-dropdown-item">
              <span className="meditate-dropdown-icon">☀</span>
              <span className="meditate-dropdown-text">
                <strong>Dana</strong>
                <small>Sacred offering</small>
              </span>
            </Link>
          </div>
        </div>

        <div className="header-auth-group">
          <SignedIn>
            <Link to="/profile" className="profile-icon-link" title="My Profile">👤</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="signin-link-minimal">Sign in</button>
            </SignInButton>
          </SignedOut>
        </div>

        {isLoaded && isAdmin && (
          <Link to="/admin" className="admin-link-icon" title="Core Controls">⚙</Link>
        )}
      </div>

      <div className="header-mobile-right">
        <SignedIn>
          <Link to="/profile" className="profile-nav-link profile-nav-link--mobile" title="My Profile">👤</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="signin-link signin-link--mobile"
              style={{ background: 'transparent', border: '1px solid var(--amber)', cursor: 'pointer', fontSize: '.6rem', padding: '5px 10px' }}
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <button
          className={`mobile-hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          id="mobile-hamburger-btn"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav-drawer" id="mobile-nav-drawer">
          <Link to="/today" className="mobile-nav-item" onClick={closeMenu}>🔥 Daily Concept</Link>
          <Link to="/contribute" className="mobile-nav-item" onClick={closeMenu}>✍ Contribute</Link>
          <button type="button" className="mobile-nav-item mobile-nav-item--button" onClick={() => { closeMenu(); onOpenPaths?.(); }}>✧ Guided Paths</button>
          <Link to="/affirmations" className="mobile-nav-item" onClick={closeMenu}>✦ Affirmations</Link>
          <Link to="/journal" className="mobile-nav-item" onClick={closeMenu}>🜜 Journal</Link>
          <Link to="/ask" className="mobile-nav-item" onClick={closeMenu}>🕉 Ask Rishi</Link>
          <Link to="/meditate" className="mobile-nav-item" onClick={closeMenu}>🌸 Meditation</Link>
          <Link to="/chakra-meditate" className="mobile-nav-item" onClick={closeMenu}>🔮 Chakra Journey</Link>
          <Link to="/dana" className="mobile-nav-item" onClick={closeMenu}>☀ Dana</Link>
          <SignedIn>
            <Link to="/soul" className="mobile-nav-item" onClick={closeMenu}>🪔 Soul Mirror</Link>
          </SignedIn>
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
