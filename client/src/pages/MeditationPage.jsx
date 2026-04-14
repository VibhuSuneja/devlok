import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';
import SiteFooter from '../components/SiteFooter.jsx';

/*
 * ── Meditation Page ──────────────────────────────────────────────────────
 * Flow:
 *   Phase 0 → Intro guidelines ("take a comfortable position…")
 *   Phase 1 → 5-second countdown
 *   Phase 2 → 5-minute breathwork (inhale 4s / hold 2s / exhale 4s)
 *   Phase 3 → Completion with bell sound
 * ──────────────────────────────────────────────────────────────────────────
 */

const BREATHE_INHALE = 4;    // seconds
const BREATHE_HOLD   = 2;    // seconds
const BREATHE_EXHALE = 4;    // seconds
const BREATHE_CYCLE  = BREATHE_INHALE + BREATHE_HOLD + BREATHE_EXHALE; // 10s
const SESSION_DURATION = 5 * 60; // 5 minutes in seconds
const COUNTDOWN_FROM = 5;

const GUIDELINES = [
  'Find a quiet, comfortable space.',
  'Sit or lie down — let your body settle.',
  'Close your eyes gently.',
  'Release all tension from your shoulders.',
  'Allow yourself to simply… be.',
];

/* ── Bell Sound via Tone.js ── */
function playBell() {
  const synth = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 3.5, release: 2 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();

  synth.volume.value = -8;
  synth.triggerAttackRelease('8n', Tone.now());

  // Cleanup
  setTimeout(() => synth.dispose(), 6000);
}

/* ── Lotus / Flower SVG ── */
/* Accepts svgRef + labelRef so the parent can mutate DOM directly (no re-render) */
function LotusSVG({ svgRef, labelRef }) {
  const petalCount = 8;
  const petals = [];

  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    petals.push(
      <g key={i} transform={`rotate(${angle} 100 100)`}>
        <ellipse
          cx="100"
          cy="45"
          rx="16"
          ry="42"
          fill="none"
          stroke="var(--amber-glow)"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <ellipse
          cx="100"
          cy="45"
          rx="10"
          ry="36"
          fill="rgba(240, 184, 74, 0.08)"
          stroke="none"
        />
      </g>
    );
  }

  /* Inner petals (smaller, rotated) */
  const innerPetals = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i + 22.5;
    innerPetals.push(
      <g key={`inner-${i}`} transform={`rotate(${angle} 100 100)`}>
        <ellipse
          cx="100"
          cy="56"
          rx="11"
          ry="30"
          fill="none"
          stroke="var(--lotus)"
          strokeWidth="0.8"
          opacity="0.5"
        />
        <ellipse
          cx="100"
          cy="56"
          rx="6"
          ry="24"
          fill="rgba(196, 92, 138, 0.06)"
          stroke="none"
        />
      </g>
    );
  }

  return (
    <div className="meditation-lotus-container">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="meditation-lotus-svg"
        style={{ transform: 'scale(0.55)', filter: 'drop-shadow(0 0 10px rgba(240,184,74,0.4))' }}
      >
        {/* Outer glow circles */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(240,184,74,0.08)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(240,184,74,0.05)" strokeWidth="0.3" />

        {/* Petals */}
        {petals}
        {innerPetals}

        {/* Center */}
        <circle cx="100" cy="100" r="14" fill="rgba(240,184,74,0.15)" stroke="var(--amber-glow)" strokeWidth="1" />
        <circle cx="100" cy="100" r="6"  fill="var(--amber-glow)" opacity="0.4" />
      </svg>

      {/* Label — mutated via ref, no React re-render */}
      <p ref={labelRef} className="meditation-breath-label"></p>
    </div>
  );
}

/* ── Timer display ── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Particle ring (ambient decoration) ── */
function ParticleRing() {
  const particles = [];
  for (let i = 0; i < 24; i++) {
    const angle = (360 / 24) * i;
    const delay = (i * 0.15).toFixed(2);
    particles.push(
      <span
        key={i}
        className="meditation-particle"
        style={{
          '--angle': `${angle}deg`,
          '--delay': `${delay}s`,
        }}
      />
    );
  }
  return <div className="meditation-particle-ring">{particles}</div>;
}


