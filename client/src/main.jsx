import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import posthog from 'posthog-js';

const phKey = import.meta.env.VITE_POSTHOG_KEY;
const phHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (phKey && phKey !== 'phc_your_key_here') {
  posthog.init(phKey, {
    api_host: phHost,
    person_profiles: 'always', 
    // Capture only in production or if enabled
    loaded: (posthog) => {
      // Opt-out in localhost but keep active in Vercel link
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        posthog.opt_out_capturing();
      }
    }
  });
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
