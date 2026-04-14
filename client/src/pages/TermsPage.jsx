import React from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter.jsx';

export default function TermsPage() {
  return (
    <div className="legal-page" id="terms-page">
      <header className="legal-header">
        <Link to="/" className="concept-back-link">← Devlok</Link>
        <h1 className="legal-title">Terms of Service</h1>
        <div style={{ width: '60px' }} />
      </header>

      <article className="legal-content">
        <p className="legal-date">Last updated: 14 April 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Devlok ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
        </section>

        <section>
          <h2>2. Use of the Platform</h2>
          <p>Devlok is an educational and wellness platform exploring Indian mythology, mindfulness, and personal development. You agree to use it lawfully and not to:</p>
          <ul>
            <li>Attempt to reverse-engineer, scrape, or access the platform in unauthorised ways</li>
            <li>Upload content that is unlawful, defamatory, or infringes third-party rights</li>
            <li>Use the platform for any commercial purpose without prior written consent</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorised use.</p>
        </section>

        <section>
          <h2>4. Journal & Encrypted Content</h2>
          <p>Your journal entries are encrypted client-side using AES-256-GCM. We cannot access, read, or recover this content. You are solely responsible for maintaining your encryption key (stored in your browser's localStorage). Clearing your browser data may result in permanent loss of journal content.</p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>All original content on Devlok — including mythology data, affirmations, UI design, and code — is the intellectual property of Devlok and its creators. Mythological texts and stories are in the public domain and are presented with original editorial interpretation.</p>
        </section>

        <section>
          <h2>6. Disclaimer</h2>
          <p>Devlok is provided "as is" without warranty of any kind. The meditation, breathwork, and affirmation features are wellness tools and are not a substitute for professional medical or psychological advice. Consult a qualified professional for health concerns.</p>
        </section>

        <section>
          <h2>7. Donations & Payments</h2>
          <p>Voluntary donations via UPI/Google Pay are non-refundable and confer no rights, services, or representations beyond our gratitude.</p>
        </section>

        <section>
          <h2>8. Modifications</h2>
          <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>For any queries regarding these terms, please reach out via our <Link to="/support">Support page</Link>.</p>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
