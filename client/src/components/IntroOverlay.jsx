import React, { useState } from 'react';

const SHANKH_URL = '/sounds/shankh.mp3'; // PLACE YOUR SHANKA MP3 FILE IN client/public/sounds/shankh.mp3

function IntroOverlay({ onEnter }) {
  const [hidden, setHidden] = useState(false);

  const handleEnter = () => {
    const audio = new Audio(SHANKH_URL);
    audio.play().catch(err => console.log('Audio playback blocked:', err));
    
    setHidden(true);
    setTimeout(onEnter, 800); // Wait for transition
  };

  return (
    <div className={`intro-overlay ${hidden ? 'hidden' : ''}`}>
      <div className="brand" style={{ transform: 'scale(1.5)', marginBottom: '20px' }}>
        <h1 className="brand-title">DEVLOK</h1>
      </div>
      
      <p className="intro-sub">The Divine Knowledge Graph</p>

      <button className="enter-btn" onClick={handleEnter}>
        Enter the Cosmos
      </button>

      <div style={{ position: 'fixed', bottom: '20px', fontSize: '.6rem', color: 'var(--text-dim)', opacity: .4 }}>
        Best experienced with sound
      </div>
    </div>
  );
}

export default IntroOverlay;
