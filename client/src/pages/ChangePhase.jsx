import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePhase } from '../api/soul.js';
import { LIFE_PHASES } from '../constants/lifePhases.js';

export default function ChangePhase() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdatePhase = async () => {
    if (!selectedPhase) return;
    setLoading(true);
    setError(null);
    try {
      await updatePhase(selectedPhase, true); // true = resolved previous phase
      navigate('/soul');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update phase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soul-screen" style={{ minHeight: '100vh' }}>
      <div className="soul-screen__inner">
      {/* Back button top left */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button 
          onClick={() => navigate('/soul')} 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--amber)',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8D5A3', textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Transition Your Phase
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '3rem', fontSize: '1rem', lineHeight: '1.6' }}>
          As you evolve, so does your journey. Select the phase that resonates most with your current state of being. By transitioning, you acknowledge the lessons of your past and open yourself to the trials ahead.
        </p>

        {error && <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
          {Object.entries(LIFE_PHASES).map(([key, phase]) => (
            <div 
              key={key}
              onClick={() => setSelectedPhase(key)}
              className={`phase-selector-card ${selectedPhase === key ? 'selected' : ''}`}
              style={{
                border: selectedPhase === key ? `1px solid ${phase.color}` : '1px solid rgba(255,255,255,0.1)',
                background: selectedPhase === key ? `rgba(${parseInt(phase.color.slice(1,3), 16)},${parseInt(phase.color.slice(3,5), 16)},${parseInt(phase.color.slice(5,7), 16)}, 0.1)` : 'rgba(255,255,255,0.03)',
                padding: '20px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {selectedPhase === key && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', color: phase.color, fontSize: '1.2rem' }}>✦</div>
              )}
              <h3 style={{ color: phase.color, fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', margin: '0 0 10px 0' }}>{phase.label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '0', lineHeight: 1.4 }}>{phase.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleUpdatePhase}
            disabled={!selectedPhase || loading}
            className="soul-btn"
            style={{
              background: selectedPhase ? 'rgba(212,151,58,0.2)' : 'rgba(255,255,255,0.05)',
              border: selectedPhase ? '1px solid rgba(212,151,58,0.6)' : '1px solid rgba(255,255,255,0.1)',
              color: selectedPhase ? 'var(--amber)' : 'rgba(255,255,255,0.4)',
              padding: '12px 32px',
              fontSize: '1rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: selectedPhase ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Committing...' : 'Embrace New Phase'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
