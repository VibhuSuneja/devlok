import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  SURVEY_QUESTIONS,
  CATEGORY_META,
  getDailyAffirmation,
  calculateProfile,
} from '../data/affirmations.js';

/* ── Hex → rgba helper for canvas ── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Wrap text on canvas ── */
function canvasWrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word, n) => {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line.trim(), x, curY);
  return curY + lineHeight;
}

/* ── Generate 1080×1080 affirmation image for Instagram ── */
async function generateShareImage(text, catKey) {
  const meta = CATEGORY_META[catKey] || CATEGORY_META.peace;
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#04020F';
  ctx.fillRect(0, 0, W, H);

  // Radial colour wash from category colour
  const grad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, hexToRgba(meta.color, 0.18));
  grad.addColorStop(1, hexToRgba('#04020F', 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = hexToRgba(meta.color, 0.5);
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  // Inner border
  ctx.strokeStyle = hexToRgba(meta.color, 0.15);
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // ── Brand header ──
  ctx.textAlign = 'center';
  ctx.fillStyle = meta.color;
  ctx.font = '700 52px Georgia, serif';
  ctx.letterSpacing = '0.15em';
  ctx.fillText('D E V L O K', W / 2, 152);

  ctx.fillStyle = hexToRgba(meta.color, 0.5);
  ctx.font = '26px Georgia, serif';
  ctx.fillText('— ✦ —', W / 2, 198);

  // Category
  ctx.fillStyle = hexToRgba(meta.color, 0.9);
  ctx.font = '800 28px Arial, sans-serif';
  ctx.fillText(`${meta.symbol}  ${meta.name.toUpperCase()}`, W / 2, 258);

  // ── Affirmation text ──
  ctx.fillStyle = '#e8d5a3';
  ctx.font = 'italic 44px Georgia, serif';
  const quoteText = `\u201c${text}\u201d`;
  canvasWrapText(ctx, quoteText, W / 2, 380, 900, 70);

  // ── Footer ──
  ctx.fillStyle = hexToRgba(meta.color, 0.45);
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('✦ Daily Affirmations · devlok.in/affirmations', W / 2, H - 80);

  return canvas;
}

/* ── Share to X (Twitter) ── */
function shareToX(text) {
  const msg = `✦ Today's affirmation:\n\n"${text}"\n\n#Devlok #DailyAffirmation #MindfulLiving`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent('https://devlok.in/affirmations')}`;
  window.open(url, '_blank', 'noopener,width=560,height=600');
}

/* ── Share to Instagram (canvas → Web Share / download) ── */
async function shareToInstagram(text, catKey) {
  const canvas = await generateShareImage(text, catKey);
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], 'devlok-affirmation.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // Mobile: share directly to Instagram / any app
      try {
        await navigator.share({ files: [file], title: 'Daily Affirmation · Devlok', text });
        return;
      } catch (_) { /* fall through to download */ }
    }
    // Desktop fallback: download the image
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'devlok-affirmation.jpg';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }, 'image/jpeg', 0.92);
}

/*
 * ── Affirmation Page ──────────────────────────────────────────────────────
 * Phase: 'landing' → 'survey' → 'result'
 *
 * The survey captures the user's current emotional state, life focus, and
 * aspirations across 7 questions. Answers weight 10 categories.
 * The top 3 categories drive today's personalised affirmations.
 *
 * Profile saved in localStorage so returning users skip the survey
 * unless they choose to retake it.
 * ──────────────────────────────────────────────────────────────────────────
 */

const PROFILE_KEY   = 'devlok_affirmation_profile';
const SURVEY_DATE_KEY = 'devlok_affirmation_survey_date';
const AFFIRMATION_IDX_KEY = 'devlok_affirmation_idx'; // which of the 3 cards is showing

/* ── Days since survey was taken ── */
function daysSinceSurvey() {
  const stored = localStorage.getItem(SURVEY_DATE_KEY);
  if (!stored) return Infinity;
  return Math.floor((Date.now() - Number(stored)) / 86400000);
}

/* ── Star / sparkle decoration ── */
function Sparkle({ style }) {
  return <span className="affirmation-sparkle" style={style} aria-hidden="true">✦</span>;
}

/* ── Category badge ── */
function CategoryBadge({ catKey, style = {} }) {
  const meta = CATEGORY_META[catKey];
  if (!meta) return null;
  return (
    <span
      className="affirmation-category-badge"
      style={{ '--cat-color': meta.color, ...style }}
    >
      {meta.symbol} {meta.name}
    </span>
  );
}

/* ── Survey progress bar ── */
function ProgressBar({ current, total }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="affirmation-progress-wrap" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      <div className="affirmation-progress-track">
        <div className="affirmation-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="affirmation-progress-label">{current} of {total}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AffirmationPage() {
  const [phase,           setPhase]          = useState('landing'); // 'landing' | 'survey' | 'result'
  const [questionIndex,   setQuestionIndex]  = useState(0);
  const [answers,         setAnswers]        = useState({});   // { questionId: weight }
  const [selectedOption,  setSelectedOption] = useState(null); // index of chosen option on current Q
  const [profile,         setProfile]        = useState(null); // ranked category array
  const [activeCard,      setActiveCard]     = useState(0);    // 0/1/2 — which of the 3 affirmations
  const [copied,          setCopied]         = useState(false);
  const [animDir,         setAnimDir]        = useState('forward'); // for slide animation

  const cardRef    = useRef(null);
  const [sharing,  setSharing] = useState(false);   // Instagram button loading state

  /* ── Restore saved profile ── */
  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      const idx = Number(localStorage.getItem(AFFIRMATION_IDX_KEY) || 0);
      setActiveCard(idx);
      setPhase('result');
    }
  }, []);

  /* ── Survey: select an option ── */
  const selectOption = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  /* ── Survey: go to next question ── */
  const nextQuestion = () => {
    if (selectedOption === null) return;
    const q    = SURVEY_QUESTIONS[questionIndex];
    const opt  = q.options[selectedOption];

    const newAnswers = { ...answers, [q.id]: opt.weight };

    if (questionIndex < SURVEY_QUESTIONS.length - 1) {
      setAnimDir('forward');
      setAnswers(newAnswers);
      setSelectedOption(null);
      setQuestionIndex(i => i + 1);
    } else {
      // Survey complete
      const ranked = calculateProfile(newAnswers);
      setProfile(ranked);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(ranked));
      localStorage.setItem(SURVEY_DATE_KEY, String(Date.now()));
      localStorage.setItem(AFFIRMATION_IDX_KEY, '0');
      setActiveCard(0);
      setPhase('result');
    }
  };

  /* ── Survey: go back ── */
  const prevQuestion = () => {
    if (questionIndex === 0) { setPhase('landing'); return; }
    setAnimDir('back');
    setSelectedOption(null);
    setQuestionIndex(i => i - 1);
  };

  /* ── Result: cycle affirmation card ── */
  const showCard = (idx) => {
    setActiveCard(idx);
    localStorage.setItem(AFFIRMATION_IDX_KEY, String(idx));
    setCopied(false);
  };

  /* ── Copy affirmation ── */
  const copyAffirmation = () => {
    if (!profile) return;
    const catKey = profile[activeCard];
    const text   = getDailyAffirmation(catKey);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  /* ── Share to X ── */
  const handleShareX = () => {
    if (!profile) return;
    shareToX(getDailyAffirmation(profile[activeCard]));
  };

  /* ── Share to Instagram ── */
  const handleShareInstagram = useCallback(async () => {
    if (!profile || sharing) return;
    setSharing(true);
    try {
      await shareToInstagram(getDailyAffirmation(profile[activeCard]), profile[activeCard]);
    } finally {
      setSharing(false);
    }
  }, [profile, activeCard, sharing]);

  /* ── Retake survey ── */
  const retakeSurvey = () => {
    setPhase('survey');
    setQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setAnimDir('forward');
  };

  /* ── Active question / affirmation data ── */
  const currentQ   = SURVEY_QUESTIONS[questionIndex];
  const topCats    = profile ? profile.slice(0, 3) : [];
  const activeCat  = topCats[activeCard];
  const affirmText = activeCat ? getDailyAffirmation(activeCat) : '';
  const catMeta    = activeCat ? CATEGORY_META[activeCat] : null;

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="affirmation-page" id="affirmation-page-root">
      {/* Ambient sparkles */}
      <Sparkle style={{ top: '12%', left: '8%',  fontSize: '1.4rem', animationDelay: '0s' }} />
      <Sparkle style={{ top: '22%', right: '12%',fontSize: '0.8rem', animationDelay: '1.2s' }} />
      <Sparkle style={{ top: '65%', left: '5%',  fontSize: '1rem',   animationDelay: '2.4s' }} />
      <Sparkle style={{ top: '80%', right: '8%', fontSize: '1.6rem', animationDelay: '0.8s' }} />
      <Sparkle style={{ top: '45%', left: '92%', fontSize: '0.7rem', animationDelay: '1.8s' }} />

      {/* ── Header ── */}
      <header className="affirmation-header">
        <Link to="/" className="concept-back-link">← Devlok</Link>
        <span className="affirmation-header-title">Pratidina Sankalpa</span>
        <span className="affirmation-header-spacer" />
      </header>

      {/* ══ PHASE: LANDING ══ */}
      {phase === 'landing' && (
        <main className="affirmation-landing" id="affirmation-landing">
          <div className="affirmation-landing-icon">🌅</div>
          <h1 className="affirmation-landing-title">Daily Affirmations</h1>
          <p className="affirmation-landing-sub">
            Your words shape your inner world.<br />
            Let us discover which ones you need today.
          </p>

          <div className="affirmation-landing-card">
            <div className="affirmation-landing-steps">
              <div className="affirmation-landing-step">
                <span className="affirmation-step-num">I</span>
                <span className="affirmation-step-text">Answer 7 reflective questions about your current state</span>
              </div>
              <div className="affirmation-landing-step">
                <span className="affirmation-step-num">II</span>
                <span className="affirmation-step-text">We identify your top 3 areas of focus and need</span>
              </div>
              <div className="affirmation-landing-step">
                <span className="affirmation-step-num">III</span>
                <span className="affirmation-step-text">Receive 3 personalised affirmations — renewed every day</span>
              </div>
            </div>
          </div>

          <button
            className="affirmation-begin-btn btn btn-primary"
            onClick={() => setPhase('survey')}
            id="affirmation-begin-btn"
          >
            Begin the Survey
          </button>

          {profile && (
            <button
              className="affirmation-skip-btn"
              onClick={() => setPhase('result')}
              id="affirmation-skip-btn"
            >
              View my affirmations →
            </button>
          )}
        </main>
      )}

      {/* ══ PHASE: SURVEY ══ */}
      {phase === 'survey' && currentQ && (
        <main className="affirmation-survey" id="affirmation-survey">
          <ProgressBar current={questionIndex + 1} total={SURVEY_QUESTIONS.length} />

          <div
            className={`affirmation-question-card ${animDir === 'forward' ? 'affirmation-slide-in' : 'affirmation-slide-in-back'}`}
            key={questionIndex}
          >
            <p className="affirmation-question-num">
              Question {questionIndex + 1} of {SURVEY_QUESTIONS.length}
            </p>
            <h2 className="affirmation-question-text">{currentQ.question}</h2>
            <p className="affirmation-question-sub">{currentQ.sub}</p>

            <div className="affirmation-options">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  className={`affirmation-option ${selectedOption === i ? 'affirmation-option--selected' : ''}`}
                  onClick={() => selectOption(i)}
                  id={`affirmation-option-${i}`}
                >
                  <span className="affirmation-option-icon">{opt.icon}</span>
                  <span className="affirmation-option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="affirmation-survey-nav">
            <button className="affirmation-nav-btn" onClick={prevQuestion}>
              ← Back
            </button>
            <button
              className={`affirmation-nav-btn affirmation-nav-btn--next ${selectedOption === null ? 'affirmation-nav-btn--disabled' : ''}`}
              onClick={nextQuestion}
              disabled={selectedOption === null}
            >
              {questionIndex === SURVEY_QUESTIONS.length - 1 ? 'Complete →' : 'Next →'}
            </button>
          </div>
        </main>
      )}

      {/* ══ PHASE: RESULT ══ */}
      {phase === 'result' && profile && catMeta && (
        <main className="affirmation-result" id="affirmation-result">
          {/* Category tabs */}
          <div className="affirmation-tabs" role="tablist">
            {topCats.map((cat, i) => {
              const m = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={i === activeCard}
                  className={`affirmation-tab ${i === activeCard ? 'affirmation-tab--active' : ''}`}
                  style={{ '--cat-color': m.color }}
                  onClick={() => showCard(i)}
                  id={`affirmation-tab-${i}`}
                >
                  <span className="affirmation-tab-icon">{m.symbol}</span>
                  <span className="affirmation-tab-name">{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main affirmation card */}
          <div
            className="affirmation-card"
            ref={cardRef}
            key={`${activeCat}-${activeCard}`}
            style={{ '--cat-color': catMeta.color }}
            role="tabpanel"
          >
            {/* Decorative element */}
            <div className="affirmation-card-ornament">— ✦ —</div>

            {/* Category label */}
            <CategoryBadge catKey={activeCat} />

            {/* The affirmation */}
            <blockquote className="affirmation-text">
              {affirmText}
            </blockquote>

            <div className="affirmation-card-ornament affirmation-card-ornament--bottom">— ✦ —</div>

            {/* Actions */}
            <div className="affirmation-card-actions">
              <button
                className={`affirmation-action-btn ${copied ? 'affirmation-action-btn--copied' : ''}`}
                onClick={copyAffirmation}
                id="affirmation-copy-btn"
              >
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>

              {/* Share to X */}
              <button
                className="affirmation-action-btn affirmation-action-btn--x"
                onClick={handleShareX}
                id="affirmation-share-x-btn"
                title="Share on X (Twitter)"
              >
                𝕏 Share
              </button>

              {/* Share to Instagram */}
              <button
                className={`affirmation-action-btn affirmation-action-btn--insta ${sharing ? 'affirmation-action-btn--loading' : ''}`}
                onClick={handleShareInstagram}
                disabled={sharing}
                id="affirmation-share-insta-btn"
                title="Download image for Instagram"
              >
                {sharing ? '⏳ Generating…' : '📸 Instagram'}
              </button>
            </div>
          </div>

          {/* Day counter / next refresh info */}
          <p className="affirmation-refresh-note">
            ✦ Your affirmations refresh each day — a new seed of intention with each sunrise
          </p>

          {/* Survey profile summary */}
          <div className="affirmation-profile-summary">
            <p className="affirmation-profile-label">Your current focus areas</p>
            <div className="affirmation-profile-cats">
              {topCats.map((cat, i) => (
                <CategoryBadge key={cat} catKey={cat} style={{ opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          </div>

          {/* Retake */}
          <button
            className="affirmation-retake-btn"
            onClick={retakeSurvey}
            id="affirmation-retake-btn"
          >
            ↺ Retake Survey — my feelings have shifted
          </button>

          {/* Insta hint (desktop) */}
          <p className="affirmation-insta-hint">
            📸 Tap Instagram to download a 1080×1080 shareable image · On mobile, share directly to Stories
          </p>
        </main>
      )}
    </div>
  );
}
