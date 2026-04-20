import React from 'react';
import SoulCard from '../components/soul/SoulCard.jsx';
import { ARCHETYPES } from '../constants/archetypes.js';

export default function SoulDebugGallery() {
  return (
    <div style={{ padding: '60px 20px', minHeight: '100vh', background: '#0a0a0c' }}>
      <h1 style={{ color: 'var(--amber)', textAlign: 'center', marginBottom: '40px', fontFamily: '"Cormorant Garamond", serif' }}>
        Soul Archetype Registry (Debug Gallery)
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {Object.entries(ARCHETYPES).map(([key, arch]) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: arch.color, textAlign: 'center', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.1em' }}>{key.toUpperCase()}</p>
            <div className="soul-card-container">
              <SoulCard archetype={arch} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
