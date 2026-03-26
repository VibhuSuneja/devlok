// client/src/pages/GurkulPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
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
        // Color: ember orange → gold → white-gold
        const t = Math.random();
        if (t < 0.4) this.color = `rgba(212,100,20,`;
        else if (t < 0.75) this.color = `rgba(212,151,58,`;
        else this.color = `rgba(240,200,120,`;
      }
      update() {
        this.x += this.vx + Math.sin(this.life * 8) * 0.15;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.life <= 0) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.life * this.alpha;
        ctx.fillStyle = `${this.color}${this.life * this.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `${this.color}0.8)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const embers = Array.from({ length: 55 }, () => {
      const e = new Ember();
      e.y = Math.random() * canvas.height; // start spread out
      e.life = Math.random();
      return e;
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      embers.forEach(e => { e.update(); e.draw(); });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.65,
      }}
    />
  );
}

// ── Curriculum scroll weeks ───────────────────────────────────────────────────
const WEEKS = [
  {
    num: 'I',
    title: 'Cosmic Time',
    sanskrit: 'काल',
    subtitle: 'The Architecture of Eternity',
    color: '#d4973a',
    topics: [
      'The four Yugas — what they actually are and why they cycle',
      'The Manvantara system: 14 cosmic eras within one day of Brahma',
      'Why Indian cosmology solved the "fine-tuned universe" problem 3,500 years ago',
      'The Nasadiya Sukta — the Rig Veda\'s creation hymn that ends in a question',
      'Pralaya and rebirth: the physics of cosmic dissolution',
    ],
    accent: 'rgba(212,151,58,0.12)',
  },
  {
    num: 'II',
    title: 'Dharma Paradoxes',
    sanskrit: 'धर्म',
    subtitle: 'When the Right Answer is Wrong',
    color: '#5c8ac4',
    topics: [
      'Why Bhishma fought for the wrong side and was right to do so',
      'Karna\'s loyalty vs. the five unsuspecting brothers he protected',
      'The dice game: Draupadi\'s unanswered question that broke the Kuru court',
      'Krishna\'s rule-breaking: understanding when dharma supersedes convention',
      'Ekalavya\'s thumb — institutional power masquerading as tradition',
    ],
    accent: 'rgba(92,138,196,0.12)',
  },
  {
    num: 'III',
    title: 'Epic Women',
    sanskrit: 'शक्ति',
    subtitle: 'The Intelligence the Epics Actually Preserve',
    color: '#c45c8a',
    topics: [
      'Draupadi\'s legal argument — the question that made kings fall silent',
      'Gandhari\'s blindfold as tapas: how restraint became a weapon',
      'Kunti\'s secret and the cost of reputation over truth',
      'Savitri\'s negotiation with Yama — dharma as intellectual combat',
      'Sita\'s agni-pariksha: what the trial of fire actually means',
    ],
    accent: 'rgba(196,92,138,0.12)',
  },
  {
    num: 'IV',
    title: 'Vedanta',
    sanskrit: 'वेदान्त',
    subtitle: 'The Map That Ends the Search',
    color: '#5cb88a',
    topics: [
      'Tat tvam asi — the three mahavakyas unpacked without mystification',
      'Maya: not "the world is fake" but "you\'re misreading what it is"',
      'Advaita vs. Dvaita: why Shankara and Ramanuja are both right',
      'The Mandukya Upanishad: liberation in twelve verses',
      'Vedanta vs. Stoicism — where the paths converge and where they split',
    ],
    accent: 'rgba(92,184,138,0.12)',
  },
];

