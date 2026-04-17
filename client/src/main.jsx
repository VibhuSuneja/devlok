import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';
import posthog from 'posthog-js';

const phKey = import.meta.env.VITE_POSTHOG_KEY;
const phHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

if (phKey && phKey !== 'phc_your_key_here') {
  posthog.init(phKey, {
    api_host: phHost,
    person_profiles: 'always', 
    loaded: (posthog) => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        posthog.opt_out_capturing();
      }
    }
  });
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

