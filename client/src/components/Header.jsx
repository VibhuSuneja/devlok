import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';

function Header({ typeFilter, setTypeFilter, searchQuery, setSearchQuery }) {
  return (
    <header className="header">
      <div className="brand">
        <h1 className="brand-title">DEVLOK</h1>
        <span className="brand-sub">The Knowledge Core</span>
      </div>

      <div className="header-center">
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        <div className="sep" />
        <FilterBar filter={typeFilter} setFilter={setTypeFilter} />
      </div>

      <Link to="/admin" className="admin-link">Access Core</Link>
    </header>
  );
}

export default Header;
