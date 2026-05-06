import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const candidates = [
  {
    id: 'c1',
    name: 'Elena Rodriguez',
    party: 'PARTY A',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'c2',
    name: 'Marcus Chen',
    party: 'PARTY B',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
  },
  {
    id: 'c3',
    name: 'Sarah Jenkins',
    party: 'PARTY C',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400'
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voterId, setVoterId] = useState(null);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    // Verify authentication
    const authVoterId = sessionStorage.getItem('authenticated_voter');
    if (!authVoterId) {
      navigate('/login');
      return;
    }
    setVoterId(authVoterId);
  }, [navigate]);

  const handleVote = () => {
    if (!selectedCandidate || !voterId) return;

    setIsCasting(true);

    setTimeout(() => {
      // Get all users and votes
      const existingUsers = JSON.parse(localStorage.getItem('biovote_users') || '{}');
      const votes = JSON.parse(localStorage.getItem('biovote_tally') || '{}');

      // Double check user exists and hasn't voted
      const user = existingUsers[voterId];
      if (!user || user.hasVoted) {
        alert("You have already voted or user not found.");
        setIsCasting(false);
        navigate('/');
        return;
      }

      // Mark user as voted
      user.hasVoted = true;
      user.votedAt = new Date().toLocaleString();
      localStorage.setItem('biovote_users', JSON.stringify(existingUsers));

      // Record vote (anonymous tally)
      votes[selectedCandidate] = (votes[selectedCandidate] || 0) + 1;
      localStorage.setItem('biovote_tally', JSON.stringify(votes));

      // Generate confirmation code
      const code = `BV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Clear session auth
      sessionStorage.removeItem('authenticated_voter');

      navigate('/success', { state: { confirmationCode: code } });
    }, 1500);
  };

  if (!voterId) return null;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Cast Your Vote</h2>
          <p style={{ color: 'var(--text-muted)' }}>Securely choose your preferred candidate.</p>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} />
          Identity Verified
        </div>
      </div>

      <div className="candidates-grid">
        {candidates.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`candidate-card ${selectedCandidate === c.id ? 'selected' : ''}`}
            onClick={() => setSelectedCandidate(c.id)}
          >
            <img src={c.image} alt={c.name} className="candidate-img" />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{c.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{c.party}</p>

            <div style={{
              height: '24px',
              width: '24px',
              borderRadius: '50%',
              border: `2px solid ${selectedCandidate === c.id ? 'var(--primary)' : 'var(--glass-border)'}`,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selectedCandidate === c.id ? 'var(--primary)' : 'transparent'
            }}>
              {selectedCandidate === c.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          disabled={!selectedCandidate || isCasting}
          onClick={handleVote}
          style={{ padding: '1rem 3rem', fontSize: '1.125rem', minWidth: '250px' }}
        >
          {isCasting ? (
            <>
              <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              Encrypting Vote...
            </>
          ) : (
            'Submit Vote Securely'
          )}
        </button>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
          <ShieldAlert size={16} />
          Your vote is anonymous and cryptographically sealed.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
