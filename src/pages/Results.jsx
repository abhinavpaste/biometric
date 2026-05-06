import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const candidates = [
  { id: 'c1', name: 'Elena Rodriguez', party: 'PARTY A', color: 'var(--primary)' },
  { id: 'c2', name: 'Marcus Chen', party: 'PARTY B', color: 'var(--secondary)' },
  { id: 'c3', name: 'Sarah Jenkins', party: 'PARTY C', color: 'var(--success)' }
];

function Results() {
  const [results, setResults] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const tally = JSON.parse(localStorage.getItem('biovote_tally') || '{}');
    setResults(tally);
    
    const total = Object.values(tally).reduce((sum, count) => sum + count, 0);
    setTotalVotes(total);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 className="text-primary" size={32} />
            Live Results
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time cryptographic tally of the current election.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalVotes}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Votes Cast</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {candidates.map((c, i) => {
          const votes = results[c.id] || 0;
          const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
          
          return (
            <div key={c.id} style={{ marginBottom: i === candidates.length - 1 ? 0 : '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>({c.party})</span>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {votes} votes <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>{percentage}%</span>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
                  style={{ height: '100%', background: c.color, borderRadius: '6px' }}
                />
              </div>
            </div>
          );
        })}
        
        {totalVotes === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No votes have been cast yet.
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link to="/" className="btn btn-outline">
          <Home size={20} />
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default Results;
