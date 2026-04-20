import React, { forwardRef } from 'react';

const SoulCard = forwardRef(({ profile, archetype, phase, userName, daysSince }, ref) => {
  return (
    <div 
      className="soul-card-visual"
      ref={ref}
      style={{
        width: '400px',
        height: '600px',
        maxWidth: '100vw',
        background: '#0a0a0a',
        position: 'relative',
        boxSizing: 'border-box',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        color: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        overflow: 'hidden',
        border: '1px solid rgba(212,151,58,0.2)',
        borderRadius: '4px'
      }}
    >
      {/* Background Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: `radial-gradient(circle at center, ${phase?.color || '#D4973A'} 0%, transparent 60%)`,
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4973A', fontWeight: 'bold' }}>
            DEVLOK
          </div>
          <div style={{ fontSize: '18px' }}>🪔</div>
        </div>
        
        {/* User Info */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {userName || 'Seeker'}
          </div>
          <div style={{ fontSize: '18px', color: '#E8D5A3', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic' }}>
            Soul Mirror — Day {daysSince}
          </div>
        </div>

        <div style={{ width: '50px', height: '1px', background: 'rgba(212,151,58,0.3)', marginBottom: '24px' }} />

        {/* Archetype */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', fontFamily: '"Cormorant Garamond", serif', color: '#ffffff', marginBottom: '8px', lineHeight: 1 }}>
            {archetype?.name || profile?.primaryArchetype?.name || 'Unknown'}
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{archetype?.tagline || profile?.primaryArchetype?.mythText}"
          </div>
        </div>
        
        <div style={{ width: '50px', height: '1px', background: 'rgba(212,151,58,0.3)', marginBottom: '24px' }} />

        {/* Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Walking through</div>
            <div style={{ fontSize: '16px', color: phase?.color || '#ffffff' }}>{phase?.label || 'The Unknown'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Carrying</div>
            <div style={{ fontSize: '14px', color: '#ffffff', lineHeight: 1.4 }}>{archetype?.coreWound || profile?.primaryArchetype?.coreWound}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Becoming</div>
            <div style={{ fontSize: '14px', color: '#ffffff', lineHeight: 1.4 }}>{archetype?.emergingStrength || profile?.primaryArchetype?.emergingStrength}</div>
          </div>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '24px 0 16px 0' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', color: '#D4973A', fontWeight: 'bold' }}>{profile?.streak?.current || 0}</span>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>Day Streak</span>
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
            devlok.in
          </div>
        </div>
      </div>
    </div>
  );
});

export default SoulCard;
