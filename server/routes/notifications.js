const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const [notifications] = await db.query(
      `SELECT n.*, u.name as created_by_name 
       FROM notifications n 
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.target_role IN ('all', ?)
       ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [req.user.role, parseInt(limit), parseInt(offset)]
    );
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM notifications WHERE target_role IN (?, ?)',
      ['all', req.user.role]
    );
    res.json({ success: true, notifications, total: countResult[0].total });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/notifications
router.post('/', authenticate, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { title, message, type, target_role, target_department } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }
    const [result] = await db.query(
      'INSERT INTO notifications (title, message, type, target_role, target_department, created_by) VALUES (?,?,?,?,?,?)',
      [title, message, type || 'info', target_role || 'all', target_department || null, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Notification created', id: result.insertId });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
