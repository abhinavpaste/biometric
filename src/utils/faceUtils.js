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
