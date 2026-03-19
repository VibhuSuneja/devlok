import React from 'react';

function NodeCounter({ count }) {
  return (
    <div className="node-counter">
      <div className="counter-number">{count}</div>
      <div className="counter-label">Active Entities</div>
    </div>
  );
}

export default NodeCounter;
