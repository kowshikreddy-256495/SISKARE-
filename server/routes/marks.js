const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateResultPDF } = require('../utils/pdfGenerator');

// POST /api/marks - Enter marks (bulk)
router.post('/', authenticate, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { subject, exam_type, total_marks, semester, academic_year, records } = req.body;
    if (!subject || !exam_type || !total_marks || !semester || !records || records.length === 0) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const values = records.map(r => [
      r.student_id, subject, exam_type, r.marks_obtained, total_marks,
      semester, academic_year || null, req.user.id, r.remarks || null
    ]);
    await db.query(
      `INSERT INTO marks (student_id, subject, exam_type, marks_obtained, total_marks, semester, academic_year, entered_by, remarks) VALUES ?`,
      [values]
    );
    res.json({ success: true, message: `Marks entered for ${records.length} students` });
  } catch (error) {
    console.error('Enter marks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/marks/student/:id
router.get('/student/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const [myStudent] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (myStudent.length === 0 || myStudent[0].id !== parseInt(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    const { semester, subject } = req.query;
    let query = 'SELECT * FROM marks WHERE student_id = ?';
    const params = [req.params.id];
    if (semester) { query += ' AND semester = ?'; params.push(parseInt(semester)); }
    if (subject) { query += ' AND subject = ?'; params.push(subject); }
    query += ' ORDER BY semester DESC, subject, exam_type';
    const [marks] = await db.query(query, params);

    const subjects = {};
    marks.forEach(m => {
      const key = `${m.subject}-${m.semester}`;
      if (!subjects[key]) subjects[key] = { subject: m.subject, semester: m.semester, exams: [], totalObtained: 0, totalMax: 0 };
      subjects[key].exams.push(m);
      subjects[key].totalObtained += parseFloat(m.marks_obtained);
      subjects[key].totalMax += parseFloat(m.total_marks);
    });
    Object.values(subjects).forEach(s => {
      s.percentage = Math.round((s.totalObtained / s.totalMax) * 100);
      s.grade = s.percentage >= 90 ? 'O' : s.percentage >= 80 ? 'A+' : s.percentage >= 70 ? 'A' : s.percentage >= 60 ? 'B+' : s.percentage >= 50 ? 'B' : s.percentage >= 40 ? 'C' : 'F';
    });
    res.json({ success: true, marks, summary: Object.values(subjects) });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/marks/result-pdf/:studentId
router.get('/result-pdf/:studentId', authenticate, async (req, res) => {
  try {
    const [students] = await db.query(
      'SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [req.params.studentId]
    );
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });

    let q = 'SELECT * FROM marks WHERE student_id = ?';
    const p = [req.params.studentId];
    if (req.query.semester) { q += ' AND semester = ?'; p.push(parseInt(req.query.semester)); }
    const [marks] = await db.query(q + ' ORDER BY subject, exam_type', p);
    if (marks.length === 0) return res.status(404).json({ success: false, message: 'No marks found' });

    const pdfBuffer = await generateResultPDF(students[0], marks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=result_${students[0].enrollment_no}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