export default function MeditationPage() {
  const [phase, setPhase] = useState(0);           // 0=intro, 1=countdown, 2=breathwork, 3=done
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [elapsed, setElapsed] = useState(0);        // seconds into breathwork
  const [guidlineIndex, setGuidelineIndex] = useState(-1);

  // DOM refs — written directly in rAF, zero React re-renders for visuals
  const lotusSvgRef  = useRef(null);
  const breathLabelRef = useRef(null);
  const lastLabelRef   = useRef('');   // track label to avoid unnecessary textContent writes

  const animFrameRef  = useRef(null);
  const breathStartRef = useRef(null);
  const timerRef       = useRef(null);

  /* ── Phase 0: Staggered guideline reveal ── */
  useEffect(() => {
    if (phase !== 0) return;

    let idx = -1;
    const iv = setInterval(() => {
      idx++;
      if (idx < GUIDELINES.length) {
        setGuidelineIndex(idx);
      } else {
        clearInterval(iv);
      }
    }, 1400);

    return () => clearInterval(iv);
  }, [phase]);

  /* ── Phase 1: Countdown ── */
  useEffect(() => {
    if (phase !== 1) return;

    setCountdown(COUNTDOWN_FROM);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          setPhase(2);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [phase]);

  /* ── Phase 2: Breathwork loop — writes directly to DOM refs, no React setState ── */
  const animateBreath = useCallback(() => {
    if (!breathStartRef.current) breathStartRef.current = performance.now();

    const now = performance.now();
    const totalElapsed = (now - breathStartRef.current) / 1000;
    const cyclePos = totalElapsed % BREATHE_CYCLE;

    let newScale, newGlow, label;

    if (cyclePos < BREATHE_INHALE) {
      // Inhale: expand 0.55 → 1.25
      const progress = cyclePos / BREATHE_INHALE;
      const eased = 0.5 * (1 - Math.cos(Math.PI * progress)); // ease-in-out cosine
      newScale = 0.55 + 0.70 * eased;
      newGlow  = 10  + 35  * eased;
      label    = 'Breathe In';
    } else if (cyclePos < BREATHE_INHALE + BREATHE_HOLD) {
      // Hold: stay fully expanded
      newScale = 1.25;
      newGlow  = 45;
      label    = 'Hold';
    } else {
      // Exhale: contract 1.25 → 0.55
      const progress = (cyclePos - BREATHE_INHALE - BREATHE_HOLD) / BREATHE_EXHALE;
      const eased = 0.5 * (1 - Math.cos(Math.PI * progress));
      newScale = 1.25 - 0.70 * eased;
      newGlow  = 45   - 35  * eased;
      label    = 'Breathe Out';
    }

    /* Write directly to DOM — skips React rendering pipeline entirely */
    if (lotusSvgRef.current) {
      lotusSvgRef.current.style.transform = `scale(${newScale})`;
      lotusSvgRef.current.style.filter    = `drop-shadow(0 0 ${newGlow.toFixed(1)}px rgba(240,184,74,0.55))`;
    }
    /* Only update textContent when the label actually changes (3× per cycle) */
    if (breathLabelRef.current && label !== lastLabelRef.current) {
      breathLabelRef.current.textContent = label;
      lastLabelRef.current = label;
    }

    animFrameRef.current = requestAnimationFrame(animateBreath);
  }, []);

  useEffect(() => {
    if (phase !== 2) return;

    breathStartRef.current = null;
    lastLabelRef.current   = '';
    setElapsed(0);
    animFrameRef.current = requestAnimationFrame(animateBreath);

    // Tick elapsed every second (only this needs React state)
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= SESSION_DURATION) {
          setPhase(3);
          return SESSION_DURATION;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, animateBreath]);

  /* ── Phase 3: Bell on completion ── */
  useEffect(() => {
    if (phase !== 3) {
      return;
    }

    // Stop breath animation
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // Play bell
    const startBell = async () => {
      await Tone.start();
      playBell();
      // Play a second softer bell after 2s
      setTimeout(() => playBell(), 2000);
      setTimeout(() => playBell(), 4000);
    };
    startBell();
  }, [phase]);

  /* ── Begin handler (Intro → Countdown) ── */
  const handleBegin = async () => {
    // Ensure Tone.js audio context is started (requires user gesture)
    await Tone.start();
    setPhase(1);
  };

  /* ── Restart ── */
  const handleRestart = () => {
    setPhase(0);
    setGuidelineIndex(-1);
    setElapsed(0);
    setScale(0.5);
    setGlowIntensity(10);
    setBreathLabel('');
  };

  const remaining = SESSION_DURATION - elapsed;

  return (
    <div className="meditation-page" id="meditation-page-root">
      {/* Background ambient particles */}
      <ParticleRing />

      {/* ── Header ── */}
      <header className="meditation-header">
        <Link to="/" className="concept-back-link" aria-label="Return to graph">
          ← Devlok
        </Link>
        <span className="meditation-header-title">ध्यान · Meditation</span>
        <span className="meditation-header-spacer" />
      </header>

      {/* ── Phase 0: Introduction ── */}
      {phase === 0 && (
        <main className="meditation-intro" id="meditation-intro">
          <div className="meditation-intro-icon">🕉️</div>
          <h1 className="meditation-intro-title">Prepare for Stillness</h1>
          <p className="meditation-intro-subtitle">
            A 5-minute guided breathwork session awaits you.
          </p>

          <ul className="meditation-guidelines">
            {GUIDELINES.map((g, i) => (
              <li
                key={i}
                className={`meditation-guideline ${i <= guidlineIndex ? 'meditation-guideline--visible' : ''}`}
              >
                <span className="meditation-guideline-dot">✦</span>
                {g}
              </li>
            ))}
          </ul>

          <button
            className="meditation-begin-btn btn btn-primary"
            onClick={handleBegin}
            disabled={guidlineIndex < GUIDELINES.length - 1}
            id="meditation-begin-btn"
          >
            Begin Meditation
          </button>
        </main>
      )}

      {/* ── Phase 1: Countdown ── */}
      {phase === 1 && (
        <main className="meditation-countdown" id="meditation-countdown">
          <p className="meditation-countdown-label">Starting in</p>
          <div className="meditation-countdown-number" key={countdown}>
            {countdown}
          </div>
          <p className="meditation-countdown-hint">Close your eyes…</p>
        </main>
      )}

      {/* ── Phase 2: Breathwork ── */}
      {phase === 2 && (
        <main className="meditation-breathwork" id="meditation-breathwork">
          {/* svgRef + labelRef written directly in rAF for 60fps with zero React overhead */}
          <LotusSVG svgRef={lotusSvgRef} labelRef={breathLabelRef} />
          <div className="meditation-timer">
            <span className="meditation-timer-remaining">{formatTime(remaining)}</span>
            <span className="meditation-timer-label">remaining</span>
          </div>
          <div className="meditation-breath-guide">
            <span className="meditation-guide-cycle">
              Inhale {BREATHE_INHALE}s · Hold {BREATHE_HOLD}s · Exhale {BREATHE_EXHALE}s
            </span>
          </div>
        </main>
      )}

      {/* ── Phase 3: Completion ── */}
      {phase === 3 && (
        <main className="meditation-complete" id="meditation-complete">
          <div className="meditation-complete-icon">🔔</div>
          <h2 className="meditation-complete-title">Session Complete</h2>
          <p className="meditation-complete-message">
            Namaste. May this stillness stay with you.
          </p>
          <div className="meditation-complete-stats">
            <div className="meditation-stat">
              <span className="meditation-stat-value">5:00</span>
              <span className="meditation-stat-label">minutes</span>
            </div>
            <div className="meditation-stat">
              <span className="meditation-stat-value">{Math.floor(SESSION_DURATION / BREATHE_CYCLE)}</span>
              <span className="meditation-stat-label">breath cycles</span>
            </div>
          </div>
          <div className="meditation-complete-actions">
            <button className="btn btn-primary" onClick={handleRestart}>
              Meditate Again
            </button>
            <Link to="/" className="btn btn-cancel">
              Return to Devlok
            </Link>
          </div>
        </main>
      )}

      {/* Show footer only on intro and completion screens */}
      {(phase === 0 || phase === 3) && <SiteFooter />}
    </div>
  );
}
