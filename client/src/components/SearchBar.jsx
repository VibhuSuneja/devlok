import React from 'react';

function SearchBar({ query, setQuery }) {
  return (
    <div className="search-wrap">
      <input 
        type="text" 
        className="search-input" 
        placeholder="Seek a Divine Being..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
}

export default SearchBar;
