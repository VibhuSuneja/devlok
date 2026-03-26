import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

function GurkulBanner() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check session storage to see if dismissed
    const isDismissed = sessionStorage.getItem('gurukul_banner_dismissed');
    if (!isDismissed) {
      setVisible(true);
    }
    
    // Fetch live count
    axios.get('/gurukul/waitlist/count')
      .then(res => setCount(res.data.count))
      .catch(err => console.error('Count fetch error:', err));
  }, []);

  const handleDismiss = (e) => {
    e.preventDefault();
    setVisible(false);
    sessionStorage.setItem('gurukul_banner_dismissed', 'true');
  };

  if (!visible) return null;

  const remaining = Math.max(0, 20 - count);

  return (
    <div className="gurukul-banner-wrapper">
      <Link to="/gurukul" className="gurukul-banner">
        <div className="banner-shimmer" />
        <div className="banner-content">
          <span className="banner-fire">🔥</span>
          <span className="banner-text">
            The Gurukul Cohort I is opening soon. 
            <span className="banner-count"> {remaining} seats left</span> to unlock the secrets.
          </span>
          <span className="banner-cta">Join the Waitlist →</span>
        </div>
        <button className="banner-close" onClick={handleDismiss} title="Dismiss for this session">×</button>
      </Link>
    </div>
  );
}

export default GurkulBanner;
