import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import SiteFooter from '../components/SiteFooter.jsx';

function AskRishiPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'rishi',
      text: 'I am the Rishi of Devlok. Ask through the graph and I will answer from the beings, concepts, and texts recorded here.',
      relatedNodes: [],
      relatedLinks: [],
      coverage: 'graph-grounded',
    },
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
    setConversation((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post('/rishi/ask', { question: userText });
      setConversation((prev) => [
        ...prev,
        {
          role: 'rishi',
          text: response.data.answer,
          relatedNodes: response.data.relatedNodes || [],
          relatedLinks: response.data.relatedLinks || [],
          coverage: response.data.coverage || 'limited',
        },
      ]);
    } catch (err) {
      console.error(err);
      setConversation((prev) => [
        ...prev,
        {
          role: 'rishi',
          text: 'The ether is clouded. I cannot access the Devlok archives right now.',
          relatedNodes: [],
          relatedLinks: [],
          coverage: 'limited',
        },
      ]);
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
          <div className="rishi-orb" />
          <h2>ASK THE RISHI</h2>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      <div className="rishi-chat-container">
        {conversation.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`rishi-message rishi-message--${msg.role}`}>
            {msg.role === 'rishi' && <span className="rishi-avatar">🕉</span>}
            <div className="rishi-bubble">
              {msg.text.split('\n').map((line, lineIndex) => (
                <p key={`${idx}-${lineIndex}`}>{line}</p>
              ))}

              {msg.role === 'rishi' && (
                <>
                  <div className={`rishi-coverage rishi-coverage--${msg.coverage}`}>
                    {msg.coverage === 'graph-grounded' ? 'Grounded in current graph records' : 'Derived from limited graph context'}
                  </div>

                  {!!msg.relatedNodes?.length && (
                    <div className="rishi-related">
                      <div className="rishi-related-label">Related nodes</div>
                      <div className="rishi-related-chips">
                        {msg.relatedNodes.map((node) => (
                          <Link key={node.id} to={`/?focus=${node.id}`} className="rishi-related-chip">
                            {node.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!msg.relatedLinks?.length && (
                    <div className="rishi-links">
                      <div className="rishi-related-label">Graph ties</div>
                      {msg.relatedLinks.slice(0, 4).map((link, linkIndex) => (
                        <div key={`${link.source}-${link.target}-${linkIndex}`} className="rishi-link-row">
                          {link.source} · {link.label} · {link.target}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {msg.role === 'user' && (
              <span className="rishi-avatar" style={{ background: '#333' }}>
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </span>
            )}
          </div>
        ))}

        {loading && (
          <div className="rishi-message rishi-message--rishi">
            <span className="rishi-avatar animate-pulse">🕉</span>
            <div className="rishi-bubble rishi-loading">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
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
          placeholder="Ask how Krishna relates to Vedanta, why Karna tests dharma, or which texts teach moksha..."
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary rishi-submit-btn" disabled={loading || !query.trim()}>
          Seek Truth
        </button>
      </form>

      <SiteFooter />
    </div>
  );
}

export default AskRishiPage;
