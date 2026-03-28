// client/src/pages/GurkulPage.jsx
// FULL FILE — replaces existing client/src/pages/GurkulPage.jsx
// Changes:
//  - When waitlist milestone (20) is reached, shows Razorpay checkout instead of waitlist form
//  - Razorpay script loaded dynamically (no npm package needed)
//  - Payment flow: create-order → Razorpay modal → verify-payment → success
//  - Already-purchased users see their access confirmed

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';

// ── Ember particle system ─────────────────────────────────────────────────────
function EmberCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    class Ember {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -(Math.random() * 1.2 + 0.4);
        this.alpha = Math.random() * 0.6 + 0.2;
        this.size = Math.random() * 2.5 + 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.004 + 0.002;
        const t = Math.random();
        this.color = t < 0.4 ? 'rgba(212,100,20,' : t < 0.75 ? 'rgba(212,151,58,' : 'rgba(240,200,120,';
      }
      update() { this.x += this.vx + Math.sin(this.life * 8) * 0.15; this.y += this.vy; this.life -= this.decay; if (this.life <= 0) this.reset(); }
      draw() { ctx.save(); ctx.globalAlpha = this.life * this.alpha; ctx.fillStyle = `${this.color}${this.life * this.alpha})`; ctx.shadowBlur = 6; ctx.shadowColor = `${this.color}0.8)`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    }
    const embers = Array.from({ length: 55 }, () => { const e = new Ember(); e.y = Math.random() * canvas.height; e.life = Math.random(); return e; });
    const draw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); embers.forEach(e => { e.update(); e.draw(); }); animId = requestAnimationFrame(draw); };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.65 }} />;
}

// ── Curriculum weeks ──────────────────────────────────────────────────────────
const WEEKS = [
  { num: 'I',   title: 'Cosmic Time',       sanskrit: 'काल',    color: '#d4973a', subtitle: 'The Architecture of Eternity',          topics: ['The four Yugas — what they actually are and why they cycle', 'The Manvantara system: 14 cosmic eras within one day of Brahma', 'Why Indian cosmology solved the "fine-tuned universe" problem 3,500 years ago', 'The Nasadiya Sukta — the Rig Veda\'s creation hymn that ends in a question', 'Pralaya and rebirth: the physics of cosmic dissolution'], accent: 'rgba(212,151,58,0.12)' },
  { num: 'II',  title: 'Dharma Paradoxes',  sanskrit: 'धर्म',   color: '#5c8ac4', subtitle: 'When the Right Answer is Wrong',          topics: ['Why Bhishma fought for the wrong side and was right to do so', 'Karna\'s loyalty vs. the five unsuspecting brothers he protected', 'The dice game: Draupadi\'s unanswered question that broke the Kuru court', 'Krishna\'s rule-breaking: understanding when dharma supersedes convention', 'Ekalavya\'s thumb — institutional power masquerading as tradition'], accent: 'rgba(92,138,196,0.12)' },
  { num: 'III', title: 'Epic Women',         sanskrit: 'शक्ति',  color: '#c45c8a', subtitle: 'The Intelligence the Epics Actually Preserve', topics: ['Draupadi\'s legal argument — the question that made kings fall silent', 'Gandhari\'s blindfold as tapas: how restraint became a weapon', 'Kunti\'s secret and the cost of reputation over truth', 'Savitri\'s negotiation with Yama — dharma as intellectual combat', 'Sita\'s agni-pariksha: what the trial of fire actually means'], accent: 'rgba(196,92,138,0.12)' },
  { num: 'IV',  title: 'Vedanta',            sanskrit: 'वेदान्त', color: '#5cb88a', subtitle: 'The Map That Ends the Search',              topics: ['Tat tvam asi — the three mahavakyas unpacked without mystification', 'Maya: not "the world is fake" but "you\'re misreading what it is"', 'Advaita vs. Dvaita: why Shankara and Ramanuja are both right', 'The Mandukya Upanishad: liberation in twelve verses', 'Vedanta vs. Stoicism — where the paths converge and where they split'], accent: 'rgba(92,184,138,0.12)' },
];

const TESTIMONIALS = [
  { quote: "I found Stoicism before I found Vedanta. This is the bridge I needed.", who: "Software engineer, Bangalore" },
  { quote: "The concept on Draupadi's question made me understand the Mahabharata for the first time.", who: "Graduate student, Delhi" },
  { quote: "I grew up in a Hindu household and still learned things here I'd never encountered.", who: "Product designer, Mumbai" },
];

