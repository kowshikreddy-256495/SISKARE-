const PDFDocument = require('pdfkit');

/**
 * Generate a student result PDF
 */
async function generateResultPDF(student, marks) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('UNIVERSITY OF TECHNOLOGY', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Student Information System', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('EXAMINATION RESULT', { align: 'center' });
    doc.moveDown();

    // Horizontal line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Student info
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${student.name}`, 50);
    doc.text(`Enrollment No: ${student.enrollment_no}`, 50);
    doc.text(`Department: ${student.department}`, 50);
    doc.text(`Semester: ${student.semester}`, 50);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const col = { subject: 50, type: 200, obtained: 320, total: 400, pct: 470 };

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Subject', col.subject, tableTop);
    doc.text('Exam Type', col.type, tableTop);
    doc.text('Obtained', col.obtained, tableTop);
    doc.text('Total', col.total, tableTop);
    doc.text('%', col.pct, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(10);
    let totalObtained = 0, totalMax = 0;

    marks.forEach(m => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(m.subject, col.subject, y, { width: 140 });
      doc.text(m.exam_type, col.type, y);
      doc.text(String(m.marks_obtained), col.obtained, y);
      doc.text(String(m.total_marks), col.total, y);
      const pct = Math.round((m.marks_obtained / m.total_marks) * 100);
      doc.text(`${pct}%`, col.pct, y);
      totalObtained += parseFloat(m.marks_obtained);
      totalMax += parseFloat(m.total_marks);
      y += 20;
    });

    // Total row
    doc.moveTo(50, y).lineTo(545, y).stroke();
    y += 10;
    doc.font('Helvetica-Bold');
    doc.text('TOTAL', col.subject, y);
    doc.text(String(totalObtained), col.obtained, y);
    doc.text(String(totalMax), col.total, y);
    const overallPct = Math.round((totalObtained / totalMax) * 100);
    doc.text(`${overallPct}%`, col.pct, y);
    y += 25;

    // Grade
    const grade = overallPct >= 90 ? 'O' : overallPct >= 80 ? 'A+' : overallPct >= 70 ? 'A' : overallPct >= 60 ? 'B+' : overallPct >= 50 ? 'B' : overallPct >= 40 ? 'C' : 'F';
    doc.fontSize(14).text(`Overall Grade: ${grade}`, 50, y, { align: 'center' });

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      `Generated on ${new Date().toLocaleDateString()} | University SIS`,
      50, 750, { align: 'center' }
    );

    doc.end();
  });
}

/**
 * Generate a payment receipt PDF
 */
async function generateReceiptPDF(payment) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('UNIVERSITY OF TECHNOLOGY', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(11).font('Helvetica');
    doc.text(`Receipt No: RCP-${String(payment.id).padStart(6, '0')}`);
    doc.text(`Date: ${new Date(payment.paid_at).toLocaleDateString()}`);
    doc.text(`Student: ${payment.student_name}`);
    doc.text(`Enrollment: ${payment.enrollment_no}`);
    doc.text(`Department: ${payment.department}`);
    doc.moveDown();
    doc.text(`Payment Type: ${payment.type.replace('_', ' ').toUpperCase()}`);
    doc.text(`Amount: ₹${parseFloat(payment.amount).toLocaleString()}`);
    doc.text(`Transaction ID: ${payment.razorpay_payment_id}`);
    doc.text(`Status: ${payment.status.toUpperCase()}`);
    doc.moveDown(2);

    doc.fontSize(8).text('This is a computer-generated receipt.', { align: 'center' });
    doc.end();
  });
}

module.exports = { generateResultPDF, generateReceiptPDF };
