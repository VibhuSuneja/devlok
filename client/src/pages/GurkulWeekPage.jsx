// client/src/pages/GurkulWeekPage.jsx
// NEW FILE — add to client/src/pages/
// Gated content page at /gurukul/week/:n
// Requires user.gurukul === true to access content.

import React, { useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// ── Week content stubs ────────────────────────────────────────────────────────
// Replace the `essays` array content with real content as you write it.
const WEEK_DATA = {
  1: {
    title: 'Cosmic Time',
    sanskrit: 'काल',
    color: '#d4973a',
    accent: 'rgba(212,151,58,0.08)',
    intro: 'The architecture of eternity. This week we dismantle the assumption that time is a line and rebuild it as a wheel — with everything that implies for how you understand history, karma, and the present moment.',
    essays: [
      { num: 1, title: 'The Four Yugas — What They Actually Are', status: 'available' },
      { num: 2, title: 'The Manvantara System: 14 Cosmic Eras', status: 'available' },
      { num: 3, title: 'The Fine-Tuned Universe, 3,500 Years Early', status: 'available' },
      { num: 4, title: 'The Nasadiya Sukta — The Question at the Beginning', status: 'available' },
      { num: 5, title: 'Pralaya and Rebirth: The Physics of Dissolution', status: 'available' },
    ],
  },
  2: {
    title: 'Dharma Paradoxes',
    sanskrit: 'धर्म',
    color: '#5c8ac4',
    accent: 'rgba(92,138,196,0.08)',
    intro: 'When the right answer is wrong. This week we stay inside the Mahabharata\'s most uncomfortable moral situations — the ones where the text refuses to give you an easy verdict and you have to sit with the discomfort.',
    essays: [
      { num: 1, title: 'Why Bhishma Fought for the Wrong Side', status: 'available' },
      { num: 2, title: 'Karna\'s Loyalty and the Brothers He Protected', status: 'available' },
      { num: 3, title: 'The Dice Game: Draupadi\'s Unanswered Question', status: 'available' },
      { num: 4, title: 'Krishna\'s Rule-Breaking: When Dharma Supersedes Convention', status: 'available' },
      { num: 5, title: 'Ekalavya\'s Thumb — Institutional Power as Tradition', status: 'available' },
    ],
  },
  3: {
    title: 'Epic Women',
    sanskrit: 'शक्ति',
    color: '#c45c8a',
    accent: 'rgba(196,92,138,0.08)',
    intro: 'The intelligence the epics actually preserve. The women of the Mahabharata and Ramayana are not decorative — they are the moral architecture of both texts. This week we read them closely.',
    essays: [
      { num: 1, title: 'Draupadi\'s Legal Argument — The Question That Started a War', status: 'available' },
      { num: 2, title: 'Gandhari\'s Blindfold as Tapas', status: 'available' },
      { num: 3, title: 'Kunti\'s Secret and the Cost of Reputation', status: 'available' },
      { num: 4, title: 'Savitri\'s Negotiation with Yama', status: 'available' },
      { num: 5, title: 'Sita\'s Agni-Pariksha: What the Trial of Fire Actually Means', status: 'available' },
    ],
  },
  4: {
    title: 'Vedanta',
    sanskrit: 'वेदान्त',
    color: '#5cb88a',
    accent: 'rgba(92,184,138,0.08)',
    intro: 'The map that ends the search. Vedanta is not mysticism — it is the most rigorous philosophical tradition in human history. This week we read it without the mystification.',
    essays: [
      { num: 1, title: 'Tat Tvam Asi — The Three Mahavakyas Unpacked', status: 'available' },
      { num: 2, title: 'Maya: Not "The World is Fake"', status: 'available' },
      { num: 3, title: 'Advaita vs. Dvaita: Why Both Are Right', status: 'available' },
      { num: 4, title: 'The Mandukya Upanishad: Liberation in Twelve Verses', status: 'available' },
      { num: 5, title: 'Vedanta vs. Stoicism — Convergence and Divergence', status: 'available' },
    ],
  },
};

export default function GurkulWeekPage() {
  const { n } = useParams();
  const { user, loading } = useContext(AuthContext);

  const weekNum = parseInt(n);

  // Loading state
  if (loading) return null;

  // Invalid week number
  if (!weekNum || weekNum < 1 || weekNum > 4) {
    return <Navigate to="/gurukul" replace />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/signup?redirect=/gurukul/week/1" replace />;
  }

  // Not enrolled — send back to Gurukul page
  if (!user.gurukul) {
    return (
      <div className="gurukul-gate-page">
        <div className="gurukul-gate-inner">
          <p className="gurukul-gate-om">🔒</p>
          <h1 className="gurukul-gate-title">Gurukul Access Required</h1>
          <p className="gurukul-gate-body">
            This content is available exclusively to enrolled Gurukul students.
          </p>
          <Link to="/gurukul" className="gurukul-gate-cta">
            Enrol for ₹999 →
          </Link>
          <Link to="/" className="gurukul-gate-back">← Return to Devlok</Link>
        </div>
      </div>
    );
  }

  const week = WEEK_DATA[weekNum];

  return (
    <div className="gurukul-week-page">
      {/* Nav */}
      <nav className="gurukul-nav">
        <Link to="/gurukul" className="gurukul-nav-back">← Gurukul</Link>
        <span className="gurukul-nav-label">Week {weekNum} · {week.title}</span>
        <Link to="/profile" className="gurukul-nav-action">Profile</Link>
      </nav>

      {/* Week hero */}
      <header className="gurukul-week-hero" style={{ '--week-color': week.color, '--week-accent': week.accent }}>
        <div className="gurukul-week-hero-inner">
          <p className="gurukul-week-hero-eyebrow">Week {weekNum} of 4</p>
          <h1 className="gurukul-week-hero-title" style={{ color: week.color }}>
            {week.title}
          </h1>
          <p className="gurukul-week-hero-sanskrit">{week.sanskrit}</p>
          <p className="gurukul-week-hero-intro">{week.intro}</p>

          {/* Week navigation pills */}
          <div className="gurukul-week-nav-pills">
            {[1, 2, 3, 4].map(w => (
              <Link
                key={w}
                to={`/gurukul/week/${w}`}
                className={`gurukul-week-nav-pill ${w === weekNum ? 'active' : ''}`}
              >
                Week {w}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Essay list */}
      <main className="gurukul-week-content">
        <div className="gurukul-week-content-inner">
          <h2 className="gurukul-week-content-heading">
            This Week's Essays
            <span className="gurukul-week-content-count">{week.essays.length} essays</span>
          </h2>

          <div className="gurukul-essay-list">
            {week.essays.map((essay, i) => (
              <div
                key={i}
                className={`gurukul-essay-item ${essay.status}`}
                style={{ '--week-color': week.color }}
              >
                <div className="gurukul-essay-num" style={{ color: week.color }}>
                  {String(essay.num).padStart(2, '0')}
                </div>
                <div className="gurukul-essay-content">
                  <h3 className="gurukul-essay-title">{essay.title}</h3>
                  <p className="gurukul-essay-status-label">
                    {essay.status === 'available' ? '✦ Available now' : '⟳ Coming soon'}
                  </p>
                </div>
                <div className="gurukul-essay-action">
                  {essay.status === 'available' ? (
                    <span className="gurukul-essay-read-badge">Read →</span>
                  ) : (
                    <span className="gurukul-essay-soon-badge">Soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Live session block */}
          <div className="gurukul-live-block" style={{ borderColor: `${week.color}44` }}>
            <div className="gurukul-live-icon">🎙</div>
            <div>
              <h3 className="gurukul-live-title">Live Session — Week {weekNum}</h3>
              <p className="gurukul-live-body">
                The weekly live session for this cohort will be announced via email.
                Recordings are posted here within 24 hours.
              </p>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="gurukul-week-bottom-nav">
            {weekNum > 1 && (
              <Link to={`/gurukul/week/${weekNum - 1}`} className="gurukul-week-nav-btn">
                ← Week {weekNum - 1}: {WEEK_DATA[weekNum - 1].title}
              </Link>
            )}
            {weekNum < 4 && (
              <Link to={`/gurukul/week/${weekNum + 1}`} className="gurukul-week-nav-btn gurukul-week-nav-btn--next" style={{ borderColor: `${week.color}66`, color: week.color }}>
                Week {weekNum + 1}: {WEEK_DATA[weekNum + 1].title} →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
