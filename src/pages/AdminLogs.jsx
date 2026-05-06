import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Clock, Search, Trash2, Download } from 'lucide-react';

function AdminLogs() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('biovote_users') || '{}');
    const userList = Object.values(data);
    setUsers(userList);
  }, []);

  const registeredCount = users.length;
  const votedCount = users.filter(u => u.hasVoted).length;

  const filteredUsers = users.filter(user => 
    user.voterId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all registrations and votes? This action cannot be undone.")) {
      localStorage.removeItem('biovote_users');
      localStorage.removeItem('biovote_tally');
      setUsers([]);
      alert("System has been reset successfully.");
    }
  };

  const handleExportCSV = () => {
    const headers = ['Voter ID', 'Name', 'Biometrics Enrolled', 'Vote Status', 'Voting Time'];
    const rows = users.map(u => [
      u.voterId,
      u.name || 'N/A',
      'Yes',
      u.hasVoted ? 'Voted' : 'Pending',
      u.votedAt || '—'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biovote_logs_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Logs</h2>
          <p style={{ color: 'var(--text-muted)' }}>Audit trail for registrations and voting activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={handleReset}
            className="btn btn-outline" 
            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trash2 size={16} />
            Reset System
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <Users size={32} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.5rem' }}>{registeredCount}</h3>
          <p style={{ color: 'var(--text-muted)' }}>Total Registered</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
          <CheckSquare size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{votedCount}</h3>
          <p style={{ color: 'var(--success)' }}>Votes Cast</p>
        </div>
      </div>


      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by Voter ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem 0.75rem 2.75rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '8px', 
            color: '#fff',
            outline: 'none',
            fontSize: '0.875rem'
          }} 
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Voter ID</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Biometrics Enrolled</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Vote Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Voting Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {searchTerm ? 'No users matching your search.' : 'No registrations found.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{user.voterId}</td>
                  <td style={{ padding: '1rem' }}>{user.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      <CheckSquare size={14} /> Yes
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.hasVoted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <CheckSquare size={14} /> Voted
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {user.votedAt || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLogs;
