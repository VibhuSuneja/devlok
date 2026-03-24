import React from 'react';

function NodeCounter({ count }) {
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  return (
    <div className="node-counter">
      <div className="counter-number">{count}</div>
      <div className="counter-label">Active Entities</div>
      <a 
        href={`${apiUrl}/api/export/graph.json`}
        className="dataset-link"
        title="Download complete Devlok dataset (JSON) — CC BY 4.0"
        download="devlok-graph.json"
      >
        ↓ Dataset · CC BY 4.0
      </a>
    </div>
  );
}

export default NodeCounter;
