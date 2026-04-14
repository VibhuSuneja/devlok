import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';

/*
 * ── 7 Chakra Meditation Page ──────────────────────────────────────────────
 * Flow:
 *   Phase 0 → Introduction with chakra spine preview
 *   Phase 1 → Active chakra meditation (1 min each × 7 = 7 min total)
 *             Solfeggio oscillator plays, background shifts to chakra color
 *             Lotus node expands/contracts with breath
 *   Phase 2 → Bell rings, brief hold, transition to next chakra
 *   Phase 3 → Journey complete
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Solfeggio Frequencies (scientifically documented mapping):
 *   Root     → 396 Hz  (releases fear & guilt)
 *   Sacral   → 417 Hz  (facilitates change)
 *   Solar    → 528 Hz  (transformation, DNA repair)
 *   Heart    → 639 Hz  (connection & love)
 *   Throat   → 741 Hz  (expression & truth)
 *   ThirdEye → 852 Hz  (intuition & clarity)
 *   Crown    → 963 Hz  (divine connection)
 */

const CHAKRA_DURATION = 60;   // seconds per chakra
const BREATHE_INHALE  = 4;
const BREATHE_HOLD    = 2;
const BREATHE_EXHALE  = 4;
const BREATHE_CYCLE   = BREATHE_INHALE + BREATHE_HOLD + BREATHE_EXHALE;

const CHAKRAS = [
  {
    id: 'root', index: 0,
    name: 'Muladhara',    english: 'Root Chakra',
    color: '#c0392b',     colorRgb: '192,57,43',
    colorLight: '#e74c3c',
    freq: 396,
    mantra: 'LAM',
    element: 'Earth',
    affirmation: 'I am grounded. I am safe. I belong.',
    symbol: '▽',
    position: 'Base of Spine',
  },
  {
    id: 'sacral', index: 1,
    name: 'Svadhisthana', english: 'Sacral Chakra',
    color: '#d35400',     colorRgb: '211,84,0',
    colorLight: '#e67e22',
    freq: 417,
    mantra: 'VAM',
    element: 'Water',
    affirmation: 'I feel. I create. I flow.',
    symbol: '☽',
    position: 'Lower Abdomen',
  },
  {
    id: 'solar', index: 2,
    name: 'Manipura',     english: 'Solar Plexus',
    color: '#b7950b',     colorRgb: '183,149,11',
    colorLight: '#f1c40f',
    freq: 528,
    mantra: 'RAM',
    element: 'Fire',
    affirmation: 'I act with purpose. I hold my power.',
    symbol: '☀',
    position: 'Upper Abdomen',
  },
  {
    id: 'heart', index: 3,
    name: 'Anahata',      english: 'Heart Chakra',
    color: '#1e8449',     colorRgb: '30,132,73',
    colorLight: '#27ae60',
    freq: 639,
    mantra: 'YAM',
    element: 'Air',
    affirmation: 'I love unconditionally. My heart is open.',
    symbol: '✦',
    position: 'Center of Chest',
  },
  {
    id: 'throat', index: 4,
    name: 'Vishuddha',    english: 'Throat Chakra',
    color: '#1a5276',     colorRgb: '26,82,118',
    colorLight: '#2980b9',
    freq: 741,
    mantra: 'HAM',
    element: 'Ether',
    affirmation: 'I speak truth. I express freely.',
    symbol: '◈',
    position: 'Throat',
  },
  {
    id: 'thirdeye', index: 5,
    name: 'Ajna',         english: 'Third Eye',
    color: '#4a235a',     colorRgb: '74,35,90',
    colorLight: '#8e44ad',
    freq: 852,
    mantra: 'OM',
    element: 'Light',
    affirmation: 'I see clearly. My intuition guides me.',
    symbol: '◎',
    position: 'Between Eyebrows',
  },
  {
    id: 'crown', index: 6,
    name: 'Sahasrara',    english: 'Crown Chakra',
    color: '#6c3483',     colorRgb: '108,52,131',
    colorLight: '#9b59b6',
    freq: 963,
    mantra: 'AH',
    element: 'Cosmos',
    affirmation: 'I am divine. I am one with all.',
    symbol: '✧',
    position: 'Crown of Head',
  },
];

