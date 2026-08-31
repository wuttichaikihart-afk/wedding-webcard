const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const configPath = path.join(__dirname, '../src/data/config.json');
const assetsPath = path.join(__dirname, '../src/assets');

// Ensure directories exist
if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath, { recursive: true });
if (!fs.existsSync(path.dirname(configPath))) fs.mkdirSync(path.dirname(configPath), { recursive: true });

// Get Config
app.get('/api/config', (req, res) => {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read config' });
  }
});

// Save Config
app.post('/api/config', (req, res) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
    console.log(`[Config Saved Successfully] -> ${configPath}`);
    res.json({ success: true, savedPath: configPath });
  } catch (error) {
    console.error(`[Config Save Error]`, error);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Multer storage (save to memory first so we can compress with sharp)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload Image
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  
  // The filename to replace (e.g., 'main_cover.jpg' or 'pic1.jpg')
  const targetFilename = req.body.filename; 
  if (!targetFilename) return res.status(400).json({ error: 'Target filename is required' });

  const outputPath = path.join(assetsPath, targetFilename);

  try {
    // Compress and resize based on file type
    // If it's a huge photo, we resize it down to max 1920 width, optimize quality
    await sharp(req.file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true }) // Prevent upscaling
      .jpeg({ quality: 80, progressive: true }) // Optimize for web
      .toFile(outputPath);
      
    // If it's the main cover, also copy it to public folder for OG Image
    if (targetFilename === 'main_cover.JPG' || targetFilename === 'main_cover.jpg') {
      const publicPath = path.join(__dirname, '../public');
      if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
      fs.copyFileSync(outputPath, path.join(publicPath, 'main_cover.JPG'));
    }
      
    res.json({ success: true, message: 'Image uploaded and compressed successfully', file: targetFilename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Upload Music
app.post('/api/upload-music', upload.single('music'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No music file uploaded' });
  
  const publicPath = path.join(__dirname, '../public');
  if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
  
  const outputPath = path.join(publicPath, 'bgmusic.mp3');
  
  try {
    // Write the buffer directly to the file without processing
    fs.writeFileSync(outputPath, req.file.buffer);
    res.json({ success: true, message: 'Music uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save music file' });
  }
});

// Get all gallery images
app.get('/api/gallery', (req, res) => {
  try {
    const files = fs.readdirSync(assetsPath);
    const galleryFiles = files.filter(f => f.startsWith('pic') && (f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png')));
    // Sort logically like pic1, pic2, pic10
    galleryFiles.sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
      return numA - numB;
    });
    res.json(galleryFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read gallery directory' });
  }
});

// Delete an image
app.delete('/api/gallery/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (filename.includes('/') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const filePath = path.join(assetsPath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Build the site
const { exec } = require('child_process');
app.post('/api/build', (req, res) => {
  const projectRoot = path.join(__dirname, '..');
  exec('npm run build', { cwd: projectRoot }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error.message}`);
      return res.status(500).json({ error: 'Build failed', details: error.message });
    }
    res.json({ success: true, message: 'Build completed successfully', stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Admin Server running on http://localhost:${PORT}`);
});
