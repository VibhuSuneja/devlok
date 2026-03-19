import React from 'react';

function Loader({ visible }) {
  return (
    <div className={`loader ${!visible && 'hidden'}`}>
      <div className="loader-title">DEVLOK</div>
      <div className="loader-sub">Synchronizing Knowledge Graph</div>
      <div className="loader-bar" />
    </div>
  );
}

export default Loader;
