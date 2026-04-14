import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── UPDATE with your real social & UPI details ── */
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/o_.vibhu._o?igsh=enFnaGNuNDQ5OWpo',
  twitter:   'https://x.com/TheignitedOnee',
  youtube:   '',
  linkedin:  'https://www.linkedin.com/in/vibhusuneja08?utm_source=share_via&utm_content=profile&utm_medium=member_android',
};
const UPI_ID = 'shashisun01@oksbi';
/* ─────────────────────────────────────────────── */

// QR generated on-the-fly — no API key required
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=c9a84c&bgcolor=04020F&data=${encodeURIComponent(
  `upi://pay?pa=${UPI_ID}&pn=Devlok&cu=INR`
)}`;

/**
 * SiteFooter — premium 3-column footer for all scrollable Devlok pages.
 * Columns: Social links | Brand + legal | Support QR
 */
export default function SiteFooter() {
  const [copied, setCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <footer className="sf" id="site-footer" role="contentinfo" aria-label="Site footer">
      {/* Decorative top border beam */}
      <div className="sf-beam" aria-hidden="true" />

      <div className="sf-inner">

        {/* ── Column 1: Social Links ── */}
        <div className="sf-col sf-col--social">
          <p className="sf-col-heading">Connect</p>
          <div className="sf-social-links">
            {SOCIAL_LINKS.instagram && (
              <a
                href={SOCIAL_LINKS.instagram}
                className="sf-social-link"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-instagram"
                aria-label="Devlok on Instagram"
              >
                <span className="sf-social-icon" aria-hidden="true">
                  {/* Instagram SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span>Instagram</span>
              </a>
            )}
            {SOCIAL_LINKS.twitter && (
              <a
                href={SOCIAL_LINKS.twitter}
                className="sf-social-link"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-twitter"
                aria-label="Devlok on Twitter/X"
              >
                <span className="sf-social-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </span>
                <span>Twitter / X</span>
              </a>
            )}
            {SOCIAL_LINKS.youtube && (
              <a
                href={SOCIAL_LINKS.youtube}
                className="sf-social-link"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-youtube"
                aria-label="Devlok on YouTube"
              >
                <span className="sf-social-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </span>
                <span>YouTube</span>
              </a>
            )}
            {SOCIAL_LINKS.linkedin && (
              <a
                href={SOCIAL_LINKS.linkedin}
                className="sf-social-link"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-linkedin"
                aria-label="Devlok on LinkedIn"
              >
                <span className="sf-social-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* ── Column 2: Brand + Legal ── */}
        <div className="sf-col sf-col--brand">
          <div className="sf-brand-name">DEVLOK</div>
          <p className="sf-brand-tagline">The Knowledge Core</p>
          <p className="sf-brand-sub">Built with ♡ for the seekers of ancient wisdom</p>

          <nav className="sf-legal-links" aria-label="Legal navigation">
            <Link to="/terms"   className="sf-legal-link" id="footer-terms">
              <span aria-hidden="true">📋</span> Terms of Service
            </Link>
            <span className="sf-legal-sep" aria-hidden="true">·</span>
            <Link to="/privacy" className="sf-legal-link" id="footer-privacy">
              <span aria-hidden="true">🔒</span> Privacy Policy
            </Link>
          </nav>

          <p className="sf-copy">© {new Date().getFullYear()} Devlok. All rights reserved.</p>
        </div>

        {/* ── Column 3: Support / QR ── */}
        <div className="sf-col sf-col--support">
          <p className="sf-col-heading">Support Us</p>
          <Link to="/support" className="sf-support-full-link" id="footer-support">
            View Full Support Page →
          </Link>
          <div className="sf-qr-wrap">
            <div className="sf-qr-frame">
              <img
                src={QR_URL}
                alt="Google Pay QR – scan to donate to Devlok"
                className="sf-qr-img"
                width="96"
                height="96"
                loading="lazy"
              />
            </div>
            <div className="sf-qr-info">
              <p className="sf-qr-label">Scan & pay via any UPI app</p>
              <div className="sf-upi-row">
                <code className="sf-upi-id">{UPI_ID}</code>
                <button
                  className={`sf-copy-btn ${copied ? 'sf-copy-btn--copied' : ''}`}
                  onClick={copyUPI}
                  id="footer-copy-upi"
                  aria-label="Copy UPI ID"
                  title="Copy UPI ID"
                >
                  {copied ? '✓' : '⎘'}
                </button>
              </div>
              <p className="sf-qr-note">No ads. No paywalls. Just knowledge. 🙏</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="sf-bottom-bar">
        <span className="sf-bottom-text">
          ✦ &nbsp; Rooted in the Vedas &nbsp;·&nbsp; Crafted for the modern seeker &nbsp; ✦
        </span>
      </div>
    </footer>
  );
}