// ── Social proof testimonials ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I found Stoicism before I found Vedanta. This is the bridge I needed.",
    who: "Software engineer, Bangalore",
  },
  {
    quote: "The concept on Draupadi's question made me understand the Mahabharata for the first time.",
    who: "Graduate student, Delhi",
  },
  {
    quote: "I grew up in a Hindu household and still learned things here I'd never encountered.",
    who: "Product designer, Mumbai",
  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GurkulPage() {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | duplicate | error
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [position, setPosition] = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const formRef = useRef(null);

  // Pre-fill email if logged in
  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.name) setName(user.name);
  }, [user]);

  // Fetch current waitlist count
  useEffect(() => {
    axios.get('/gurukul/waitlist/count')
      .then(res => setWaitlistCount(res.data))
      .catch(() => {}); // silent fail — count is cosmetic
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await axios.post('/gurukul/waitlist', {
        email: email.trim(),
        name: name.trim(),
        source: 'gurukul_page',
        userId: user?._id || null,
      });
      setPosition(res.data.position);
      setStatus('success');
      // Bump local count
      if (waitlistCount) {
        setWaitlistCount(prev => ({ ...prev, count: prev.count + 1, progress: Math.min(prev.progress + 1, 20) }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus('duplicate');
      } else {
        setStatus('error');
      }
    }
  };

  const progress = waitlistCount ? Math.round((waitlistCount.progress / 20) * 100) : 0;

  return (
    <div className="gurukul-page">
      <EmberCanvas />

      {/* ── Nav ── */}
      <nav className="gurukul-nav">
        <Link to="/" className="gurukul-nav-back">← Devlok</Link>
        <span className="gurukul-nav-label">Gurukul · First Cohort</span>
        {user ? (
          <Link to="/profile" className="gurukul-nav-action">My Profile</Link>
        ) : (
          <Link to="/signup" className="gurukul-nav-action">Join Free</Link>
        )}
      </nav>

      {/* ── Hero ── */}
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
            Join the Waitlist — It's Free
          </button>
          <span className="gurukul-cta-sub">Cohort opens when 20 seekers join · ₹999 when live</span>
        </div>

        {/* Progress bar */}
        {waitlistCount !== null && (
          <div className="gurukul-progress-wrap">
            <div className="gurukul-progress-label">
              <span>{waitlistCount.progress} of 20 seekers enrolled</span>
              <span>{20 - waitlistCount.progress} seats remaining</span>
            </div>
            <div className="gurukul-progress-track">
              <div
                className="gurukul-progress-fill"
                style={{ width: `${progress}%` }}
              />
              {/* Flame at tip */}
              {progress > 0 && progress < 100 && (
                <span
                  className="gurukul-progress-flame"
                  style={{ left: `calc(${progress}% - 8px)` }}
                >🔥</span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Manifesto ── */}
      <section className="gurukul-manifesto">
        <div className="gurukul-manifesto-inner">
          <p className="gurukul-manifesto-drop">
            Y<span>ou were told it was mythology.</span>
          </p>
          <p className="gurukul-manifesto-body">
            The Mahabharata is the longest poem ever written and it contains more
            philosophy per page than most Western canons combined. The Upanishads
            solved questions about consciousness that neuroscience is still circling.
            The Nasadiya Sukta asked "did creation have a beginning?" and answered
            with a question — 3,500 years ago.
          </p>
          <p className="gurukul-manifesto-body">
            None of this was taught in school. Most of it isn't available in any
            form that doesn't require either blind devotion or a Sanskrit PhD.
          </p>
          <p className="gurukul-manifesto-body gurukul-manifesto-pivot">
            The Gurukul is the bridge.
          </p>
          <p className="gurukul-manifesto-body">
            Four weeks. Four themes. Weekly essays, close readings, and a community
            of people who take the texts seriously without requiring you to believe anything.
          </p>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section className="gurukul-curriculum">
        <div className="gurukul-section-header">
          <h2 className="gurukul-section-title">The Four Weeks</h2>
          <p className="gurukul-section-sub">Each week is a complete unit of study — essay, close reading, and live discussion.</p>
        </div>

        <div className="gurukul-weeks-nav">
          {WEEKS.map((w, i) => (
            <button
              key={i}
              className={`gurukul-week-tab ${activeWeek === i ? 'active' : ''}`}
              style={{ '--week-color': w.color }}
              onClick={() => setActiveWeek(i)}
            >
              <span className="gurukul-week-tab-num">Week {w.num}</span>
              <span className="gurukul-week-tab-title">{w.title}</span>
            </button>
          ))}
        </div>

        <div className="gurukul-week-panel" style={{ '--week-accent': WEEKS[activeWeek].accent, '--week-color': WEEKS[activeWeek].color }}>
          <div className="gurukul-week-panel-header">
            <div>
              <p className="gurukul-week-num">Week {WEEKS[activeWeek].num}</p>
              <h3 className="gurukul-week-title" style={{ color: WEEKS[activeWeek].color }}>
                {WEEKS[activeWeek].title}
              </h3>
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

      {/* ── What you get ── */}
      <section className="gurukul-offering">
        <div className="gurukul-section-header">
          <h2 className="gurukul-section-title">What You Receive</h2>
        </div>
        <div className="gurukul-offering-grid">
          {[
            { icon: '📜', title: '20 Long Essays', desc: 'Five per week, written to the Devlok standard — honest, close-read, no mythology-washing.' },
            { icon: '🎙', title: 'Weekly Live Session', desc: 'One hour with Vibhu each week. Ask anything. Push back. That\'s the point.' },
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

      {/* ── Testimonials ── */}
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

      {/* ── The Waitlist Form ── */}
      <section className="gurukul-form-section" ref={formRef}>
        <div className="gurukul-form-inner">
          <div className="gurukul-form-left">
            <h2 className="gurukul-form-title">
              Secure Your Seat
            </h2>
            <p className="gurukul-form-subtitle">
              The first cohort opens when 20 people join the waitlist.
              Waitlist is free. You'll be notified when Razorpay checkout goes live.
            </p>
            <div className="gurukul-form-price-block">
              <span className="gurukul-price">₹999</span>
              <span className="gurukul-price-period">· one-time · lifetime access</span>
            </div>
            <ul className="gurukul-form-promises">
              <li>✦ No spam. One email when the cohort opens.</li>
              <li>✦ No obligation. Join the waitlist, decide later.</li>
              <li>✦ First batch gets founding member status.</li>
            </ul>
          </div>

          <div className="gurukul-form-right">
            {status === 'success' ? (
              <div className="gurukul-success-card">
                <div className="gurukul-success-glyph">🕉</div>
                <h3 className="gurukul-success-title">You're on the list.</h3>
                <p className="gurukul-success-body">
                  You're seeker #{position} in the first Gurukul cohort.
                  We'll notify you at <strong>{email}</strong> when the cohort opens.
                </p>
                <p className="gurukul-success-sub">
                  {position >= 20
                    ? "We've reached 20 — the cohort opens soon."
                    : `${20 - (position)} more seekers needed to open the cohort.`}
                </p>
                <Link to="/" className="gurukul-success-link">← Return to the Graph</Link>
              </div>
            ) : (
              <form className="gurukul-form" onSubmit={handleSubmit}>
                <div className="gurukul-form-field">
                  <label className="gurukul-field-label" htmlFor="gurukul-name">
                    Your Name (optional)
                  </label>
                  <input
                    id="gurukul-name"
                    className="gurukul-field-input"
                    type="text"
                    placeholder="What shall we call you?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="gurukul-form-field">
                  <label className="gurukul-field-label" htmlFor="gurukul-email">
                    Email Address *
                  </label>
                  <input
                    id="gurukul-email"
                    className="gurukul-field-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {status === 'duplicate' && (
                  <div className="gurukul-form-msg gurukul-form-msg--info">
                    ✦ This email is already on the waitlist. We'll see you in cohort.
                  </div>
                )}
                {status === 'error' && (
                  <div className="gurukul-form-msg gurukul-form-msg--error">
                    Something went wrong. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  className="gurukul-submit-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <span className="gurukul-btn-loading">Joining…</span>
                  ) : (
                    <>Join the Waitlist <span className="gurukul-btn-arrow">→</span></>
                  )}
                </button>

                <p className="gurukul-form-disclaimer">
                  Free to join. You'll receive one email when the cohort opens. That's it.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="gurukul-faq">
        <div className="gurukul-section-header">
          <h2 className="gurukul-section-title">Questions</h2>
        </div>
        <div className="gurukul-faq-grid">
          {[
            {
              q: 'Do I need any background in Hinduism or Sanskrit?',
              a: 'None. The Gurukul is written for people who are curious but not already initiated. If you know who Krishna is, you have enough context.',
            },
            {
              q: 'Is this a religious program?',
              a: 'No. It assumes nothing about your beliefs. The texts are treated as philosophy and literature, not as revelation. You can be atheist, agnostic, or deeply devout — the close reading works regardless.',
            },
            {
              q: 'What\'s the time commitment per week?',
              a: 'Five essays (roughly 30 minutes reading each) plus a one-hour live session. Call it 3–4 hours per week if you read everything. You can skip the live sessions — recordings are available.',
            },
            {
              q: 'Why ₹999 and not free?',
              a: 'The concept essays on Devlok are and will remain free. The Gurukul is a structured cohort — curated curriculum, live sessions, source packets, and founding community access. The price is intentional. Skin in the game changes how you learn.',
            },
            {
              q: 'What happens after the waitlist fills?',
              a: 'You\'ll receive an email with the Razorpay checkout link. Pay ₹999 and your access is unlocked immediately. No subscription, no upsell, no recurring charges.',
            },
          ].map((item, i) => (
            <details key={i} className="gurukul-faq-item">
              <summary className="gurukul-faq-q">
                <span>{item.q}</span>
                <span className="gurukul-faq-arrow">+</span>
              </summary>
              <p className="gurukul-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="gurukul-final-cta">
        <div className="gurukul-final-inner">
          <p className="gurukul-final-om">ॐ</p>
          <h2 className="gurukul-final-title">The data outlasts the code.</h2>
          <p className="gurukul-final-sub">
            The knowledge outlasts everything. It's been waiting 5,000 years.
            It can wait a few more days for you to join.
          </p>
          <button className="gurukul-cta-primary" onClick={scrollToForm}>
            Join the Waitlist
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="gurukul-footer">
        <p>
          Built by Vibhu · <Link to="/" className="gurukul-footer-link">Devlok</Link> · Data: CC BY 4.0
        </p>
      </footer>
    </div>
  );
}
