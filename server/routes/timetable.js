const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/timetable
router.get('/', authenticate, async (req, res) => {
  try {
    const { department, semester, day_of_week } = req.query;
    let query = `
      SELECT t.*, u.name as faculty_name 
      FROM timetable t 
      LEFT JOIN faculty f ON t.faculty_id = f.id 
      LEFT JOIN users u ON f.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];
    if (department) { query += ' AND t.department = ?'; params.push(department); }
    if (semester) { query += ' AND t.semester = ?'; params.push(parseInt(semester)); }
    if (day_of_week) { query += ' AND t.day_of_week = ?'; params.push(day_of_week); }
    query += ` ORDER BY FIELD(t.day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.time_slot`;
    const [timetable] = await db.query(query, params);
    res.json({ success: true, timetable });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/timetable
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { department, semester, day_of_week, time_slot, subject, faculty_id, room, type } = req.body;
    if (!department || !semester || !day_of_week || !time_slot || !subject) {
      return res.status(400).json({ success: false, message: 'Required: department, semester, day, time_slot, subject' });
    }
    const [result] = await db.query(
      'INSERT INTO timetable (department, semester, day_of_week, time_slot, subject, faculty_id, room, type) VALUES (?,?,?,?,?,?,?,?)',
      [department, semester, day_of_week, time_slot, subject, faculty_id || null, room || null, type || 'lecture']
    );
    res.status(201).json({ success: true, message: 'Timetable entry created', id: result.insertId });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/timetable/:id
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const fields = ['department','semester','day_of_week','time_slot','subject','faculty_id','room','type'];
    const updates = [], params = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    });
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    params.push(req.params.id);
    await db.query(`UPDATE timetable SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Timetable entry updated' });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM timetable WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
