import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Access the Portal</h2>
        <p className="login-sub">Sign in to Devlok</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/signup"
            appearance={{
              elements: {
                formButtonPrimary: 'btn btn-primary',
                card: 'clerk-card-custom'
              }
            }}
          />
        </div>

        <Link to="/" className="login-back" style={{ display: 'block', textAlign: 'center', marginTop: '30px' }}>← Return to the Map</Link>
      </div>
    </div>
  );
}

export default LoginPage;
