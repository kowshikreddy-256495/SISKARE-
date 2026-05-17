const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/students - List all students
router.get('/', authenticate, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { department, semester, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT s.*, u.name, u.email, u.phone, u.avatar_url, u.is_active
      FROM students s 
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += ' AND s.department = ?';
      params.push(department);
    }
    if (semester) {
      query += ' AND s.semester = ?';
      params.push(parseInt(semester));
    }
    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR s.enrollment_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT s.*, u.name, u.email, u.phone, u.avatar_url, u.is_active', 'SELECT COUNT(*) as total');
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await db.query(query, params);

    res.json({
      success: true,
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/students/:id - Get student details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT s.*, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at as account_created
       FROM students s JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only view their own profile
    if (req.user.role === 'student') {
      const [myStudent] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (myStudent.length === 0 || myStudent[0].id !== parseInt(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, student: students[0] });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/students - Create student
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, email, password, phone, enrollment_no, department, semester, year, date_of_birth, gender, address, guardian_name, guardian_phone } = req.body;

    if (!name || !email || !password || !enrollment_no || !department) {
      return res.status(400).json({ success: false, message: 'Required fields: name, email, password, enrollment_no, department' });
    }

    // Check if email already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Create user account
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, 'student', phone || null]
    );

    // Create student profile
    const [studentResult] = await connection.query(
      `INSERT INTO students (user_id, enrollment_no, department, semester, year, date_of_birth, gender, address, guardian_name, guardian_phone, admission_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [userResult.insertId, enrollment_no, department, semester || 1, year || new Date().getFullYear(), date_of_birth || null, gender || null, address || null, guardian_name || null, guardian_phone || null]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: { id: studentResult.insertId, user_id: userResult.insertId, name, email, enrollment_no }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, phone, department, semester, year, address, guardian_name, guardian_phone } = req.body;
    
    const [students] = await db.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (name || phone) {
      const updates = [];
      const params = [];
      if (name) { updates.push('name = ?'); params.push(name); }
      if (phone) { updates.push('phone = ?'); params.push(phone); }
      params.push(students[0].user_id);
      await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const studentUpdates = [];
    const studentParams = [];
    if (department) { studentUpdates.push('department = ?'); studentParams.push(department); }
    if (semester) { studentUpdates.push('semester = ?'); studentParams.push(semester); }
    if (year) { studentUpdates.push('year = ?'); studentParams.push(year); }
    if (address) { studentUpdates.push('address = ?'); studentParams.push(address); }
    if (guardian_name) { studentUpdates.push('guardian_name = ?'); studentParams.push(guardian_name); }
    if (guardian_phone) { studentUpdates.push('guardian_phone = ?'); studentParams.push(guardian_phone); }

    if (studentUpdates.length > 0) {
      studentParams.push(req.params.id);
      await db.query(`UPDATE students SET ${studentUpdates.join(', ')} WHERE id = ?`, studentParams);
    }

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/students/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [students] = await db.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Cascade delete via user
    await db.query('DELETE FROM users WHERE id = ?', [students[0].user_id]);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
