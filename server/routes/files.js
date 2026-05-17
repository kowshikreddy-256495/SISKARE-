const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const db = require('../config/db');

// POST /api/files/upload
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    // If avatar upload, update user
    if (req.body.type === 'avatar') {
      await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [fileUrl, req.user.id]);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
