// client/src/pages/SoulOnboarding.jsx
// 9-screen onboarding flow for the Soul Profile Engine
// Screens: 1=Welcome, 2-6=5 Questions, 7=Phase Selection, 8=Generating, 9=Reveal

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ONBOARDING_QUESTIONS } from '../constants/onboardingQuestions.js';
import { ARCHETYPES } from '../constants/archetypes.js';
import PhaseSelector from '../components/soul/PhaseSelector.jsx';
import { onboardSoul } from '../api/soul.js';

const TOTAL_SCREENS = 9;

export default function SoulOnboarding() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [screen, setScreen] = useState(1);
  const [answers, setAnswers] = useState([]); // [{ questionId, optionId }]
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealData, setRevealData] = useState(null); // { archetype, soulProfile }
  const [error, setError] = useState(null);

  // Screen 8: submit to API AND show 3-second delay in parallel
  useEffect(() => {
    if (screen === 8 && !isSubmitting) {
      setIsSubmitting(true);

      // Fire API call immediately (parallel with the delay)
      onboardSoul(answers, selectedPhase)
        .then(async res => {
          setRevealData(res.data);
          if (user) await user.reload(); // Refresh Clerk publicMetadata
        })
        .catch(err => {
          console.error('Onboarding failed:', err);
          setError('Something went wrong. Please try again.');
        });

      // Advance to reveal screen after 3s regardless (API should be done by then)
      const timer = setTimeout(() => setScreen(9), 3000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => [...prev, { questionId, optionId }]);
    // Advance: questions are screens 2-6 (indices 0-4)
    setScreen(prev => prev + 1);
  };

  const handlePhaseConfirm = () => {
    if (!selectedPhase) return;
    setScreen(8); // Go to generating screen, which triggers submission
  };

  const handleSeeProfile = () => {
    navigate('/soul');
  };

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.publicMetadata?.hasSoulProfile) {
      navigate('/soul', { replace: true });
    }
  }, [user, navigate]);

  // ----- RENDER -----

  if (screen === 1) return <ScreenWelcome onBegin={() => setScreen(2)} />;

  // Screens 2–6: questions
  if (screen >= 2 && screen <= 6) {
    const question = ONBOARDING_QUESTIONS[screen - 2];
    return (
      <ScreenQuestion
        key={question.id}
        question={question}
        questionNumber={screen - 1}
        onSelect={handleOptionSelect}
      />
    );
  }

  if (screen === 7) {
    return (
      <ScreenPhaseSelection
        selected={selectedPhase}
        onSelect={setSelectedPhase}
        onConfirm={handlePhaseConfirm}
      />
    );
  }

  if (screen === 8) {
    return <ScreenGenerating />;
  }

  if (screen === 9) {
    if (error) return <ScreenError message={error} onRetry={() => navigate('/soul-onboarding')} />;
    if (!revealData) return <ScreenGenerating />; // still waiting for API
    const arch = ARCHETYPES[revealData.archetype?.key] || revealData.archetype;
    return <ScreenReveal archetype={arch} onContinue={handleSeeProfile} />;
  }

  return null;
}

// ── Sub-screens ────────────────────────────────────────────────────────────

function ScreenWelcome({ onBegin }) {
  return (
    <div className="soul-screen soul-screen--welcome">
      <div className="soul-screen__inner">
        <div className="soul-mandala">
          <div className="mandala-ring mandala-ring--1" />
          <div className="mandala-ring mandala-ring--2" />
          <div className="mandala-ring mandala-ring--3" />
          <div className="mandala-lamp">🪔</div>
        </div>
        <h1 className="soul-welcome__heading">
          Devlok has mapped<br />5000 years of Indian mythology.
        </h1>
        <p className="soul-welcome__sub">Now it will map you.</p>
        <button
          id="soul-begin-btn"
          className="soul-btn soul-btn--primary"
          onClick={onBegin}
        >
          Begin
        </button>
        <p className="soul-welcome__note">5 questions. No right answers. Your gut only.</p>
      </div>
    </div>
  );
}

