import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function Landing() {
  return (
    <div className="landing-container" style={{ textAlign: 'center', maxWidth: '800px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'var(--glass-bg)', 
            padding: '1.5rem', 
            borderRadius: '50%',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
          }}>
            <ShieldCheck size={64} className="text-primary" />
          </div>
        </div>

        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
          Secure Future with <br />
          <span className="text-gradient">Biometric Voting</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Experience the next generation of democratic participation. Fast, secure, and entirely powered by cutting-edge facial recognition technology.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            <UserPlus size={20} />
            Register to Vote
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            <LogIn size={20} />
            Cast Vote
          </Link>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
      >
        {[
          { title: 'Secure', desc: 'Enterprise-grade facial recognition prevents identity fraud.' },
          { title: 'Anonymous', desc: 'Your vote is cryptographically separated from your identity.' },
          { title: 'Accessible', desc: 'Vote from anywhere using just your device camera.' }
        ].map((feature, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{feature.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default Landing;
