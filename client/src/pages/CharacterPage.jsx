import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios.js';

function CharacterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchChar = async () => {
      try {
        const res = await axios.get(`/characters/${id}`);
        setCharacter(res.data);
        document.title = `${res.data.label} — Devlok`;

        const updateMeta = (name, property, content) => {
          let tag = document.querySelector(`meta[${name ? `name="${name}"` : `property="${property}"`}]`);
          if (!tag) {
            tag = document.createElement('meta');
            if (name) tag.setAttribute('name', name);
            if (property) tag.setAttribute('property', property);
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        };

        const descSnippet = res.data.desc ? res.data.desc.substring(0, 150) : '';
        updateMeta('description', null, descSnippet);
        updateMeta(null, 'og:title', `${res.data.label} | Devlok`);
        updateMeta(null, 'og:description', descSnippet);
        updateMeta(null, 'og:url', window.location.href);

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchChar();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) return <div style={{ color: "white", padding: "2rem" }}>Loading...</div>;
  if (error || !character) return <div style={{ color: "white", padding: "2rem" }}>This being has not yet been mapped.</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--void, #08080c)',
      color: '#fff',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none', background: 'radial-gradient(circle at center, #2a2a35 0%, transparent 100%)' }}></div>
      
      <div style={{ maxWidth: '600px', width: '100%', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Cinzel Decorative", serif', color: 'var(--amber-glow, #d4973a)', fontSize: '3.5rem', margin: '2rem 0 0.5rem 0', textShadow: '0 0 15px rgba(212,151,58,0.4)' }}>
          {character.sanskrit}
        </h1>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 1.5rem 0', fontWeight: 'normal', letterSpacing: '2px', textTransform: 'uppercase', color: '#e8d5a3' }}>
          {character.label}
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="panel-yuga-badge" style={{ padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'uppercase', border: '1px solid currentColor', color: '#d4973a' }}>
            {character.yuga} yuga
          </div>
          <div className="panel-type-badge" style={{ padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'uppercase', border: '1px solid currentColor', color: '#d4973a' }}>
            {character.type}
          </div>
        </div>

        <div className="panel-epithets" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {character.epithets?.map(e => (
            <span key={e} className="epithet-tag" style={{ color: '#e8d5a3', border: '1px solid rgba(232,213,163,0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>
              {e}
            </span>
          ))}
        </div>

        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '2rem', color: '#e8d5a3' }}>
          {character.desc}
        </p>

        {character.source && (
          <div style={{ opacity: 0.6, marginBottom: '3rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Sources: {character.source}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate(`/?focus=${id}`)}
            style={{ padding: '0.8rem 1.5rem', background: 'var(--amber-glow, #d4973a)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Explore the Graph →
          </button>
          <button 
            onClick={handleShare}
            style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: 'var(--amber-glow, #d4973a)', border: '1px solid var(--amber-glow, #d4973a)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;
