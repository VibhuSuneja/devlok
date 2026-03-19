import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import posthog from 'posthog-js';

const phKey = import.meta.env.VITE_POSTHOG_KEY;
if (phKey && phKey !== 'phc_your_key_here') {
  posthog.init(phKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'always', 
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