function ScreenQuestion({ question, questionNumber, onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleClick = (optionId) => {
    if (selected) return; // prevent double-tap
    setSelected(optionId);
    // Brief highlight then advance
    setTimeout(() => {
      onSelect(question.id, optionId);
    }, 350);
  };

  return (
    <div className="soul-screen soul-screen--question">
      <div className="soul-screen__inner">
        <div className="soul-question__meta">
          <span className="soul-question__count">{questionNumber} of 5</span>
          <div className="soul-question__dots">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`soul-dot ${i <= questionNumber ? 'soul-dot--filled' : ''}`} />
            ))}
          </div>
        </div>

        <h2 className="soul-question__text">{question.text}</h2>

        <div className="soul-options">
          {question.options.map((option) => (
            <button
              key={option.id}
              id={`option-${option.id}`}
              className={`soul-option ${selected === option.id ? 'soul-option--selected' : ''} ${selected && selected !== option.id ? 'soul-option--faded' : ''}`}
              onClick={() => handleClick(option.id)}
            >
              <span className="soul-option__text">{option.text}</span>
              <span className="soul-option__arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenPhaseSelection({ selected, onSelect, onConfirm }) {
  return (
    <div className="soul-screen soul-screen--phase">
      <div className="soul-screen__inner soul-screen__inner--wide">
        <h2 className="soul-phase__heading">What are you walking through right now?</h2>
        <p className="soul-phase__sub">Be honest. You can change this anytime.</p>

        <PhaseSelector selected={selected} onSelect={onSelect} />

        <button
          id="soul-phase-confirm-btn"
          className={`soul-btn soul-btn--primary ${!selected ? 'soul-btn--disabled' : ''}`}
          onClick={onConfirm}
          disabled={!selected}
        >
          This is where I am →
        </button>
      </div>
    </div>
  );
}

function ScreenGenerating() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="soul-screen soul-screen--generating">
      <div className="soul-screen__inner">
        <div className="soul-generating__mandala">
          <div className="mandala-spin mandala-spin--1">⬡</div>
          <div className="mandala-spin mandala-spin--2">⬡</div>
          <div className="mandala-spin mandala-spin--3">⬡</div>
          <div className="mandala-center">🪔</div>
        </div>
        <p className="soul-generating__text">Reading your patterns{dots}</p>
        <p className="soul-generating__sub">Cross-referencing with 5000 years of mythology</p>
      </div>
    </div>
  );
}

function ScreenReveal({ archetype, onContinue }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!archetype) return null;

  return (
    <div className="soul-screen soul-screen--reveal" style={{ '--arch-color': archetype.color || '#6C63FF' }}>
      <div className={`soul-screen__inner soul-reveal ${visible ? 'soul-reveal--visible' : ''}`}>
        <p className="soul-reveal__label">Your mythological mirror is</p>
        <h1 className="soul-reveal__name">{archetype.name}</h1>
        <p className="soul-reveal__tagline">"{archetype.tagline}"</p>

        <div className="soul-reveal__divider" />

        <div className="soul-reveal__section">
          <span className="soul-reveal__section-label">What you're carrying</span>
          <p className="soul-reveal__section-text">{archetype.coreWound}</p>
        </div>

        <div className="soul-reveal__section">
          <span className="soul-reveal__section-label">What you're becoming</span>
          <p className="soul-reveal__section-text">{archetype.emergingStrength}</p>
        </div>

        <button
          id="soul-reveal-continue-btn"
          className="soul-btn soul-btn--primary"
          onClick={onContinue}
        >
          See My Profile
        </button>
      </div>
    </div>
  );
}

function ScreenError({ message, onRetry }) {
  return (
    <div className="soul-screen soul-screen--error">
      <div className="soul-screen__inner">
        <p className="soul-error__emoji">🔥</p>
        <h2 className="soul-error__heading">Something interrupted the ritual</h2>
        <p className="soul-error__message">{message}</p>
        <button className="soul-btn soul-btn--primary" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}
