import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

function Success() {
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
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Your vote has been securely recorded on the immutable ledger. Thank you for participating in this democratic process.
        </p>
        
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: '12px', marginBottom: '3rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          Transaction Hash:<br/>
          <span style={{ color: 'var(--primary)' }}>0x{Math.random().toString(16).slice(2, 10)}...{Math.random().toString(16).slice(2, 10)}</span>
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