// ── Load Razorpay script dynamically ─────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Payment CTA block ─────────────────────────────────────────────────────────
function PaymentBlock({ user, onSuccess }) {
  const [payState, setPayState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // If already purchased
  if (user?.gurukul) {
    return (
      <div className="gurukul-payment-block gurukul-payment-block--owned">
        <div className="gurukul-payment-success-icon">🕉</div>
        <h3 className="gurukul-payment-success-title">You have Gurukul access.</h3>
        <p className="gurukul-payment-success-body">
          Welcome, founding member. Your cohort content is ready.
        </p>
        <div className="gurukul-payment-week-links">
          {[1, 2, 3, 4].map(n => (
            <Link key={n} to={`/gurukul/week/${n}`} className="gurukul-week-link">
              Week {n} →
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (!user) {
      window.location.href = '/signup?redirect=/gurukul';
      return;
    }

    setPayState('loading');
    setErrorMsg('');

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay. Check your connection.');

      // 2. Create order server-side
      const { data } = await axios.post('/gurukul/create-order');
      const { orderId, amount, currency, keyId, userName, userEmail } = data;

      // 3. Open Razorpay checkout modal
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         keyId,
          amount,
          currency,
          name:        'Devlok',
          description: 'Gurukul — 4-Week Cohort Access',
          order_id:    orderId,
          prefill: {
            name:  userName,
            email: userEmail,
          },
          theme: { color: '#d4973a' },
          modal: {
            ondismiss: () => reject(new Error('dismissed')),
          },
          handler: async (response) => {
            try {
              // 4. Verify payment server-side
              const verifyRes = await axios.post('/gurukul/verify-payment', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              resolve(verifyRes.data.user);
            } catch (err) {
              reject(err);
            }
          },
        });
        rzp.open();
      }).then((updatedUser) => {
        setPayState('success');
        onSuccess(updatedUser);
      });

    } catch (err) {
      if (err.message === 'dismissed') {
        setPayState('idle');
      } else {
        setPayState('error');
        setErrorMsg(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      }
    }
  };

  return (
    <div className="gurukul-payment-block">
      <div className="gurukul-payment-price-row">
        <span className="gurukul-payment-price">₹999</span>
        <span className="gurukul-payment-price-meta">· one-time · lifetime access</span>
      </div>

      <ul className="gurukul-payment-includes">
        <li>✦ 20 long-form essays across 4 weeks</li>
        <li>✦ Weekly live sessions with recordings</li>
        <li>✦ Source packet — every claim traced to scripture</li>
        <li>✦ Founding member status + private cohort community</li>
        <li>✦ +500 Shraddha · Mahapandit rank unlock</li>
      </ul>

      {payState === 'error' && (
        <div className="gurukul-payment-error">{errorMsg}</div>
      )}

      <button
        className="gurukul-pay-btn"
        onClick={handlePay}
        disabled={payState === 'loading'}
      >
        {payState === 'loading' ? (
          <span className="gurukul-pay-btn-loading">
            <span className="gurukul-pay-spinner" />
            Opening checkout…
          </span>
        ) : !user ? (
          'Sign in to Enrol →'
        ) : (
          'Enrol Now — ₹999 →'
        )}
      </button>

      {!user && (
        <p className="gurukul-payment-signin-hint">
          <Link to="/signup?redirect=/gurukul">Create a free account</Link> first, then pay.
        </p>
      )}

      <p className="gurukul-payment-guarantee">
        Secure payment via Razorpay · No subscription · No recurring charges
      </p>
    </div>
  );
}

// ── Waitlist block (shown when milestone not yet reached) ─────────────────────
function WaitlistBlock({ user, waitlistCount, onJoined }) {
  const [email, setEmail]   = useState(user?.email || '');
  const [name, setName]     = useState(user?.name  || '');
  const [status, setStatus] = useState('idle');
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.name)  setName(user.name);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post('/gurukul/waitlist', {
        email: email.trim(), name: name.trim(),
        source: 'gurukul_page', userId: user?._id || null,
      });
      setPosition(res.data.position);
      setStatus('success');
      onJoined();
    } catch (err) {
      setStatus(err.response?.status === 409 ? 'duplicate' : 'error');
    }
  };

  const spotsLeft = waitlistCount ? Math.max(0, 20 - waitlistCount.progress) : null;
  const progress  = waitlistCount ? Math.round((waitlistCount.progress / 20) * 100) : 0;

  if (status === 'success') {
    return (
      <div className="gurukul-success-card">
        <div className="gurukul-success-glyph">🕉</div>
        <h3 className="gurukul-success-title">You're on the list.</h3>
        <p className="gurukul-success-body">
          You're seeker #{position}. We'll email <strong>{email}</strong> when the cohort opens.
        </p>
        <p className="gurukul-success-sub">
          {position >= 20 ? "We've reached 20 — cohort opening soon." : `${20 - position} more seekers needed.`}
        </p>
        <Link to="/" className="gurukul-success-link">← Return to the Graph</Link>
      </div>
    );
  }

  return (
    <div className="gurukul-form-right">
      {waitlistCount && (
        <div className="gurukul-progress-wrap" style={{ marginBottom: '1.5rem' }}>
          <div className="gurukul-progress-label">
            <span>{waitlistCount.progress} of 20 seekers enrolled</span>
            <span>{spotsLeft} seats remaining</span>
          </div>
          <div className="gurukul-progress-track">
            <div className="gurukul-progress-fill" style={{ width: `${progress}%` }} />
            {progress > 0 && progress < 100 && (
              <span className="gurukul-progress-flame" style={{ left: `calc(${progress}% - 8px)` }}>🔥</span>
            )}
          </div>
        </div>
      )}
      <form className="gurukul-form" onSubmit={handleSubmit}>
        <div className="gurukul-form-field">
          <label className="gurukul-field-label" htmlFor="gurukul-name">Your Name (optional)</label>
          <input id="gurukul-name" className="gurukul-field-input" type="text" placeholder="What shall we call you?" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="gurukul-form-field">
          <label className="gurukul-field-label" htmlFor="gurukul-email">Email Address *</label>
          <input id="gurukul-email" className="gurukul-field-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        {status === 'duplicate' && <div className="gurukul-form-msg gurukul-form-msg--info">✦ Already on the waitlist. We'll see you in cohort.</div>}
        {status === 'error'     && <div className="gurukul-form-msg gurukul-form-msg--error">Something went wrong. Please try again.</div>}
        <button type="submit" className="gurukul-submit-btn" disabled={status === 'loading'}>
          {status === 'loading' ? <span className="gurukul-btn-loading">Joining…</span> : <>Join the Waitlist <span className="gurukul-btn-arrow">→</span></>}
        </button>
        <p className="gurukul-form-disclaimer">Free to join. One email when the cohort opens. That's it.</p>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GurkulPage() {
  const { user, updateUser }  = useContext(AuthContext);
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [activeWeek, setActiveWeek]       = useState(0);
  const formRef = useRef(null);

  const milestoneReached = waitlistCount && waitlistCount.progress >= 20;

  useEffect(() => {
    axios.get('/gurukul/waitlist/count')
      .then(res => setWaitlistCount(res.data))
      .catch(() => {});
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const handleWaitlistJoined = useCallback(() => {
    setWaitlistCount(prev => prev
      ? { ...prev, progress: Math.min(prev.progress + 1, 20), count: prev.count + 1 }
      : prev
    );
  }, []);

  const handlePaymentSuccess = useCallback((updatedUser) => {
    updateUser(updatedUser);
    scrollToForm();
  }, [updateUser]);

  const progress = waitlistCount ? Math.round((waitlistCount.progress / 20) * 100) : 0;

  return (
    <div className="gurukul-page">
      <EmberCanvas />

      {/* Nav */}
      <nav className="gurukul-nav">
        <Link to="/" className="gurukul-nav-back">← Devlok</Link>
        <span className="gurukul-nav-label">Gurukul · First Cohort</span>
        {user ? <Link to="/profile" className="gurukul-nav-action">My Profile</Link>
               : <Link to="/signup" className="gurukul-nav-action">Join Free</Link>}
      </nav>

      {/* Hero */}
      <section className="gurukul-hero">
        <div className="gurukul-hero-eyebrow">
          <span className="gurukul-fire-glyph">🔥</span>
          <span>4-Week Intensive · First Cohort · ₹999</span>
          <span className="gurukul-fire-glyph">🔥</span>
        </div>
        <h1 className="gurukul-hero-title">
          <span className="gurukul-title-line-1">The</span>
          <span className="gurukul-title-line-2">Gurukul</span>
        </h1>
        <p className="gurukul-hero-sanskrit">गुरुकुल</p>
        <p className="gurukul-hero-tagline">
          A four-week deep dive into the knowledge system your school never taught you.
          Not beliefs. Not rituals. The actual philosophy, logic, and literature —
          read closely, argued honestly, made modern.
        </p>
        <div className="gurukul-hero-cta-group">
          <button className="gurukul-cta-primary" onClick={scrollToForm}>
            {milestoneReached ? 'Enrol Now — ₹999' : 'Join the Waitlist — Free'}
          </button>
          <span className="gurukul-cta-sub">
            {milestoneReached
              ? 'Cohort is open · Secure lifetime access today'
              : 'Cohort opens when 20 seekers join · ₹999 when live'}
          </span>
        </div>

        {/* Progress bar — only show when waitlist phase */}
        {!milestoneReached && waitlistCount !== null && (
          <div className="gurukul-progress-wrap">
            <div className="gurukul-progress-label">
              <span>{waitlistCount.progress} of 20 seekers enrolled</span>
              <span>{20 - waitlistCount.progress} seats remaining</span>
            </div>
            <div className="gurukul-progress-track">
              <div className="gurukul-progress-fill" style={{ width: `${progress}%` }} />
              {progress > 0 && progress < 100 && (
                <span className="gurukul-progress-flame" style={{ left: `calc(${progress}% - 8px)` }}>🔥</span>
              )}
            </div>
          </div>
        )}

        {/* Milestone badge */}
        {milestoneReached && (
          <div className="gurukul-milestone-badge">
            ✦ Waitlist complete — cohort is now open for enrolment
          </div>
        )}
      </section>

      {/* Manifesto */}
      <section className="gurukul-manifesto">
        <div className="gurukul-manifesto-inner">
          <p className="gurukul-manifesto-drop">Y<span>ou were told it was mythology.</span></p>
          <p className="gurukul-manifesto-body">The Mahabharata is the longest poem ever written and it contains more philosophy per page than most Western canons combined. The Upanishads solved questions about consciousness that neuroscience is still circling. The Nasadiya Sukta asked "did creation have a beginning?" and answered with a question — 3,500 years ago.</p>
          <p className="gurukul-manifesto-body">None of this was taught in school. Most of it isn't available in any form that doesn't require either blind devotion or a Sanskrit PhD.</p>
          <p className="gurukul-manifesto-body gurukul-manifesto-pivot">The Gurukul is the bridge.</p>
          <p className="gurukul-manifesto-body">Four weeks. Four themes. Weekly essays, close readings, and a community of people who take the texts seriously without requiring you to believe anything.</p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="gurukul-curriculum">
        <div className="gurukul-section-header">
          <h2 className="gurukul-section-title">The Four Weeks</h2>
          <p className="gurukul-section-sub">Each week is a complete unit of study — essay, close reading, and live discussion.</p>
        </div>
        <div className="gurukul-weeks-nav">
          {WEEKS.map((w, i) => (
            <button key={i} className={`gurukul-week-tab ${activeWeek === i ? 'active' : ''}`} style={{ '--week-color': w.color }} onClick={() => setActiveWeek(i)}>
              <span className="gurukul-week-tab-num">Week {w.num}</span>
              <span className="gurukul-week-tab-title">{w.title}</span>
            </button>
          ))}
        </div>
        <div className="gurukul-week-panel" style={{ '--week-accent': WEEKS[activeWeek].accent, '--week-color': WEEKS[activeWeek].color }}>
          <div className="gurukul-week-panel-header">
            <div>
              <p className="gurukul-week-num">Week {WEEKS[activeWeek].num}</p>
              <h3 className="gurukul-week-title" style={{ color: WEEKS[activeWeek].color }}>{WEEKS[activeWeek].title}</h3>
              <p className="gurukul-week-sanskrit">{WEEKS[activeWeek].sanskrit}</p>
              <p className="gurukul-week-subtitle">{WEEKS[activeWeek].subtitle}</p>
            </div>
          </div>
          <ul className="gurukul-week-topics">
            {WEEKS[activeWeek].topics.map((topic, i) => (
              <li key={i} className="gurukul-week-topic">
                <span className="gurukul-topic-bullet" style={{ color: WEEKS[activeWeek].color }}>✦</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
          <div className="gurukul-week-footer">
            <span className="gurukul-week-tag">5 deep essays</span>
            <span className="gurukul-week-tag">Live discussion</span>
            <span className="gurukul-week-tag">Community Q&A</span>
          </div>
        </div>
      </section>

      {/* Offering */}
      <section className="gurukul-offering">
        <div className="gurukul-section-header"><h2 className="gurukul-section-title">What You Receive</h2></div>
        <div className="gurukul-offering-grid">
          {[
            { icon: '📜', title: '20 Long Essays', desc: 'Five per week, written to the Devlok standard — honest, close-read, no mythology-washing.' },
            { icon: '🎙', title: 'Weekly Live Session', desc: 'One hour each week. Ask anything. Push back. That\'s the point.' },
            { icon: '📚', title: 'Source Packet', desc: 'Every claim traced to a named text. The Upanishads, Puranas, and Mahabharata passages you should actually read.' },
            { icon: '✦', title: 'Lifetime Access', desc: 'All essays, recordings, and source packets — yours permanently. Study at your pace.' },
            { icon: '🕉', title: '500 Shraddha', desc: 'Completion bonus on your Devlok profile. Unlock the Mahapandit rank.' },
            { icon: '🔓', title: 'Cohort Community', desc: 'Private space for the inaugural batch only. The people who arrived first.' },
          ].map((item, i) => (
            <div key={i} className="gurukul-offering-card">
              <span className="gurukul-offering-icon">{item.icon}</span>
              <h3 className="gurukul-offering-title">{item.title}</h3>
              <p className="gurukul-offering-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="gurukul-testimonials">
        <div className="gurukul-section-header">
          <h2 className="gurukul-section-title">From Devlok Readers</h2>
          <p className="gurukul-section-sub">These are the people the Gurukul is for.</p>
        </div>
        <div className="gurukul-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={i} className="gurukul-testimonial">
              <p className="gurukul-testimonial-quote">"{t.quote}"</p>
              <footer className="gurukul-testimonial-who">— {t.who}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── The Form / Payment section ── */}
      <section className="gurukul-form-section" ref={formRef}>
        <div className="gurukul-form-inner">
          <div className="gurukul-form-left">
            <h2 className="gurukul-form-title">
              {milestoneReached ? 'Enrol in the Gurukul' : 'Secure Your Seat'}
            </h2>
            <p className="gurukul-form-subtitle">
              {milestoneReached
                ? 'The waitlist is full. The cohort is open. Pay once, access everything forever.'
                : 'The first cohort opens when 20 people join the waitlist. Waitlist is free.'}
            </p>
            {!milestoneReached && (
              <>
                <div className="gurukul-form-price-block">
                  <span className="gurukul-price">₹999</span>
                  <span className="gurukul-price-period">· one-time · lifetime access</span>
                </div>
                <ul className="gurukul-form-promises">
                  <li>✦ No spam. One email when the cohort opens.</li>
                  <li>✦ No obligation. Join the waitlist, decide later.</li>
                  <li>✦ First batch gets founding member status.</li>
                </ul>
              </>
            )}
          </div>

          {/* Right side: waitlist OR payment depending on milestone */}
          {milestoneReached
            ? <PaymentBlock user={user} onSuccess={handlePaymentSuccess} />
            : <WaitlistBlock user={user} waitlistCount={waitlistCount} onJoined={handleWaitlistJoined} />
          }
        </div>
      </section>

      {/* FAQ */}
      <section className="gurukul-faq">
        <div className="gurukul-section-header"><h2 className="gurukul-section-title">Questions</h2></div>
        <div className="gurukul-faq-grid">
          {[
            { q: 'Do I need any background in Hinduism or Sanskrit?', a: 'None. If you know who Krishna is, you have enough context.' },
            { q: 'Is this a religious program?', a: 'No. It assumes nothing about your beliefs. The texts are treated as philosophy and literature, not as revelation.' },
            { q: 'What\'s the time commitment per week?', a: 'Five essays (30 minutes each) plus a one-hour live session. About 3–4 hours per week.' },
            { q: 'Why ₹999 and not free?', a: 'The concept essays on Devlok are and will remain free. The Gurukul is a structured cohort. Skin in the game changes how you learn.' },
            { q: 'What payment methods are accepted?', a: 'All major credit/debit cards, UPI, net banking, and wallets via Razorpay. Your payment is encrypted and secure.' },
          ].map((item, i) => (
            <details key={i} className="gurukul-faq-item">
              <summary className="gurukul-faq-q"><span>{item.q}</span><span className="gurukul-faq-arrow">+</span></summary>
              <p className="gurukul-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="gurukul-final-cta">
        <div className="gurukul-final-inner">
          <p className="gurukul-final-om">ॐ</p>
          <h2 className="gurukul-final-title">The data outlasts the code.</h2>
          <p className="gurukul-final-sub">The knowledge outlasts everything. It's been waiting 5,000 years. It can wait a few more days for you to join.</p>
          <button className="gurukul-cta-primary" onClick={scrollToForm}>
            {milestoneReached ? 'Enrol Now — ₹999' : 'Join the Waitlist'}
          </button>
        </div>
      </section>

      <footer className="gurukul-footer">
        <p>Built by Vibhu · <Link to="/" className="gurukul-footer-link">Devlok</Link> · Data: CC BY 4.0</p>
      </footer>
    </div>
  );
}
