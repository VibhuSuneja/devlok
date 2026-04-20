import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import API from '../api/axios';

export default function DanaPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState(1001);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const amounts = [501, 1001, 5001, 11001];

  const handleDana = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/dana/create-order', { amount, message });
      
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Devlok",
        description: "Dana - Sacred Contribution",
        image: "/logo.png",
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await API.post('/dana/verify-payment', response);
            setSuccess(true);
          } catch (err) {
            alert("Verification failed. Please contact support.");
          }
        },
        prefill: {
          name: data.userName,
          email: data.userEmail,
        },
        theme: {
          color: "#D4973A",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dana-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ color: 'var(--amber)', fontSize: '3rem', fontFamily: '"Cormorant Garamond", serif' }}>Dhanyavad</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto' }}>
          Your contribution has been received. Your Shraddha has grown, and your support helps us keep the wisdom of the ancients alive in the digital age.
        </p>
        <button onClick={() => window.location.href = '/'} className="soul-btn">Return Home</button>
      </div>
    );
  }

  return (
    <div className="dana-page" style={{ minHeight: '100vh', padding: '80px 20px', background: 'radial-gradient(circle at top, #1a1a2e 0%, #0a0a0c 100%)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        
        {/* Left: Philosophy */}
        <div className="dana-content">
          <h1 style={{ color: 'var(--amber)', fontSize: '3.5rem', fontFamily: '"Cormorant Garamond", serif', marginBottom: '20px' }}>
            The Grace of Dana
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
            In the Vedic tradition, <strong>Dana</strong> is not just charity; it is a sacred act of letting go. It is the recognition that what we have is a temporary gift from the cosmos, and by sharing it, we maintain the Rta — the cosmic order.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.6' }}>
            Your contributions fuel the Devlok engine, allowing us to build deeper AI models, map complex philosophical schools, and provide a sanctuary for seekers worldwide. Every ₹10 donated awards you 1 point of <strong>Shraddha</strong>, reflecting your commitment to the Dharma.
          </p>
          
          <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(212,151,58,0.05)', borderLeft: '3px solid var(--amber)', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ color: 'var(--amber)', margin: '0 0 10px 0' }}>Contribution Tiers</h4>
            <ul style={{ color: 'rgba(255,255,255,0.7)', listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              <li>• <strong style={{color: '#fff'}}>Anudata</strong>: ₹1,000+ (Supporter)</li>
              <li>• <strong style={{color: '#fff'}}>Bhamashah</strong>: ₹10,000+ (Patron)</li>
              <li>• <strong style={{color: '#fff'}}>Vajra</strong>: ₹50,000+ (Pillar of Devlok)</li>
            </ul>
          </div>
        </div>

        {/* Right: Payment Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>Select Offering</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            {amounts.map(a => (
              <button 
                key={a}
                onClick={() => setAmount(a)}
                style={{
                  background: amount === a ? 'rgba(212,151,58,0.2)' : 'rgba(255,255,255,0.05)',
                  border: amount === a ? '1px solid var(--amber)' : '1px solid rgba(255,255,255,0.1)',
                  color: amount === a ? 'var(--amber)' : '#fff',
                  padding: '15px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                ₹{a.toLocaleString()}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Custom Amount (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '1.1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Message of Intention</label>
            <textarea 
              placeholder="Optional message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px',
                color: '#fff',
                borderRadius: '8px',
                height: '80px',
                resize: 'none'
              }}
            />
          </div>

          <button 
            onClick={handleDana}
            disabled={loading}
            style={{
              width: '100%',
              background: 'var(--amber)',
              color: '#000',
              padding: '18px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            {loading ? 'Processing...' : 'Make Offering'}
          </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .dana-page { padding: 40px 15px; }
          .dana-page > div { grid-template-columns: 1fr !important; gap: 40px !important; }
          .dana-content h1 { font-size: 2.5rem !important; }
        }
      `}} />
    </div>
  );
}
