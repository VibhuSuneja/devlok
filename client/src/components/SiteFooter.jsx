import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SiteFooter — minimal fixed footer strip shown on the main graph page.
 * Contains links to: Support · Terms · Privacy · Social
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <span className="site-footer-brand">DEVLOK</span>
        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link to="/support"  className="site-footer-link" id="footer-support">🙏 Support Us</Link>
          <Link to="/affirmations" className="site-footer-link" id="footer-affirmations">✦ Affirmations</Link>
          <a href="https://instagram.com/devlok.in"  target="_blank" rel="noopener noreferrer" className="site-footer-link" id="footer-instagram">Instagram</a>
          <a href="https://twitter.com/DevlokApp"    target="_blank" rel="noopener noreferrer" className="site-footer-link" id="footer-twitter">𝕏 Twitter</a>
          <Link to="/terms"    className="site-footer-link" id="footer-terms">Terms</Link>
          <Link to="/privacy"  className="site-footer-link" id="footer-privacy">Privacy</Link>
        </nav>
        <span className="site-footer-copy">© {new Date().getFullYear()} Devlok</span>
      </div>
    </footer>
  );
}
