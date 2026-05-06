import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    const MODEL_URL = '/models';
    
    // Load the tiny face detector, landmark, and recognition models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    return false;
  }
};

export const getFaceDescriptor = async (videoElement) => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  // Detect a single face with tiny face detector
  const detection = await faceapi.detectSingleFace(
    videoElement, 
    new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
  )
  .withFaceLandmarks()
  .withFaceDescriptor();
  
  if (!detection) {
    return null;
  }
  
  return detection.descriptor;
};

// Simple Euclidean distance for face matching (face-api.js uses this under the hood too)
// Returns distance (lower is better, typically < 0.6 is a match)
export const compareFaces = (descriptor1, descriptor2) => {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
};

export const calculateEAR = (landmarks) => {
  // landmarks is an array of 68 Point objects
  // Left eye: 36, 37, 38, 39, 40, 41
  // Right eye: 42, 43, 44, 45, 46, 47
  const getEAR = (eyePoints) => {
    const vert1 = Math.hypot(eyePoints[1].x - eyePoints[5].x, eyePoints[1].y - eyePoints[5].y);
    const vert2 = Math.hypot(eyePoints[2].x - eyePoints[4].x, eyePoints[2].y - eyePoints[4].y);
    const horiz = Math.hypot(eyePoints[0].x - eyePoints[3].x, eyePoints[0].y - eyePoints[3].y);
    if (horiz === 0) return 0;
    return (vert1 + vert2) / (2.0 * horiz);
  };

  const leftEye  = landmarks.slice(36, 42);
  const rightEye = landmarks.slice(42, 48);

  const leftEAR  = getEAR(leftEye);
  const rightEAR = getEAR(rightEye);

  return { left: leftEAR, right: rightEAR, avg: (leftEAR + rightEAR) / 2.0 };
};

export const startLivenessCheck = (videoElement, onSuccess, onFailure) => {
  const MAX_TIME_MS    = 5000;
  const BASELINE_MS    = 1200;  // sample the first 1.2s to build a personal baseline
  const BLINK_DROP     = 0.90;  // blink triggers when EAR falls to 90% of baseline — typical webcam blinks are only ~10% drops
  const REOPEN_RATIO   = 0.95;  // eyes considered open again above 95% of baseline

  const startTime = Date.now();
  let running     = true;
  let blinkPhase  = 'calibrating'; // 'calibrating' | 'open' | 'closed'
  let baselineSamples = [];
  let baseline    = null;

  const stopCheck = () => { running = false; };

  console.group('%c👁️ Liveness Check Started', 'color: #8b5cf6; font-weight: bold');
  console.log('Will calibrate baseline for 1.2s, then detect a blink (phase: open → closed → open)');

  const poll = async () => {
    if (!running) return;

    const elapsed = Date.now() - startTime;

    if (elapsed > MAX_TIME_MS) {
      stopCheck();
      console.warn('[Liveness] TIMEOUT — baseline was:', baseline?.toFixed(3) ?? 'never computed');
      console.groupEnd();
      onFailure('Liveness check timed out. No blink was detected in 5 seconds. Please try again.');
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))  // 160 is faster → more frames → blink window less likely to be missed
        .withFaceLandmarks();

      if (detection) {
        const { left, right, avg } = calculateEAR(detection.landmarks.positions);

        if (blinkPhase === 'calibrating') {
          baselineSamples.push(avg);
          console.log(`[Liveness] Calibrating… sample ${baselineSamples.length} | L:${left.toFixed(3)} R:${right.toFixed(3)} avg:${avg.toFixed(3)}`);

          if (elapsed >= BASELINE_MS) {
            // Compute baseline as the median of samples to ignore outliers
            const sorted = [...baselineSamples].sort((a, b) => a - b);
            baseline = sorted[Math.floor(sorted.length / 2)];
            blinkPhase = 'open';
            console.log(`%c[Liveness] ✅ Baseline set: ${baseline.toFixed(3)} | Blink threshold: < ${(baseline * BLINK_DROP).toFixed(3)} | Reopen threshold: > ${(baseline * REOPEN_RATIO).toFixed(3)}`, 'color: #10b981; font-weight: bold');
          }
        } else {
          const closedThresh  = baseline * BLINK_DROP;
          const reopenThresh  = baseline * REOPEN_RATIO;

          console.log(`[Liveness] phase:${blinkPhase} | L:${left.toFixed(3)} R:${right.toFixed(3)} avg:${avg.toFixed(3)} | need-close:<${closedThresh.toFixed(3)} need-open:>${reopenThresh.toFixed(3)}`);

          if (blinkPhase === 'open' && avg < closedThresh) {
            blinkPhase = 'closed';
            console.log('%c[Liveness] 👁 Eyes CLOSED — waiting for reopen', 'color: #f59e0b');
          } else if (blinkPhase === 'closed' && avg > reopenThresh) {
            stopCheck();
            console.log('%c[Liveness] ✅ BLINK DETECTED — liveness confirmed!', 'color: #10b981; font-weight: bold');
            console.groupEnd();
            onSuccess();
            return;
          }
        }
      } else {
        console.log('[Liveness] No face detected this frame');
      }
    } catch (err) {
      console.error('[Liveness] Detection error:', err);
    }

    if (running) setTimeout(poll, 15);
  };

  poll();
};

export const checkForMultipleFaces = async (videoElement) => {
  if (!modelsLoaded) {
    await loadModels();
  }
  
  const detections = await faceapi.detectAllFaces(
    videoElement,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
  );
  
  return {
    count: detections.length,
    isSafe: detections.length === 1
  };
};
