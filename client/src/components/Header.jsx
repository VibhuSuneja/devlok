import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';

function Header({ typeFilter, setTypeFilter, linkFilter, setLinkFilter, searchQuery, setSearchQuery }) {
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
        <Link to="/admin" className="admin-link">Access Core</Link>
      </div>
    </header>
  );
}

export default Header;
