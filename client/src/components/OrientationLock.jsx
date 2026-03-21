import React, { useState, useEffect } from 'react';

/**
 * OrientationBanner – shows a NON-BLOCKING recommendation banner
 * when the user is on a mobile device in portrait orientation.
 * User can dismiss it. App remains fully usable underneath.
 */
function OrientationBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isMobile && isPortrait) {
      setShow(true);
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const portrait = window.innerHeight > window.innerWidth;
      setShow(mobile && portrait);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!show) return null;

  return (
    <div className="orientation-banner" role="status" aria-live="polite">
      <span className="orientation-icon">📱</span>
      <span className="orientation-text">Rotate for the full cosmic experience</span>
      <button
        className="orientation-dismiss"
        onClick={() => setShow(false)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export default OrientationBanner;
