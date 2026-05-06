import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, BarChart3, Copy, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

function Success() {
  const location = useLocation();
  const confirmationCode = location.state?.confirmationCode || 'N/A';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--success)' }}
      >
        <CheckCircle size={50} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Vote Cast Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Your vote has been securely recorded. Thank you for participating in this democratic process.
        </p>

        <div style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Your Vote Receipt Code</p>
          <p style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            {confirmationCode}
          </p>
          <button
            onClick={handleCopy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: copied ? 'var(--success)' : 'var(--primary)', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
          </button>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            Save this code to verify your vote was counted. It does not reveal your choice.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-outline">
            Return Home
          </Link>
          <Link to="/results" className="btn btn-primary">
            <BarChart3 size={20} />
            View Live Results
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Success;
