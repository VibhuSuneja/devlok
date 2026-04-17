import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-om">🕉</div>
          <h1 className="login-title">देवलोक</h1>
          <p className="login-subtitle">Join the Seekers of Dharma</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <SignUp 
            routing="path" 
            path="/signup" 
            signInUrl="/login"
            appearance={{
              elements: {
                formButtonPrimary: 'btn btn-primary',
                card: 'clerk-card-custom'
              }
            }}
          />
        </div>

        <div className="signup-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" className="login-link">Sign in</Link>
        </div>

        <div className="terms-note" style={{ marginTop: '20px' }}>
          By joining, you become part of a community dedicated to the sincere exploration of Sanatan Dharma.
        </div>
      </div>
    </div>
  );
}