/* ── Bell sound ── */
function playBell(volume = -8) {
  const synth = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 3.5, release: 2 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
  synth.volume.value = volume;
  synth.triggerAttackRelease('8n', Tone.now());
  setTimeout(() => synth.dispose(), 7000);
}

/* ── Solfeggio oscillator (sine + subtle harmonics) ── */
function createSolfeggioTone(freq) {
  // Fundamental sine wave
  const osc = new Tone.Oscillator(freq, 'sine').toDestination();
  osc.volume.value = -28;

  // Subtle second harmonic (octave up) for richness
  const osc2 = new Tone.Oscillator(freq * 2, 'sine').toDestination();
  osc2.volume.value = -38;

  return { osc, osc2 };
}

/* ── Format time ── */
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ── Spine / Chakra Node Visualization ── */
function ChakraSpine({ activeIndex, completedSet }) {
  return (
    <div className="chakra-spine" id="chakra-spine">
      <div className="chakra-spine-line" />
      {[...CHAKRAS].reverse().map((c, revIdx) => {
        const i = 6 - revIdx;
        const isActive    = i === activeIndex;
        const isCompleted = completedSet.has(i);
        const isUpcoming  = !isActive && !isCompleted;
        return (
          <div
            key={c.id}
            className={`chakra-node ${isActive ? 'chakra-node--active' : ''} ${isCompleted ? 'chakra-node--done' : ''} ${isUpcoming ? 'chakra-node--upcoming' : ''}`}
            style={{ '--chakra-color': c.colorLight, '--chakra-rgb': c.colorRgb }}
            aria-label={`${c.english}${isActive ? ' (active)' : isCompleted ? ' (complete)' : ''}`}
          >
            <div className="chakra-node-orb">
              {isCompleted ? '✓' : <span className="chakra-node-symbol">{c.symbol}</span>}
            </div>
            <div className="chakra-node-info">
              <span className="chakra-node-name">{c.name}</span>
              <span className="chakra-node-hz">{c.freq} Hz</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Active chakra breathwork orb ── */
function ChakraOrb({ svgRef, labelRef, chakra }) {
  return (
    <div className="chakra-orb-container">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="chakra-orb-svg"
        style={{ '--chakra-color': chakra.colorLight, '--chakra-rgb': chakra.colorRgb }}
      >
        {/* Outer ripple rings */}
        <circle cx="100" cy="100" r="88" fill="none"
          stroke={`rgba(${chakra.colorRgb},0.12)`} strokeWidth="1" />
        <circle cx="100" cy="100" r="74" fill="none"
          stroke={`rgba(${chakra.colorRgb},0.18)`} strokeWidth="0.8" />

        {/* Petals — 8 rotated ellipses */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45} 100 100)`}>
            <ellipse cx="100" cy="44" rx="14" ry="40"
              fill={`rgba(${chakra.colorRgb},0.10)`}
              stroke={chakra.colorLight}
              strokeWidth="1" opacity="0.75" />
          </g>
        ))}
        {/* Inner petals */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={`i${i}`} transform={`rotate(${i * 45 + 22.5} 100 100)`}>
            <ellipse cx="100" cy="56" rx="9" ry="28"
              fill={`rgba(${chakra.colorRgb},0.06)`}
              stroke={`rgba(${chakra.colorRgb},0.5)`}
              strokeWidth="0.7" opacity="0.6" />
          </g>
        ))}

        {/* Center glow */}
        <circle cx="100" cy="100" r="16"
          fill={`rgba(${chakra.colorRgb},0.20)`}
          stroke={chakra.colorLight} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="7"
          fill={chakra.colorLight} opacity="0.5" />

        {/* Mantra symbol */}
        <text x="100" y="104" textAnchor="middle" fontSize="10"
          fill={chakra.colorLight} fontFamily="'Cinzel Decorative', serif"
          opacity="0.8">{chakra.symbol}</text>
      </svg>

      <p ref={labelRef} className="chakra-breath-label" style={{ color: chakra.colorLight }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ChakraMeditationPage() {
  // phase: 'intro' | 'active' | 'transition' | 'done'
  const [phase,        setPhase]        = useState('intro');
  const [chakraIndex,  setChakraIndex]  = useState(0);
  const [elapsed,      setElapsed]      = useState(0);
  const [completed,    setCompleted]    = useState(new Set());
  const [transMsg,     setTransMsg]     = useState('');

  // DOM refs for 60fps direct animation
  const orbSvgRef   = useRef(null);
  const labelRef    = useRef(null);
  const lastLabelRef = useRef('');

  // Audio refs
  const toneRef      = useRef(null);   // { osc, osc2 }
  const animFrameRef = useRef(null);
  const breathStart  = useRef(null);
  const timerRef     = useRef(null);

  const chakra = CHAKRAS[chakraIndex];

  /* ── Start / stop solfeggio tone ── */
  const startTone = useCallback(async (freq) => {
    await Tone.start();
    if (toneRef.current) {
      toneRef.current.osc.stop();
      toneRef.current.osc2.stop();
      toneRef.current.osc.dispose();
      toneRef.current.osc2.dispose();
    }
    const t = createSolfeggioTone(freq);
    t.osc.start();
    t.osc2.start();
    toneRef.current = t;
  }, []);

  const stopTone = useCallback(() => {
    if (toneRef.current) {
      try {
        toneRef.current.osc.stop();
        toneRef.current.osc2.stop();
        setTimeout(() => {
          toneRef.current?.osc.dispose();
          toneRef.current?.osc2.dispose();
          toneRef.current = null;
        }, 500);
      } catch (_) {}
    }
  }, []);

  /* ── Breathwork rAF loop — writes directly to DOM ── */
  const animateBreath = useCallback(() => {
    if (!breathStart.current) breathStart.current = performance.now();
    const cyclePos = ((performance.now() - breathStart.current) / 1000) % BREATHE_CYCLE;

    let scale, glow, label;
    if (cyclePos < BREATHE_INHALE) {
      const t = 0.5 * (1 - Math.cos(Math.PI * cyclePos / BREATHE_INHALE));
      scale = 0.55 + 0.70 * t;
      glow  = 8  + 38 * t;
      label = 'Breathe In';
    } else if (cyclePos < BREATHE_INHALE + BREATHE_HOLD) {
      scale = 1.25; glow = 46; label = 'Hold';
    } else {
      const t = 0.5 * (1 - Math.cos(Math.PI * (cyclePos - BREATHE_INHALE - BREATHE_HOLD) / BREATHE_EXHALE));
      scale = 1.25 - 0.70 * t;
      glow  = 46  - 38 * t;
      label = 'Breathe Out';
    }

    if (orbSvgRef.current) {
      const c = CHAKRAS[chakraIndex];
      orbSvgRef.current.style.transform = `scale(${scale})`;
      orbSvgRef.current.style.filter    = `drop-shadow(0 0 ${glow.toFixed(1)}px rgba(${c.colorRgb},0.65))`;
    }
    if (labelRef.current && label !== lastLabelRef.current) {
      labelRef.current.textContent = label;
      lastLabelRef.current = label;
    }

    animFrameRef.current = requestAnimationFrame(animateBreath);
  }, [chakraIndex]);

  /* ── Begin a chakra session ── */
  const beginChakra = useCallback(async (index) => {
    setChakraIndex(index);
    setElapsed(0);
    setPhase('active');
    breathStart.current   = null;
    lastLabelRef.current  = '';
    await startTone(CHAKRAS[index].freq);
  }, [startTone]);

  /* ── rAF on active phase ── */
  useEffect(() => {
    if (phase !== 'active') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    animFrameRef.current = requestAnimationFrame(animateBreath);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase, animateBreath]);

  /* ── 1-second timer ── */
  useEffect(() => {
    if (phase !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= CHAKRA_DURATION) {
          clearInterval(timerRef.current);
          handleChakraComplete();
          return CHAKRA_DURATION;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, chakraIndex]);

  /* ── Chakra complete → bell → transition → next ── */
  const handleChakraComplete = useCallback(() => {
    stopTone();
    setPhase('transition');

    const isLast = chakraIndex === 6;
    setTransMsg(isLast
      ? 'Journey Complete · Namaste 🙏'
      : `${CHAKRAS[chakraIndex + 1].english} awakening…`
    );

    setCompleted(prev => new Set([...prev, chakraIndex]));

    // Play bell(s)
    playBell(-8);
    setTimeout(() => playBell(-16), 1800);
    if (isLast) setTimeout(() => playBell(-20), 3600);

    // Move to next or done after 4s
    setTimeout(() => {
      if (isLast) {
        setPhase('done');
      } else {
        beginChakra(chakraIndex + 1);
      }
    }, 4000);
  }, [chakraIndex, stopTone, beginChakra]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      stopTone();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopTone]);

  /* ── Start handler (from intro) ── */
  const handleStart = async () => {
    await Tone.start();
    beginChakra(0);
  };

  /* ── Restart ── */
  const handleRestart = () => {
    stopTone();
    setPhase('intro');
    setChakraIndex(0);
    setElapsed(0);
    setCompleted(new Set());
  };

  const remaining = CHAKRA_DURATION - elapsed;

  /* ══════════ RENDER ══════════ */
  return (
    <div
      className="chakra-page"
      id="chakra-page-root"
      style={{
        '--chakra-color':    phase === 'active' || phase === 'transition' ? chakra.colorLight : '#5cb88a',
        '--chakra-rgb':      phase === 'active' || phase === 'transition' ? chakra.colorRgb   : '92,184,138',
        '--chakra-color-bg': phase === 'active' || phase === 'transition'
          ? `rgba(${chakra.colorRgb},0.07)`
          : 'rgba(92,184,138,0.03)',
      }}
    >
      {/* Dynamic color backdrop */}
      <div className="chakra-backdrop" />

      {/* Header */}
      <header className="chakra-header">
        <Link to="/" className="concept-back-link" aria-label="Return to graph">← Devlok</Link>
        <span className="chakra-header-title">
          {phase === 'active' || phase === 'transition'
            ? `${chakra.name} · ${chakra.freq} Hz`
            : 'सप्त चक्र · Seven Chakras'}
        </span>
        <Link to="/meditate" className="concept-back-link">🌸 General</Link>
      </header>

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <main className="chakra-intro" id="chakra-intro">
          <div className="chakra-intro-top">
            <h1 className="chakra-intro-title">7 Chakra Journey</h1>
            <p className="chakra-intro-sub">
              Seven energy centers. Seven solfeggio frequencies.<br />
              One minute each. Seven minutes total.
            </p>
          </div>

          <div className="chakra-intro-body">
            {/* Spine preview */}
            <ChakraSpine activeIndex={-1} completedSet={new Set()} />

            {/* Info panel */}
            <div className="chakra-intro-info">
              <div className="chakra-intro-steps">
                {CHAKRAS.map(c => (
                  <div key={c.id} className="chakra-intro-row"
                    style={{ '--chakra-color': c.colorLight, '--chakra-rgb': c.colorRgb }}>
                    <span className="chakra-intro-orb">{c.symbol}</span>
                    <span className="chakra-intro-row-name">{c.name}</span>
                    <span className="chakra-intro-row-hz">{c.freq} Hz</span>
                    <span className="chakra-intro-row-mantra">· {c.mantra}</span>
                  </div>
                ))}
              </div>
              <p className="chakra-intro-note">
                Find a quiet space. Sit upright. Close your eyes between transitions.
              </p>
              <button className="chakra-begin-btn btn btn-primary" onClick={handleStart} id="chakra-begin-btn">
                Begin the Journey
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── ACTIVE CHAKRA ── */}
      {(phase === 'active' || phase === 'transition') && (
        <main className="chakra-active" id="chakra-active">
          {/* Left: spine nav */}
          <aside className="chakra-sidebar">
            <ChakraSpine activeIndex={chakraIndex} completedSet={completed} />
          </aside>

          {/* Center: orb + info */}
          <section className="chakra-center">
            {phase === 'transition' ? (
              <div className="chakra-transition-msg">
                <div className="chakra-bell-icon">🔔</div>
                <p className="chakra-trans-text">{transMsg}</p>
              </div>
            ) : (
              <>
                {/* Chakra orb */}
                <ChakraOrb svgRef={orbSvgRef} labelRef={labelRef} chakra={chakra} />

                {/* Timer */}
                <div className="chakra-timer">
                  <span className="chakra-timer-val" style={{ color: chakra.colorLight }}>
                    {formatTime(remaining)}
                  </span>
                  <span className="chakra-timer-lbl">remaining</span>
                </div>

                {/* Affirmation */}
                <p className="chakra-affirmation" style={{ color: chakra.colorLight }}>
                  "{chakra.affirmation}"
                </p>
              </>
            )}
          </section>

          {/* Right: chakra details */}
          {phase === 'active' && (
            <aside className="chakra-info-panel">
              <div className="chakra-info-badge" style={{ background: `rgba(${chakra.colorRgb},0.15)`, borderColor: chakra.colorLight }}>
                <span className="chakra-info-symbol" style={{ color: chakra.colorLight }}>{chakra.symbol}</span>
              </div>
              <h2 className="chakra-info-name" style={{ color: chakra.colorLight }}>{chakra.name}</h2>
              <p className="chakra-info-english">{chakra.english}</p>
              <div className="chakra-info-divider" style={{ background: chakra.colorLight }} />
              <div className="chakra-info-row">
                <span className="chakra-info-key">Frequency</span>
                <span className="chakra-info-val" style={{ color: chakra.colorLight }}>{chakra.freq} Hz</span>
              </div>
              <div className="chakra-info-row">
                <span className="chakra-info-key">Mantra</span>
                <span className="chakra-info-val" style={{ color: chakra.colorLight }}>{chakra.mantra}</span>
              </div>
              <div className="chakra-info-row">
                <span className="chakra-info-key">Element</span>
                <span className="chakra-info-val">{chakra.element}</span>
              </div>
              <div className="chakra-info-row">
                <span className="chakra-info-key">Located at</span>
                <span className="chakra-info-val">{chakra.position}</span>
              </div>
              <div className="chakra-info-progress">
                <div className="chakra-progress-bar">
                  <div
                    className="chakra-progress-fill"
                    style={{
                      width: `${(elapsed / CHAKRA_DURATION) * 100}%`,
                      background: chakra.colorLight,
                    }}
                  />
                </div>
                <span className="chakra-progress-label">
                  {chakraIndex + 1} / 7
                </span>
              </div>
            </aside>
          )}
        </main>
      )}

      {/* ── DONE ── */}
      {phase === 'done' && (
        <main className="chakra-done" id="chakra-done">
          <div className="chakra-done-icon">🙏</div>
          <h2 className="chakra-done-title">Journey Complete</h2>
          <p className="chakra-done-msg">
            All seven chakras have been awakened.<br />
            Carry this frequency with you.
          </p>
          <div className="chakra-done-grid">
            {CHAKRAS.map(c => (
              <div key={c.id} className="chakra-done-orb"
                style={{ background: `rgba(${c.colorRgb},0.2)`, borderColor: c.colorLight, color: c.colorLight }}>
                {c.symbol}
              </div>
            ))}
          </div>
          <div className="chakra-done-actions">
            <button className="btn btn-primary" onClick={handleRestart}>Journey Again</button>
            <Link to="/" className="btn btn-cancel">Return to Devlok</Link>
          </div>
        </main>
      )}
    </div>
  );
}
