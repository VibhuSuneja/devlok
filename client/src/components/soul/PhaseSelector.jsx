// client/src/components/soul/PhaseSelector.jsx
// Screen 7 of onboarding — 8 life phase cards in a 2x4 grid

import React from 'react';
import { LIFE_PHASE_LIST } from '../../constants/lifePhases.js';

export default function PhaseSelector({ selected, onSelect }) {
  return (
    <div className="phase-selector">
      <div className="phase-grid">
        {LIFE_PHASE_LIST.map((phase) => (
          <button
            key={phase.key}
            id={`phase-${phase.key}`}
            className={`phase-card ${selected === phase.key ? 'phase-card--selected' : ''}`}
            onClick={() => onSelect(phase.key)}
            style={{ '--phase-color': phase.color }}
          >
            <span className="phase-icon">{phase.icon}</span>
            <span className="phase-label">{phase.label}</span>
            <span className="phase-desc">{phase.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
