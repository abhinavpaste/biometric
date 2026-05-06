import React, { useEffect, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Flashlight, AlertCircle } from 'lucide-react';

const BarcodeScanner = ({ onSuccess, onClose }) => {
  const [error, setError] = useState('');
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [scannerId] = useState(() => `scanner-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => {
    let isMounted = true;
    
    // We only want 1D barcodes typical for ID cards
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39
    ];

    const scanner = new Html5Qrcode(scannerId, { formatsToSupport });
    setHtml5QrCode(scanner);

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        return {
          width: Math.floor(viewfinderWidth * 0.8),
          height: 100
        };
      },
      disableFlip: true,
    };

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      // Validate with Regex
      const voterIdRegex = /^1NT\d{2}[A-Z]{2}\d{3}$/;
      if (voterIdRegex.test(decodedText)) {
        scanner.stop().then(() => {
          onSuccess(decodedText);
        }).catch(err => {
          console.error("Error stopping scanner", err);
          onSuccess(decodedText); // Proceed anyway
        });
      } else {
        setError('Scanned code is not a valid Voter ID format.');
      }
    };

    const qrCodeErrorCallback = (errorMessage) => {
      // Ignore routine scan errors, they happen constantly while searching for a code
    };

    scanner.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).then(() => {
      if (!isMounted) {
        scanner.stop().catch(console.error);
        return;
      }
      // Check for flash support after starting
      const track = scanner.getRunningTrackCameraCapabilities();
      if (track && typeof track.torch !== 'undefined') {
        setFlashSupported(true);
      }
    }).catch(err => {
      if (isMounted) {
        console.error(err);
        setError("Failed to access camera. Please ensure permissions are granted.");
      }
    });

    return () => {
      isMounted = false;
      if (scanner.isScanning) {
        scanner.stop().catch(err => console.error("Error stopping scanner on unmount", err));
      }
    };
  }, [onSuccess, scannerId]);

  const toggleFlash = async () => {
    if (!html5QrCode || !html5QrCode.isScanning) return;
    try {
      const newState = !flashOn;
      await html5QrCode.applyVideoConstraints({
        advanced: [{ torch: newState }]
      });
      setFlashOn(newState);
    } catch (err) {
      console.error("Failed to toggle flash", err);
    }
  };

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Scan Voter ID Barcode</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="scanner-container">
          <div id={scannerId} style={{ width: '100%' }}></div>
          <div className="laser-line"></div>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Align the physical barcode horizontally within the frame.
        </p>

        {flashSupported && (
          <button 
            type="button" 
            onClick={toggleFlash}
            className={`btn ${flashOn ? 'btn-primary' : 'btn-outline'}`}
            style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Flashlight size={18} />
            {flashOn ? 'Turn Flash Off' : 'Turn Flash On'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
