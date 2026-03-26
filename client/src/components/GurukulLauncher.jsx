import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function GurukulLauncher() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Show after 2 seconds (after intro overlay is gone)
    const timer = setTimeout(() => {
      if (!localStorage.getItem('gurukul_closed')) {
        setVisible(true);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setClosed(true);
    // Remember preference for current session
    localStorage.setItem('gurukul_closed', 'true');
  };

  if (closed || !visible) return null;

  return (
    <div className={`gurukul-popup-container ${visible ? 'entrance' : ''}`}>
      <Link to="/gurukul" className="gurukul-popup-card">
        <button className="gurukul-popup-close" onClick={handleClose} title="Dismiss">×</button>
        
        <div className="gurukul-popup-fire">
          <div className="popup-flame">🔥</div>
          <div className="popup-glow" />
          <div className="popup-embers">
            {[...Array(5)].map((_, i) => <div key={i} className="popup-ember" />)}
          </div>
        </div>

        <div className="gurukul-popup-content">
          <div className="gurukul-popup-eyebrow">Seekers Invitation</div>
          <h3 className="gurukul-popup-title">Gurukul Cohort I</h3>
          <p className="gurukul-popup-tagline">
            Four weeks. 20 topics. One cohort. 
            <span className="gurukul-popup-cta">Begin Initiation →</span>
          </p>
        </div>

        <div className="gurukul-popup-badge">
          <span className="badge-dot" /> Open
        </div>
      </Link>
    </div>
  );
}

export default GurukulLauncher;
