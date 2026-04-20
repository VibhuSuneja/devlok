import React from 'react';
import { ESSENCE_TYPES, KNOWLEDGE_TYPES, LINK_TYPES } from '../utils/graphTaxonomy.js';

function FilterBar({ filter, setFilter, linkFilter, setLinkFilter }) {
  return (
    <div className="filter-manager">
      <div className="filter-stack">
        <div className="filter-group">
          <span className="filter-label">Essence:</span>
          {ESSENCE_TYPES.map(t => (
            <button 
              key={t} 
              className={`filter-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Knowledge Core:</span>
          {KNOWLEDGE_TYPES.map(t => (
            <button 
              key={t} 
              className={`filter-btn filter-btn--darshana ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-stack">
        <div className="filter-group filter-group--links">
          <span className="filter-label">Relation:</span>
          {LINK_TYPES.map(lt => (
            <button 
              key={lt} 
              className={`filter-btn filter-btn--small ${linkFilter === lt ? 'active' : ''}`}
              onClick={() => setLinkFilter(lt)}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
