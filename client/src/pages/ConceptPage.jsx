import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStreak } from '../hooks/useStreak';
import { shareOrDownload } from '../utils/generateShareCard';
import concepts from '../data/concepts.json';
import posthog from 'posthog-js';
import axios from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { useContext } from 'react';

// Devlok official go-live date — Starts the concept sequence from Day 1
const LAUNCH_DATE = new Date('2026-03-23T00:00:00Z');

function getDayIndex() {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceLaunch = Math.floor((now - LAUNCH_DATE) / msPerDay);
  return daysSinceLaunch % concepts.length;
}

function StreakBadge({ streak }) {
  if (!streak || streak < 2) return null;
  return (
    <div className="streak-badge" aria-label={`${streak} day streak`}>
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{streak}</span>
      <span className="streak-label">day streak</span>
    </div>
  );
}

function CategoryLabel({ category }) {
  return (
    <div className="concept-category-label">
      <span className="concept-category-glyph">✦</span>
      {category}
      <span className="concept-category-glyph">✦</span>
    </div>
  );
}

function RelatedCharacterChip({ char }) {
  return (
    <Link
      to={`/?focus=${char.id}`}
      className={`related-chip related-chip--${char.type}`}
      aria-label={`View ${char.label} in Graph`}
    >
      <span className="related-chip__name">{char.label}</span>
      <span className="related-chip__sanskrit">{char.sanskrit}</span>
    </Link>
  );
}

function ShareButtons({ concept, sharing, onShare }) {
  return (
    <div className="concept-actions">
      <p className="concept-actions-heading">Share this concept</p>
      <div className="concept-actions-grid">
        <button
          className="action-btn action-btn--ig"
          onClick={() => onShare('square')}
          disabled={sharing}
          aria-label="Share as Instagram card"
        >
          {sharing === 'square' ? (
            <span className="action-spinner" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </>
          )}
        </button>
        <button
          className="action-btn action-btn--x"
          onClick={() => onShare('landscape')}
          disabled={sharing}
          aria-label="Share as Twitter card"
        >
          {sharing === 'landscape' ? (
            <span className="action-spinner" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              Twitter / X
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ConceptPage() {
  const { user, updateUser } = useContext(AuthContext);
  const { streak } = useStreak();
  const [sharing, setSharing] = useState(null); // 'square' | 'landscape' | null
  const [shareError, setShareError] = useState('');

  const dayIndex = useMemo(() => getDayIndex(), []);
  const concept = useMemo(() => concepts[dayIndex], [dayIndex]);

  const hasAwarded = React.useRef(false);

  useEffect(() => {
    if (!concept) return;
    posthog.capture('concept_read', { concept_id: concept.id, title: concept.title });

    // Award Shraddha only once per page load, only if logged in
    if (user && dayIndex !== undefined && !hasAwarded.current) {
      hasAwarded.current = true;
      axios.put('/users/concepts-read', { conceptId: dayIndex })
        .then(res => {
          if (res.data.awarded > 0) {
            updateUser({
              shraddha: res.data.shraddha,
              conceptsRead: res.data.conceptsRead
            });
          }
        })
        .catch(err => console.error('Shraddha award error:', err));
    }
  }, [concept, dayIndex]); // intentionally excludes user/updateUser — ref guards re-execution


  const handleShare = async (format) => {
    posthog.capture('share_clicked', { concept_id: concept.id, format });
    setSharing(format);
    setShareError('');
    try {
      await shareOrDownload(concept, format);
    } catch (err) {
      console.error('Share error:', err);
      setShareError('Could not generate the image. Please try again.');
    } finally {
      setSharing(null);
    }
  };

  if (!concept) {
    return (
      <div className="concept-page concept-page--error">
        <p>No concept available today. Check back tomorrow.</p>
        <Link to="/" className="concept-back-link">← Return to Devlok</Link>
      </div>
    );
  }

  return (
    <div className="concept-page" id="concept-page-root">
      {/* ── Header bar ── */}
      <header className="concept-header">
        <Link to="/" className="concept-back-link" aria-label="Return to graph">
          ← Devlok
        </Link>
        <div className="concept-header-center">
          <span className="concept-header-title">Concept of the Day</span>
        </div>
        <StreakBadge streak={streak} />
      </header>

      {/* ── Main card ── */}
      <main className="concept-main" id="concept-card">
        {/* Category */}
        <CategoryLabel category={concept.category} />

        {/* Title */}
        <h1 className="concept-title">{concept.title}</h1>

        {/* Gold divider */}
        <div className="concept-divider" role="separator" />

        {/* Hook */}
        <p className="concept-hook">{concept.hook}</p>

        {/* Gold divider */}
        <div className="concept-divider concept-divider--short" role="separator" />

        {/* Essay */}
        <article className="concept-essay">
          {concept.essay.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        {/* Related characters */}
        {concept.relatedCharacters?.length > 0 && (
          <section className="related-characters" aria-label="Related characters">
            <p className="related-characters__heading">Explore these figures</p>
            <div className="related-characters__chips">
              {concept.relatedCharacters.map((char) => (
                <RelatedCharacterChip key={char.id} char={char} />
              ))}
            </div>
          </section>
        )}

        {/* Share */}
        {shareError && <p className="action-error">{shareError}</p>}
        <ShareButtons concept={concept} sharing={sharing} onShare={handleShare} />

        {/* Tomorrow teaser */}
        {concept.tomorrowTeaser && (
          <div className="tomorrow-teaser" aria-label="Tomorrow's concept">
            <span className="tomorrow-teaser__label">Tomorrow</span>
            <span className="tomorrow-teaser__text">{concept.tomorrowTeaser}</span>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="concept-footer">
        <Link to="/" className="concept-footer-link">Explore the full mythology graph →</Link>
      </footer>
    </div>
  );
}
