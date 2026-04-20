// client/src/pages/SoulProfile.jsx
// Main soul profile page — shown after onboarding and via nav
// Provides overview: archetype, phase, streak, and CTA to daily reflection

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import html2canvas from 'html2canvas';
import SoulCard from '../components/soul/SoulCard.jsx';
import { getSoulProfile, getSoulCard } from '../api/soul.js';
import { ARCHETYPES } from '../constants/archetypes.js';
import { LIFE_PHASES } from '../constants/lifePhases.js';

export default function SoulProfile() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = React.useRef(null);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: '#0a0a0a', 
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SoulMirror_${user?.firstName || 'Seeker'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export card", err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    getSoulProfile()
      .then(res => setProfile(res.data.soulProfile))
      .catch(err => {
        if (err?.response?.status === 404) {
          // No profile yet — redirect to onboarding
          navigate('/soul-onboarding', { replace: true });
        } else {
          setError('Could not load your soul profile. Try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [isLoaded, navigate]);

  if (loading) return (
    <div className="soul-loading">
      <div className="mandala-lamp" style={{ fontSize: '2.5rem' }}>🪔</div>
      <p className="soul-loading__text">Consulting the ancients…</p>
    </div>
  );

  if (error) return (
    <div className="soul-loading">
      <p style={{ color: 'var(--destroy)', fontSize: '.9rem' }}>{error}</p>
    </div>
  );

  if (!profile) return null;

  const arch  = ARCHETYPES[profile.primaryArchetype?.name?.toUpperCase()] || {};
  const phase = LIFE_PHASES[profile.currentPhase?.phaseKey] || {};

  // Days since first reflection
  const daysSince = profile.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt)) / 86400000) + 1)
    : 1;

  return (
    <div className="soul-profile-page">

      {/* Top Back Button */}
      <div style={{ alignSelf: 'flex-start', marginBottom: '16px', width: '100%', display: 'flex' }}>
         <button 
           onClick={() => navigate('/')}
           style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
         >
           ← Back
         </button>
      </div>

      {/* Header */}
      <div className="soul-profile__header">
        <div>
          <h1 className="soul-profile__title">Soul Mirror</h1>
          <p className="soul-profile__day">Day {daysSince} of your story</p>
        </div>
        <Link to="/reflect" className="soul-btn soul-btn--primary" id="soul-reflect-nav-btn"
          style={{ padding: '10px 22px', fontSize: '.72rem', textDecoration: 'none' }}>
          Today's Reflection →
        </Link>
      </div>

      {/* Visual Soul Card */}
      <div className="soul-card-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
         <SoulCard 
            ref={cardRef}
            profile={profile}
            archetype={arch}
            phase={phase}
            userName={user?.firstName || 'Seeker'}
            daysSince={daysSince}
          />
      </div>

      {/* Primary Archetype Details */}
      <div className="soul-archetype-block">
        <p style={{ fontSize: '.6rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Detailed Archetype
        </p>
        <h2 className="soul-archetype-block__name">
          {profile.primaryArchetype?.name || 'Unknown'}
        </h2>
        <p className="soul-archetype-block__tagline">
          "{arch.tagline || profile.primaryArchetype?.mythText}"
        </p>

        <div className="soul-archetype-block__row">
          <div>
            <p className="soul-archetype-block__cell-label">What you're carrying</p>
            <p className="soul-archetype-block__cell-text">
              {arch.coreWound || profile.primaryArchetype?.coreWound}
            </p>
          </div>
          <div>
            <p className="soul-archetype-block__cell-label">What you're becoming</p>
            <p className="soul-archetype-block__cell-text">
              {arch.emergingStrength || profile.primaryArchetype?.emergingStrength}
            </p>
          </div>
        </div>
      </div>

      {/* Current Phase */}
      {phase.key && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Walking through
          </p>
          <div className="soul-phase-badge" style={{ '--phase-color': phase.color }}>
            <span className="soul-phase-badge__icon">{phase.icon}</span>
            <span className="soul-phase-badge__name">{phase.label}</span>
            <span className="soul-phase-badge__label"> — {phase.description}</span>
          </div>
          <button
            id="soul-change-phase-btn"
            onClick={() => navigate('/soul/phase')}
            style={{
              background: 'none', border: 'none', color: 'var(--text-dim)',
              fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase',
              cursor: 'pointer', padding: '4px 0', alignSelf: 'flex-start',
              textDecoration: 'underline', textUnderlineOffset: '3px'
            }}
          >
            Change phase
          </button>
        </div>
      )}

      {/* Streak */}
      <div className="soul-streak-block">
        <div>
          <div className="soul-streak-block__number">
            {profile.streak?.current ?? 0}
          </div>
          <div className="soul-streak-block__label">Day streak</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(212,151,58,.15)', paddingLeft: '16px' }}>
          <div style={{ fontSize: '.88rem', color: 'var(--text)', marginBottom: '2px' }}>
            Longest: {profile.streak?.longest ?? 0} days
          </div>
          <div style={{ fontSize: '.7rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {profile.streak?.current >= 3
              ? 'You are building a samskara.'
              : 'Reflect daily to build your streak.'}
          </div>
        </div>
      </div>

      {/* Daily reflection CTA */}
      <div className="soul-reflect-cta">
        <p className="soul-reflect-cta__text">
          Today's mirror is waiting. One question. One honest answer.
        </p>
        <Link
          to="/reflect"
          id="soul-reflect-cta-btn"
          className="soul-btn soul-btn--primary"
          style={{ textDecoration: 'none' }}
        >
          Open Today's Reflection
        </Link>
      </div>

      {/* Reflection count */}
      <p style={{ textAlign: 'center', fontSize: '.68rem', color: 'rgba(122,104,64,.55)', letterSpacing: '.1em', paddingBottom: '16px' }}>
        {profile.answeredQuestionIds?.length ?? 0} reflections completed
      </p>

      {/* Return to home CTA */}
      <div style={{ textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          className="soul-btn"
          onClick={handleExport}
          disabled={exporting}
          style={{
            background: 'rgba(212,151,58,0.1)',
            border: '1px solid rgba(212,151,58,.5)',
            color: 'var(--amber)',
            padding: '8px 24px',
            fontSize: '.75rem',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            opacity: exporting ? 0.7 : 1
          }}
        >
          {exporting ? 'Generating...' : 'Share Soul Mirror'}
        </button>

        <Link
          to="/"
          className="soul-btn"
          style={{
            background: 'transparent',
            border: '1px solid rgba(212,151,58,.3)',
            color: 'var(--amber)',
            padding: '8px 24px',
            textDecoration: 'none',
            fontSize: '.75rem',
            letterSpacing: '.1em',
            textTransform: 'uppercase'
          }}
        >
          ← Return to Home Graph
        </Link>
      </div>

    </div>
  );
}
