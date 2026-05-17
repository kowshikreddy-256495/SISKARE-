const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Get additional profile info based on role
    let profile = {};
    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students.length > 0) profile = students[0];
    } else if (user.role === 'faculty') {
      const [faculty] = await db.query('SELECT * FROM faculty WHERE user_id = ?', [user.id]);
      if (faculty.length > 0) profile = faculty[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let profile = {};

    if (user.role === 'student') {
      const [students] = await db.query('SELECT * FROM students WHERE user_id = ?', [user.id]);
      if (students.length > 0) profile = students[0];
    } else if (user.role === 'faculty') {
      const [faculty] = await db.query('SELECT * FROM faculty WHERE user_id = ?', [user.id]);
      if (faculty.length > 0) profile = faculty[0];
    }

    res.json({ success: true, user: { ...user, profile } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
