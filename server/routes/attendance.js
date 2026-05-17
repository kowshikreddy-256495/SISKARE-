const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/attendance - Mark attendance (bulk)
router.post('/', authenticate, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { subject, date, records } = req.body;
    // records = [{ student_id, status, remarks }]

    if (!subject || !date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Subject, date, and records array are required' });
    }

    const values = records.map(r => [r.student_id, subject, date, r.status || 'present', req.user.id, r.remarks || null]);
    
    await db.query(
      `INSERT INTO attendance (student_id, subject, date, status, marked_by, remarks)
       VALUES ? 
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
      [values]
    );

    res.json({ success: true, message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/student/:id - Get attendance for a student
router.get('/student/:id', authenticate, async (req, res) => {
  try {
    // Students can only view their own attendance
    if (req.user.role === 'student') {
      const [myStudent] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (myStudent.length === 0 || myStudent[0].id !== parseInt(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const { subject, from_date, to_date } = req.query;
    let query = 'SELECT * FROM attendance WHERE student_id = ?';
    const params = [req.params.id];

    if (subject) { query += ' AND subject = ?'; params.push(subject); }
    if (from_date) { query += ' AND date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND date <= ?'; params.push(to_date); }

    query += ' ORDER BY date DESC';

    const [attendance] = await db.query(query, params);

    // Calculate summary
    const summary = {};
    attendance.forEach(a => {
      if (!summary[a.subject]) {
        summary[a.subject] = { total: 0, present: 0, absent: 0, late: 0 };
      }
      summary[a.subject].total++;
      summary[a.subject][a.status]++;
    });

    // Add percentage
    Object.keys(summary).forEach(sub => {
      summary[sub].percentage = Math.round(((summary[sub].present + summary[sub].late) / summary[sub].total) * 100);
    });

    res.json({ success: true, attendance, summary });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/subject/:subject - Get attendance by subject
router.get('/subject/:subject', authenticate, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { date, department, semester } = req.query;
    let query = `
      SELECT a.*, s.enrollment_no, u.name as student_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.subject = ?
    `;
    const params = [req.params.subject];

    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (department) { query += ' AND s.department = ?'; params.push(department); }
    if (semester) { query += ' AND s.semester = ?'; params.push(parseInt(semester)); }

    query += ' ORDER BY a.date DESC, u.name ASC';

    const [attendance] = await db.query(query, params);

    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance by subject error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/report - Attendance reports
router.get('/report', authenticate, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { department, semester, subject, month } = req.query;

    let query = `
      SELECT s.enrollment_no, u.name as student_name, s.department, s.semester,
        a.subject,
        COUNT(*) as total_classes,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late,
        ROUND((SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / COUNT(*)) * 100) as percentage
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (department) { query += ' AND s.department = ?'; params.push(department); }
    if (semester) { query += ' AND s.semester = ?'; params.push(parseInt(semester)); }
    if (subject) { query += ' AND a.subject = ?'; params.push(subject); }
    if (month) { query += ' AND MONTH(a.date) = ?'; params.push(parseInt(month)); }

    query += ' GROUP BY s.id, a.subject ORDER BY u.name';

    const [report] = await db.query(query, params);

    res.json({ success: true, report });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
