// client/src/components/soul/ReflectionInput.jsx
import React, { useState } from 'react';

export default function ReflectionInput({ question, isSubmitting, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const isTooShort = answer.trim().length < 10;
  const isTooLong = answer.trim().length > 1000;

  const handleSubmit = () => {
    if (isTooShort) {
      setError('Your answer needs a little more depth (min 10 characters).');
      return;
    }
    if (isTooLong) {
      setError('Please keep your reflection under 1000 characters.');
      return;
    }
    setError('');
    onSubmit(answer.trim());
  };

  return (
    <div className="soul-reflection-input">
      <h2 className="soul-question__text" style={{ marginBottom: '24px' }}>
        {question.text}
      </h2>
      
      <div style={{ position: 'relative' }}>
        <textarea
          className="soul-textarea"
          placeholder="Write honestly. Your shadow is listening..."
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            if (error) setError('');
          }}
          disabled={isSubmitting}
          maxLength={1200}
        />
        
        <div style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '8px',
          fontSize: '.7rem',
          color: 'var(--text-dim)'
        }}>
          <span>{wordCount} words</span>
          {error && <span style={{ color: 'var(--destroy)' }}>{error}</span>}
        </div>
      </div>

      <button
        className={`soul-btn soul-btn--primary ${isTooShort || isSubmitting ? 'soul-btn--disabled' : ''}`}
        onClick={handleSubmit}
        disabled={isTooShort || isSubmitting}
        style={{ marginTop: '20px', width: '100%' }}
      >
        {isSubmitting ? 'Offering...' : 'Offer Reflection'}
      </button>

      <style>{`
        .soul-textarea {
          width: 100%;
          min-height: 140px;
          background: rgba(212,151,58,.04);
          border: 1px solid rgba(212,151,58,.2);
          border-radius: 6px;
          padding: 16px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          color: var(--text);
          resize: vertical;
          transition: border-color .3s;
          line-height: 1.5;
        }
        .soul-textarea:focus {
          outline: none;
          border-color: var(--amber-dim);
          background: rgba(212,151,58,.08);
        }
        .soul-textarea::placeholder {
          color: rgba(232,213,163,.3);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
