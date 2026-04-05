import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

function AskRishiPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'rishi', text: 'I am the Rishi of Devlok. I hold the complete tapestry of characters and relations in my mind. What deeper truth do you seek?' }
  ]);
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setConversation(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post('/rishi/ask', 
        { question: userText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('devlok_token')}` } }
      );
      
      setConversation(prev => [...prev, { role: 'rishi', text: response.data.answer }]);
    } catch (err) {
      console.error(err);
      setConversation(prev => [...prev, { role: 'rishi', text: "The ether is clouded. I cannot access the Devlok archives right now (API error)." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rishi-page">
      <div className="rishi-header">
        <button className="btn btn-cancel" onClick={() => navigate('/')}>
          ← Return to Map
        </button>
        <div className="rishi-title">
          <div className="rishi-orb"></div>
          <h2>ASK THE RISHI</h2>
        </div>
        <div style={{ width: '80px' }}></div> {/* Spacer to center title */}
      </div>

      <div className="rishi-chat-container">
        {conversation.map((msg, idx) => (
          <div key={idx} className={`rishi-message rishi-message--${msg.role}`}>
            {msg.role === 'rishi' && <span className="rishi-avatar">🕉</span>}
            <div className="rishi-bubble">
              {msg.text.split('\n').map((line, i) => (
                // Super basic markdown bold parser
                <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </div>
            {msg.role === 'user' && <span className="rishi-avatar" style={{ background: '#333' }}>{user?.name?.[0]?.toUpperCase() || 'S'}</span>}
          </div>
        ))}
        {loading && (
          <div className="rishi-message rishi-message--rishi">
            <span className="rishi-avatar animate-pulse">🕉</span>
            <div className="rishi-bubble rishi-loading">
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form className="rishi-input-area" onSubmit={handleAsk}>
        <input 
          type="text" 
          className="rishi-input" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about Dharma, a character's Yuga, or how two deities are linked..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary rishi-submit-btn" disabled={loading || !query.trim()}>
          Seek Truth
        </button>
      </form>
    </div>
  );
}

export default AskRishiPage;
