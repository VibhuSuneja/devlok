// client/src/pages/DailyReflection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getTodayQuestion, submitReflection, getInterpretation, getReflectionHistory } from '../api/soul.js';
import ReflectionInput from '../components/soul/ReflectionInput.jsx';
import StreakBar from '../components/soul/StreakBar.jsx';

export default function DailyReflection() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // { question, alreadyReflected, streakInfo, nextAt }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [error, setError] = useState(null);
  
  // History state
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    getTodayQuestion()
      .then(res => {
        setData(res.data);
        loadHistory(1);
      })
      .catch(err => {
        console.error('Failed to load daily question:', err);
        setError('Could not load your mirror today.');
      })
      .finally(() => setLoading(false));
  }, [isLoaded]);

  const loadHistory = async (pageToLoad) => {
    setLoadingHistory(true);
    try {
      const res = await getReflectionHistory(pageToLoad);
      if (pageToLoad === 1) {
        setHistory(res.data.reflections);
      } else {
        setHistory(prev => [...prev, ...res.data.reflections]);
      }
      setHasMore(res.data.reflections.length > 0 && history.length + res.data.reflections.length < res.data.total);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (answerText) => {
    setIsSubmitting(true);
    try {
      const res = await submitReflection(
        data.question.id, 
        answerText
      );
      
      // We got reflectionId. Show milestone if any.
      if (res.data.milestoneUnlocked) {
        setMilestone(res.data.milestoneUnlocked);
      }
      
      setData({ ...data, alreadyReflected: true });
      
      // Start polling for interpretation
      pollInterpretation(res.data.reflectionId);
    } catch (err) {
      console.error('Failed to submit reflection:', err);
      setError(err.response?.data?.message || 'Failed to submit reflection.');
      setIsSubmitting(false);
    }
  };

  const pollInterpretation = (reflectionId) => {
    const interval = setInterval(async () => {
      try {
        const res = await getInterpretation(reflectionId);
        if (res.data.status === 'ready') {
          setInterpretation(res.data.interpretation);
          clearInterval(interval);
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(interval);
        setIsSubmitting(false);
      }
    }, 3000);
  };

  if (loading) return (
    <div className="soul-loading">
      <div className="mandala-lamp">🪔</div>
      <p className="soul-loading__text">Looking into the mirror...</p>
    </div>
  );

  if (error) return (
    <div className="soul-screen-container">
      <p style={{ color: 'var(--destroy)', textAlign: 'center' }}>{error}</p>
      <button className="soul-btn soul-btn--primary" onClick={() => navigate('/soul')} style={{ marginTop: '20px' }}>
        Back to Profile
      </button>
    </div>
  );

  if (data?.alreadyReflected) {
    return (
      <div className="soul-screen-container">
        <h2 className="soul-welcome__heading" style={{ textAlign: 'center' }}>The Mirror is Still</h2>
        <p className="soul-welcome__sub" style={{ textAlign: 'center', marginTop: '16px' }}>
          You have already reflected today. The mirror clears tomorrow at 6 AM.
        </p>
        
        {/* If we just submitted, show interpretation OR processing state */}
        {isSubmitting && !interpretation && (
           <div className="soul-loading" style={{ minHeight: 'auto', marginTop: '40px' }}>
             <p className="soul-loading__text" style={{ fontSize: '.6rem' }}>The ancient ones are reading your words...</p>
           </div>
        )}

        {interpretation && (
          <div className="soul-interpretation-block" style={{ marginTop: '40px' }}>
            <div className="soul-interpretation-header">The Ancient Mirror Reveals</div>
            <p className="soul-interpretation-myth">"{interpretation.mythologicalMirror}"</p>
            <div className="soul-interpretation-divider" />
            <p className="soul-interpretation-insight">{interpretation.insight}</p>
          </div>
        )}

        {milestone && (
          <div className="soul-milestone-toast">
            <span style={{ fontSize: '1.2rem' }}>🌟</span>
            <div>
              <div style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--amber)' }}>Milestone Unlocked</div>
              <div style={{ fontSize: '.85rem' }}>{milestone.label}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
          <button className="soul-btn soul-btn--primary" onClick={() => navigate('/soul')}>
            Return to Journey
          </button>
          <button className="soul-btn" onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
            Exit to Devlok
          </button>
        </div>
        
        <style>{`
          .soul-screen-container { max-width: 600px; margin: 0 auto; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; }
          .soul-interpretation-block { background: rgba(212,151,58,.05); border: 1px solid rgba(212,151,58,.2); padding: 24px; border-radius: 8px; text-align: center; width: 100%; }
          .soul-interpretation-header { font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; }
          .soul-interpretation-myth { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-style: italic; color: rgba(232,213,163,.9); line-height: 1.5; }
          .soul-interpretation-divider { width: 40px; height: 1px; background: rgba(212,151,58,.3); margin: 16px auto; }
          .soul-interpretation-insight { font-size: .9rem; color: var(--text); line-height: 1.5; }
          .soul-milestone-toast { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); padding: 12px 20px; border-radius: 8px; margin-top: 24px; animation: slideUp 0.5s ease-out; }
          .soul-history-list { margin-top: 60px; width: 100%; display: flex; flex-direction: column; gap: 24px; align-items: stretch; }
          .soul-history-item { padding: 20px; border: 1px solid rgba(255,255,255,.05); border-radius: 8px; background: rgba(0,0,0,.2); text-align: left; }
          .soul-history-question { font-size: .8rem; color: var(--text-dim); margin-bottom: 8px; line-height: 1.4; }
          .soul-history-answer { font-size: .95rem; color: var(--text); font-style: italic; margin-bottom: 16px; line-height: 1.5; }
          .soul-history-meta { font-size: .65rem; color: rgba(255,255,255,.3); letter-spacing: .05em; margin-bottom: 12px; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* History Section */}
        {history.length > 0 && (
          <div className="soul-history-list">
            <h3 style={{ fontSize: '1rem', color: 'var(--amber)', textAlign: 'center', marginBottom: '8px' }}>Your Past Reflections</h3>
            <div className="soul-interpretation-divider" style={{ margin: '0 auto 16px auto', width: '20%' }} />
            {history.map(ref => (
              <div key={ref._id} className="soul-history-item">
                <div className="soul-history-meta">{new Date(ref.reflectedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</div>
                <div className="soul-history-question">{ref.question?.text}</div>
                <div className="soul-history-answer">"{ref.answer?.text}"</div>
                {ref.interpretation && (
                  <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid rgba(212,151,58,.3)' }}>
                    <p style={{ fontSize: '.8rem', color: 'rgba(232,213,163,.8)', marginBottom: '4px' }}>Mirror: {ref.interpretation.mythologicalMirror}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>Insight: {ref.interpretation.insight}</p>
                  </div>
                )}
              </div>
            ))}
            {hasMore && (
              <button 
                className="soul-btn"
                style={{ alignSelf: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text-dim)', fontSize: '.7rem', padding: '8px 16px' }}
                onClick={() => loadHistory(page + 1)}
                disabled={loadingHistory}
              >
                {loadingHistory ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="soul-screen-container">
      <div style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
         <button 
           onClick={() => navigate('/soul')}
           style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
         >
           ← Back
         </button>
      </div>
      
      <StreakBar current={data.streakInfo.current} longest={data.streakInfo.longest} />

      <ReflectionInput 
        question={data.question} 
        isSubmitting={isSubmitting} 
        onSubmit={handleSubmit} 
      />
      
      {/* History Section (if any elements exist) */}
      {history.length > 0 && (
        <div className="soul-history-list" style={{ marginTop: '60px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignSelf: 'stretch' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--amber)', textAlign: 'center', marginBottom: '8px' }}>Your Past Reflections</h3>
          <div className="soul-interpretation-divider" style={{ height: '1px', background: 'rgba(212,151,58,.3)', margin: '0 auto 16px auto', width: '20%' }} />
          {history.map(ref => (
            <div key={ref._id} className="soul-history-item" style={{ padding: '20px', border: '1px solid rgba(255,255,255,.05)', borderRadius: '8px', background: 'rgba(0,0,0,.2)', textAlign: 'left' }}>
              <div className="soul-history-meta" style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)', letterSpacing: '.05em', marginBottom: '12px' }}>{new Date(ref.reflectedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</div>
              <div className="soul-history-question" style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginBottom: '8px', lineHeight: 1.4 }}>{ref.question?.text}</div>
              <div className="soul-history-answer" style={{ fontSize: '.95rem', color: 'var(--text)', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.5 }}>"{ref.answer?.text}"</div>
              {ref.interpretation && (
                <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid rgba(212,151,58,.3)' }}>
                  <p style={{ fontSize: '.8rem', color: 'rgba(232,213,163,.8)', marginBottom: '4px' }}>Mirror: {ref.interpretation.mythologicalMirror}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-dim)' }}>Insight: {ref.interpretation.insight}</p>
                </div>
              )}
            </div>
          ))}
          {hasMore && (
            <button 
              className="soul-btn"
              style={{ alignSelf: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'var(--text-dim)', fontSize: '.7rem', padding: '8px 16px', marginTop: '16px' }}
              onClick={() => loadHistory(page + 1)}
              disabled={loadingHistory}
            >
              {loadingHistory ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
      
      <style>{`
        .soul-screen-container { max-width: 600px; margin: 0 auto; padding: 60px 20px; display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}
