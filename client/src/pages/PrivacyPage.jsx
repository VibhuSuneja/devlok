import React from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter.jsx';

export default function PrivacyPage() {
  return (
    <div className="legal-page" id="privacy-page">
      <header className="legal-header">
        <Link to="/" className="concept-back-link">← Devlok</Link>
        <h1 className="legal-title">Privacy Policy</h1>
        <div style={{ width: '60px' }} />
      </header>

      <article className="legal-content">
        <p className="legal-date">Last updated: 14 April 2025</p>

        <p className="legal-intro">
          Your privacy is not a feature to us — it is a foundation. This policy explains what data
          we collect, why, and the extraordinary steps we take to protect information you consider personal.
        </p>

        <section>
          <h2>1. What We Collect</h2>
          <h3>1a. Account Information</h3>
          <p>When you create an account, we collect your name and email address, used solely for authentication and communication relevant to your account.</p>
          <h3>1b. Usage Analytics</h3>
          <p>We use PostHog for anonymous usage analytics (page views, feature interactions). No personally identifiable information is included in these events. You can opt out by enabling "Do Not Track" in your browser.</p>
          <h3>1c. Journal Data (Encrypted)</h3>
          <p>Your journal entries and attached photos are encrypted in your browser using AES-256-GCM <em>before any data is stored</em>. The encryption key lives only in your browser's localStorage. We never receive, store, or have any access to your plaintext journal content. Even if our servers were compromised, your journal data would be cryptographically irrecoverable.</p>
          <h3>1d. Affirmation Profile</h3>
          <p>Your affirmation survey responses and category profile are stored only in your browser's localStorage. We do not collect or store this information server-side.</p>
        </section>

        <section>
          <h2>2. How We Use Your Data</h2>
          <ul>
            <li><strong>Account email:</strong> Login, password resets, critical security notices only — no marketing emails.</li>
            <li><strong>Anonymous analytics:</strong> Understanding which features are valuable so we can improve them.</li>
            <li><strong>Journal:</strong> We do not use it. We cannot read it. See section 1c.</li>
          </ul>
        </section>

        <section>
          <h2>3. Data We Do NOT Collect</h2>
          <ul>
            <li>We do not track your location</li>
            <li>We do not sell any data to third parties</li>
            <li>We do not serve targeted advertisements</li>
            <li>We do not build advertising profiles</li>
            <li>We do not read your journal</li>
          </ul>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <ul>
            <li><strong>PostHog:</strong> Anonymous product analytics. <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">PostHog Privacy Policy</a></li>
            <li><strong>Google Fonts:</strong> Fonts loaded from Google's CDN. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li><strong>Tone.js:</strong> Runs entirely in your browser; no external requests.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention & Deletion</h2>
          <p>Account data is retained until you request deletion. To delete your account and all associated server-side data, contact us via the <Link to="/support">Support page</Link>. Browser-stored data (journal, affirmation profile) can be cleared by you at any time through your browser settings.</p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>We use a single authentication token stored in localStorage (not a cookie) for session management. No tracking cookies are placed on your device. PostHog may use a first-party cookie for anonymous session continuity.</p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>Our servers use HTTPS. Passwords are hashed using bcrypt before storage. Journal data is encrypted client-side with AES-256-GCM before it reaches our infrastructure. We perform regular dependency audits.</p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to access, correct, export, or delete your personal data. Contact us and we will respond within 30 days. Indian users have rights under the Digital Personal Data Protection Act, 2023.</p>
        </section>

        <section>
          <h2>9. Children</h2>
          <p>Devlok is not directed at children under 13. We do not knowingly collect data from minors. If you believe a child has provided data, contact us for immediate removal.</p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>We will notify registered users of material changes via email. The updated date at the top of this page reflects the most recent revision.</p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>Privacy questions or data requests: visit our <Link to="/support">Support page</Link>.</p>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
