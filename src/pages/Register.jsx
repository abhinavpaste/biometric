import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { getFaceDescriptor, loadModels } from '../utils/faceUtils';

function Register() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [voterId, setVoterId] = useState('');
  const [status, setStatus] = useState('initializing'); // initializing, ready, capturing, processing, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg('Could not access camera or load AI models. Please ensure you have granted camera permissions.');
      }
    };
    init();

    return () => {
      // Cleanup camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!voterId.trim()) {
      setErrorMsg('Please enter a valid Voter ID');
      return;
    }
    
    setStatus('processing');
    setErrorMsg('');

    try {
      const descriptor = await getFaceDescriptor(videoRef.current);
      
      if (!descriptor) {
        setStatus('ready');
        setErrorMsg('No face detected. Please look directly at the camera in a well-lit environment.');
        return;
      }

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('biovote_users') || '{}');
      if (existingUsers[voterId]) {
        setStatus('ready');
        setErrorMsg('This Voter ID is already registered.');
        return;
      }

      // Save user
      existingUsers[voterId] = {
        voterId,
        faceDescriptor: Array.from(descriptor),
        hasVoted: false
      };
      
      localStorage.setItem('biovote_users', JSON.stringify(existingUsers));
      
      setStatus('success');
      setTimeout(() => {
        navigate('/login', { state: { voterId } });
      }, 2000);

    } catch (err) {
      setStatus('error');
      setErrorMsg('An error occurred during facial processing.');
      console.error(err);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Biometric Registration</h2>
        <p style={{ color: 'var(--text-muted)' }}>Secure your voting identity using facial recognition.</p>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)' }}>
            <ShieldCheck size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Registration Successful!</h3>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to secure login...</p>
        </div>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">Voter ID</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter your unique Voter ID"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              disabled={status === 'processing' || status === 'initializing'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="input-label">Face Scan</label>
            <div className="camera-container">
              {status === 'initializing' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
                  <div className="loader">
                    <div className="loader-spinner"></div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Initializing AI Models...</span>
                  </div>
                </div>
              )}
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="camera-feed"
              />
              <div className="camera-overlay">
                <div className={`face-guide ${status === 'processing' ? 'active' : ''}`}></div>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Position your face inside the guide. Ensure good lighting.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={status !== 'ready' || !voterId.trim()}
          >
            {status === 'processing' ? (
              <>
                <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                Processing...
              </>
            ) : (
              <>
                <Camera size={20} />
                Capture & Register
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default Register;
