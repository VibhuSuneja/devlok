import React from 'react';
import posthog from 'posthog-js';

function SearchBar({ query, setQuery }) {
  const handleBlur = () => {
    if (query?.trim()) {
      posthog.capture('search_performed', { query: query.trim() });
    }
  };

  return (
    <div className="search-wrap">
      <input 
        type="text" 
        className="search-input" 
        placeholder="Seek a Divine Being..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleBlur}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
}

export default SearchBar;
