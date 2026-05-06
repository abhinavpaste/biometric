import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Success from './pages/Success';
import Results from './pages/Results';
import { Fingerprint } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            <Fingerprint className="text-primary" size={24} />
            <span>Bio<span className="text-gradient">Vote</span></span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/results" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Live Results
            </Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/success" element={<Success />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
