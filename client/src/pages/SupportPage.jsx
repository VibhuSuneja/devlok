import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter.jsx';

/*
 * SupportPage — Devlok Support Hub
 * Contains:
 *   • Google Pay QR code (UPI donations)
 *   • Social media links
 *   • Links to Terms of Service & Privacy Policy
 *
 * UPDATE the UPI_ID and SOCIAL links below with your actual details.
 */

/* ── ⚠️  UPDATE THESE WITH YOUR REAL DETAILS ── */
const UPI_ID       = 'shashisun01@oksbi';
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/o_.vibhu._o?igsh=enFnaGNuNDQ5OWpo',
  twitter:   'https://x.com/TheignitedOnee',
  youtube:   '',
  linkedin:  '',
};
/* ──────────────────────────────────────────────── */

// QR code generated on-the-fly via qrserver.com (no API key needed)
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=c9a84c&bgcolor=04020F&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=Devlok&cu=INR`)}`;

function SocialLink({ href, label, icon, color }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="support-social-link"
      style={{ '--social-color': color }}
      aria-label={label}
    >
      <span className="support-social-icon">{icon}</span>
      <span className="support-social-label">{label}</span>
    </a>
  );
}

export default function SupportPage() {
  const [copied, setCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="support-page" id="support-page-root">
      {/* Subtle radial glow */}
      <div className="support-glow" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="support-header">
        <Link to="/" className="concept-back-link">← Devlok</Link>
        <span className="support-header-title">Support & Community</span>
        <div style={{ width: '60px' }} />
      </header>

      <div className="support-layout">

        {/* ══ SECTION 1: Support Us ══ */}
        <section className="support-card" id="support-donate">
          <div className="support-card-icon">🙏</div>
          <h2 className="support-card-title">Support Devlok</h2>
          <p className="support-card-desc">
            Devlok is a passion project — built in spare hours, with no ads, no
            paywalls, and no investor pressure. If it has brought you even a moment
            of insight or peace, a small contribution keeps the lights on and
            the knowledge flowing.
          </p>

          <div className="support-qr-wrap">
            <div className="support-qr-frame">
              <img
                src={QR_URL}
                alt="Google Pay QR code"
                className="support-qr-img"
                width="200" height="200"
              />
            </div>
            <div className="support-qr-info">
              <p className="support-qr-label">Scan to pay via</p>
              <div className="support-qr-apps">
                <span>Google Pay</span>
                <span>PhonePe</span>
                <span>Paytm</span>
                <span>BHIM</span>
              </div>
              <div className="support-upi-row">
                <code className="support-upi-id">{UPI_ID}</code>
                <button
                  className={`support-copy-btn ${copied ? 'support-copy-btn--copied' : ''}`}
                  onClick={copyUPI}
                  id="support-copy-upi-btn"
                >
                  {copied ? '✓' : '⎘'}
                </button>
              </div>
              <p className="support-qr-note">
                UPI · Any amount is deeply appreciated ✦
              </p>
            </div>
          </div>
        </section>

        {/* ══ SECTION 2: Social Media ══ */}
        <section className="support-card" id="support-social">
          <div className="support-card-icon">✦</div>
          <h2 className="support-card-title">Follow the Journey</h2>
          <p className="support-card-desc">
            Stay connected — new features, mythological insights, and community
            updates are shared across our channels.
          </p>
          <div className="support-socials">
            <SocialLink
              href={SOCIAL_LINKS.instagram}
              label="Instagram"
              icon="📸"
              color="#e1306c"
            />
            <SocialLink
              href={SOCIAL_LINKS.twitter}
              label="X · Twitter"
              icon="𝕏"
              color="#e8e8e8"
            />
            {SOCIAL_LINKS.youtube && (
              <SocialLink
                href={SOCIAL_LINKS.youtube}
                label="YouTube"
                icon="▶"
                color="#ff0000"
              />
            )}
            {SOCIAL_LINKS.linkedin && (
              <SocialLink
                href={SOCIAL_LINKS.linkedin}
                label="LinkedIn"
                icon="in"
                color="#0a66c2"
              />
            )}
          </div>
        </section>

        {/* ══ SECTION 3: Legal ══ */}
        <section className="support-card support-card--legal" id="support-legal">
          <h2 className="support-card-title">Legal</h2>
          <div className="support-legal-links">
            <Link to="/terms" className="support-legal-link" id="link-terms">
              <span>📋</span> Terms of Service
            </Link>
            <Link to="/privacy" className="support-legal-link" id="link-privacy">
              <span>🔒</span> Privacy Policy
            </Link>
          </div>
          <p className="support-legal-note">
            Devlok respects your privacy. We don't sell your data. Your journal
            is encrypted end-to-end and readable only by you.
          </p>
        </section>

      </div>

      <SiteFooter />
    </div>
  );
}
