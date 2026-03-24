import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Unauthorized');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Access the Void</h2>
        <p className="login-sub">Administrator Authentication</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn">Ignite Access</button>
        </form>
        
        <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(212,151,58,0.1)', border: '1px solid rgba(212,151,58,0.3)', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--amber-dim)' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Community Tester Account</strong>
          user@devlok.site &nbsp;|&nbsp; Password: user123
        </div>

        <Link to="/" className="login-back">← Return to the Map</Link>
      </div>
    </div>
  );
}

export default LoginPage;
