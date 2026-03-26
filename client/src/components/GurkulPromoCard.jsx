import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function GurkulPromoCard() {
  const { user } = useContext(AuthContext);
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch live count
    axios.get('/gurukul/waitlist/count')
      .then(res => setCount(res.data.count))
      .catch(err => console.error('Count fetch error:', err));
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      email: user ? user.email : email,
      name: user ? user.name : 'Curious Scholar',
      source: 'profile_page',
      userId: user ? user._id : null
    };

    try {
      await axios.post('/gurukul/waitlist', data);
      setSuccess(true);
      // Re-fetch count
      const res = await axios.get('/gurukul/waitlist/count');
      setCount(res.data.count);
    } catch (err) {
      if (err.response?.status === 409) {
        // Already on list, so show success view
        setSuccess(true);
      } else {
        console.error('Waitlist join error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, 20 - count);
  const progress = Math.min(100, Math.round((count / 20) * 100));

  if (success) {
    return (
      <div className="gurukul-promo-card success">
        <div className="promo-success-icon">ॐ</div>
        <h3 className="promo-title">Initiation Recorded</h3>
        <p className="promo-text">You are part of the first 20 seekers. We will notify you at {user?.email || email}.</p>
      </div>
    );
  }

  return (
    <div className="gurukul-promo-card">
      <div className="promo-badge">Gurukul Cohort I</div>
      
      <div className="promo-header">
        <span className="promo-fire-icon">🔥</span>
        <div className="promo-header-text">
          <h3 className="promo-title">4-Week Immersion</h3>
          <p className="promo-sub">Master the Vedic Knowledge Graph</p>
        </div>
      </div>

      <div className="promo-curriculum">
        <div className="curriculum-item" style={{ borderLeftColor: '#d4973a' }}>
          <span className="item-sanskrit">Panchabhoota</span>
          <span className="item-eng">Nature</span>
        </div>
        <div className="curriculum-item" style={{ borderLeftColor: '#5cb88a' }}>
          <span className="item-sanskrit">Dharma</span>
          <span className="item-eng">Ethics</span>
        </div>
        <div className="curriculum-item" style={{ borderLeftColor: '#5c8ac4' }}>
          <span className="item-sanskrit">Rasa</span>
          <span className="item-eng">Aesthetics</span>
        </div>
        <div className="curriculum-item" style={{ borderLeftColor: '#c45c8a' }}>
          <span className="item-sanskrit">Tattva</span>
          <span className="item-eng">Truth</span>
        </div>
      </div>

      <div className="promo-progress-section">
        <div className="promo-progress-info">
          <span>{count} / 20 Seekers</span>
          <span>{remaining} seats left</span>
        </div>
        <div className="promo-progress-bar">
          <div className="promo-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form className="promo-form" onSubmit={handleJoin}>
        {!user && (
          <input 
            type="email" 
            placeholder="Sacred Email Address" 
            className="promo-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <button className="promo-btn" type="submit" disabled={loading}>
          {loading ? 'Initiating...' : user ? `Join as ${user.name} →` : 'Secure My Seat →'}
        </button>
      </form>

      <div className="promo-reward-hint">
        <span className="reward-star">✧</span>
        Completion earns <strong>+500 Shraddha</strong> & <strong>Mahapandit</strong> rank
      </div>
    </div>
  );
}

export default GurkulPromoCard;
