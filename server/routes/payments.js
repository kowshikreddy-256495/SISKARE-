const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateReceiptPDF } = require('../utils/pdfGenerator');

// Initialize Razorpay
let razorpay;
try {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
} catch (e) {
  console.warn('⚠️  Razorpay not configured. Payment features will be disabled.');
}

// POST /api/payments/create-order
router.post('/create-order', authenticate, requireRole('student'), async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Payment gateway not configured' });

    const { type, amount, description } = req.body;
    if (!type || !amount) {
      return res.status(400).json({ success: false, message: 'Type and amount are required' });
    }

    const [student] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { student_id: student[0].id, type, user_name: req.user.name }
    };

    const order = await razorpay.orders.create(options);

    // Save order to DB
    await db.query(
      'INSERT INTO payments (student_id, type, description, amount, currency, razorpay_order_id, status) VALUES (?,?,?,?,?,?,?)',
      [student[0].id, type, description || type, amount, 'INR', order.id, 'pending']
    );

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await db.query(
        'UPDATE payments SET status = ? WHERE razorpay_order_id = ?',
        ['failed', razorpay_order_id]
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment record
    await db.query(
      'UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = ?, paid_at = NOW() WHERE razorpay_order_id = ?',
      [razorpay_payment_id, razorpay_signature, 'completed', razorpay_order_id]
    );

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payments/history
router.get('/history', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'student') {
      const [student] = await db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (student.length === 0) return res.json({ success: true, payments: [] });
      query = 'SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC';
      params = [student[0].id];
    } else {
      query = `SELECT p.*, u.name as student_name, s.enrollment_no 
               FROM payments p JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id 
               ORDER BY p.created_at DESC LIMIT 100`;
      params = [];
    }
    const [payments] = await db.query(query, params);
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/payments/receipt/:id
router.get('/receipt/:id', authenticate, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, u.name as student_name, s.enrollment_no, s.department 
       FROM payments p JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id 
       WHERE p.id = ? AND p.status = 'completed'`,
      [req.params.id]
    );
    if (payments.length === 0) return res.status(404).json({ success: false, message: 'Receipt not found' });

    const pdfBuffer = await generateReceiptPDF(payments[0]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${payments[0].id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
