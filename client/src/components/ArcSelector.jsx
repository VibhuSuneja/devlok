import React from 'react';
import storyArcs from '../data/storyArcs.json';

function ArcSelector({ activeArcId, setActiveArcId }) {
  return (
    <div className="arc-selector">
      <div className="arc-label">Narrative Arcs</div>
      <div className="arc-btns">
        <button 
          className={`arc-btn ${activeArcId === null ? 'active' : ''}`}
          onClick={() => setActiveArcId(null)}
        >
          Free Mode
        </button>
        {storyArcs.map(arc => (
          <button 
            key={arc.id} 
            className={`arc-btn ${activeArcId === arc.id ? 'active' : ''}`}
            onClick={() => setActiveArcId(arc.id)}
            title={arc.desc}
          >
            {arc.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ArcSelector;
