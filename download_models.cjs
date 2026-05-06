const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const filesToDownload = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename);
    const file = fs.createWriteStream(filePath);
    const url = baseUrl + filename;

    console.log(`Downloading ${filename}...`);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });
};

const downloadAll = async () => {
  for (const file of filesToDownload) {
    try {
      await downloadFile(file);
    } catch (err) {
      console.error(`Error downloading ${file}:`, err.message);
    }
  }
  console.log('All models downloaded!');
};

downloadAll();
