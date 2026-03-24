import React from 'react';

function NodeCounter({ count }) {
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="node-counter">
      <div className="counter-number">{count}</div>
      <div className="counter-label">Active Entities</div>
      <div className="dataset-controls">
        <span className="dataset-prefix">↓ Dataset:</span>
        <a href={`${apiUrl}/api/export/graph.json`} className="dataset-link" title="Full Graph (JSON)">JSON</a>
        <span className="dataset-sep">·</span>
        <a href={`${apiUrl}/api/export/characters.csv`} className="dataset-link" title="Characters spreadsheet (CSV)">Nodes</a>
        <span className="dataset-sep">·</span>
        <a href={`${apiUrl}/api/export/relationships.csv`} className="dataset-link" title="Relationships spreadsheet (CSV)">Edges</a>
        <span className="dataset-license">CC BY 4.0</span>
      </div>
    </div>
  );
}

export default NodeCounter;
