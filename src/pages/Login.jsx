import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ShieldCheck, AlertCircle, Fingerprint, Barcode } from 'lucide-react';
import { getFaceDescriptor, loadModels, compareFaces, checkForMultipleFaces, startLivenessCheck } from '../utils/faceUtils';
import BarcodeScanner from '../components/BarcodeScanner';

function Login() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [voterId, setVoterId] = useState(location.state?.voterId || '');
  const [status, setStatus] = useState('initializing');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!voterId.trim()) {
      setErrorMsg('Please enter your Voter ID');
      return;
    }

    const voterIdRegex = /^1NT\d{2}[A-Z]{2}\d{3}$/;
    if (!voterIdRegex.test(voterId)) {
      setErrorMsg('Invalid Format! ID must be like 1NT23CS007');
      return;
    }
    
    setStatus('processing');
    setErrorMsg('');

    try {
      // 1. Check if user exists
      const existingUsers = JSON.parse(localStorage.getItem('biovote_users') || '{}');
      const user = existingUsers[voterId];
      
      if (!user) {
        setStatus('ready');
        setErrorMsg('Voter ID not found. Please register first.');
        return;
      }

      // 2. Check if user has already voted
      if (user.hasVoted) {
        setStatus('ready');
        setErrorMsg('You have already cast your vote. Multiple votes are not permitted.');
        return;
      }

      // 3. Multi-Face Detection
      const multiFaceCheck = await checkForMultipleFaces(videoRef.current);
      if (multiFaceCheck.count === 0) {
        setStatus('ready');
        setCameraError(true);
        setErrorMsg('No face detected. Please look directly at the camera.');
        setTimeout(() => setCameraError(false), 500);
        return;
      }
      if (multiFaceCheck.count > 1) {
        setStatus('ready');
        setCameraError(true);
        setErrorMsg('Multiple faces detected. Only the registered voter may be present during authentication.');
        setTimeout(() => setCameraError(false), 500);
        return;
      }

      // 4. Liveness Check
      setStatus('liveness_check');
      try {
        await new Promise((resolve, reject) => {
          startLivenessCheck(
            videoRef.current,
            () => resolve(),
            (errMsg) => reject(new Error(errMsg))
          );
        });
      } catch (livenessError) {
        setStatus('ready');
        setCameraError(true);
        setErrorMsg(livenessError.message);
        setTimeout(() => setCameraError(false), 500);
        return;
      }
      
      setStatus('processing');

      // 5. Extract current face descriptor
      const currentDescriptor = await getFaceDescriptor(videoRef.current);
      
      if (!currentDescriptor) {
        setStatus('ready');
        setErrorMsg('No face detected. Please look directly at the camera.');
        return;
      }

      // 4. Compare with stored descriptor
      const storedDescriptor = new Float32Array(user.faceDescriptor);
      const distance = compareFaces(currentDescriptor, storedDescriptor);
      
      console.log('Face match distance:', distance);
      
      // A threshold of 0.6 is generally recommended for face-api models
      if (distance < 0.6) {
        // Authenticated!
        sessionStorage.setItem('authenticated_voter', voterId);
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('ready');
        setErrorMsg('Biometric authentication failed. Face does not match the registered profile.');
      }

    } catch (err) {
      setStatus('ready');
      setErrorMsg('An error occurred during facial authentication.');
      console.error(err);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Secure Login</h2>
        <p style={{ color: 'var(--text-muted)' }}>Authenticate with your face to cast your vote.</p>
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
            <Fingerprint size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Identity Verified</h3>
          <p style={{ color: 'var(--text-muted)' }}>Accessing voting dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Voter ID</label>
            <div className="input-with-button">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Example: 1NT23CS007"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                disabled={status === 'processing' || status === 'initializing'}
              />
              <button 
                type="button"
                className="icon-btn"
                onClick={() => setIsScannerOpen(true)}
                disabled={status === 'processing' || status === 'initializing'}
                title="Scan Barcode on ID Card"
              >
                <Barcode size={24} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="input-label">Identity Verification Scan</label>
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
                className={`camera-feed ${cameraError ? 'flash-error' : ''}`}
              />
              <div className="camera-overlay">
                <div className={`face-guide ${status === 'processing' || status === 'liveness_check' ? 'active' : ''}`}></div>
              </div>
              
              {status === 'liveness_check' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 10, backdropFilter: 'blur(10px)', borderRadius: '12px' }}>
                  <p style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}>👁️ Please blink once to confirm you're live.</p>
                  <div className="liveness-countdown">
                    <svg viewBox="0 0 36 36" style={{ width: '60px', height: '60px' }}>
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                        style={{ animation: 'countdown 5s linear forwards' }}
                      />
                    </svg>
                  </div>
                  <style>
                    {`
                      @keyframes countdown {
                        from { stroke-dasharray: 100, 100; }
                        to { stroke-dasharray: 0, 100; }
                      }
                      .flash-error {
                        animation: flash 0.5s;
                      }
                      @keyframes flash {
                        0% { box-shadow: 0 0 0 4px red; }
                        50% { box-shadow: none; }
                        100% { box-shadow: 0 0 0 4px red; }
                      }
                    `}
                  </style>
                </div>
              )}
            </div>
          </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={status !== 'ready' || !voterId.trim()}
            >
              {status === 'processing' || status === 'liveness_check' ? (
                <>
                  <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  {status === 'liveness_check' ? 'Checking Liveness...' : 'Verifying Identity...'}
                </>
              ) : (
              <>
                <Fingerprint size={20} />
                Authenticate
              </>
            )}
          </button>
        </form>
      )}

      {isScannerOpen && (
        <BarcodeScanner 
          onSuccess={(scannedId) => {
            setVoterId(scannedId);
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}

export default Login;
