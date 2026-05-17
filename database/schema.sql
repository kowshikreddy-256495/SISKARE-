-- =============================================
-- University Student Information System (SIS)
-- Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS university_sis;
USE university_sis;

-- =============================================
-- Users Table (shared auth for all roles)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin') NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Students Table
-- =============================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    enrollment_no VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    year INT NOT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    guardian_name VARCHAR(100) DEFAULT NULL,
    guardian_phone VARCHAR(20) DEFAULT NULL,
    admission_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_department (department),
    INDEX idx_semester (semester),
    INDEX idx_enrollment (enrollment_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Faculty Table
-- =============================================
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    specialization VARCHAR(200) DEFAULT NULL,
    joining_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_department (department),
    INDEX idx_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Attendance Table
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
    marked_by INT DEFAULT NULL,
    remarks VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, subject, date),
    INDEX idx_date (date),
    INDEX idx_subject (subject),
    INDEX idx_student_subject (student_id, subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Marks Table
-- =============================================
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_type ENUM('midterm', 'final', 'assignment', 'quiz', 'practical') NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) DEFAULT NULL,
    entered_by INT DEFAULT NULL,
    remarks VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_semester (student_id, semester),
    INDEX idx_subject (subject),
    INDEX idx_exam_type (exam_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Timetable Table
-- =============================================
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    faculty_id INT DEFAULT NULL,
    room VARCHAR(50) DEFAULT NULL,
    type ENUM('lecture', 'lab', 'tutorial') NOT NULL DEFAULT 'lecture',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
    INDEX idx_dept_sem (department, semester),
    INDEX idx_day (day_of_week),
    INDEX idx_faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Notifications Table
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'urgent', 'event') NOT NULL DEFAULT 'info',
    target_role ENUM('all', 'student', 'faculty', 'admin') NOT NULL DEFAULT 'all',
    target_department VARCHAR(100) DEFAULT NULL,
    attachment_url VARCHAR(500) DEFAULT NULL,
    created_by INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_target (target_role, target_department),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Payments Table
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    type ENUM('semester_fee', 'hostel_fee', 'exam_fee', 'library_fee', 'other') NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(100) DEFAULT NULL,
    razorpay_payment_id VARCHAR(100) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    receipt_url VARCHAR(500) DEFAULT NULL,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_razorpay_order (razorpay_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- Seed Data: Default Admin Account
-- Password: admin123 (bcrypt hash)
-- =============================================
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('System Administrator', 'admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+91-9876543210');

-- =============================================
-- Seed Data: Sample Departments
-- =============================================
-- Computer Science, Electronics, Mechanical, Civil, Electrical

-- =============================================
-- Seed Data: Sample Faculty
-- Password: faculty123
-- =============================================
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Dr. Rajesh Kumar', 'rajesh.kumar@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', '+91-9876543211'),
('Prof. Anita Sharma', 'anita.sharma@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'faculty', '+91-9876543212');

INSERT INTO faculty (user_id, employee_id, department, designation, specialization) VALUES
(2, 'FAC-2024-001', 'Computer Science', 'Professor', 'Artificial Intelligence'),
(3, 'FAC-2024-002', 'Computer Science', 'Associate Professor', 'Data Structures');

-- =============================================
-- Seed Data: Sample Students
-- Password: student123
-- =============================================
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Aarav Patel', 'aarav.patel@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '+91-9876543213'),
('Priya Singh', 'priya.singh@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '+91-9876543214'),
('Rohan Mehta', 'rohan.mehta@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '+91-9876543215');

INSERT INTO students (user_id, enrollment_no, department, semester, year, date_of_birth, gender, address) VALUES
(4, 'CS-2024-001', 'Computer Science', 4, 2024, '2003-05-15', 'male', 'Mumbai, Maharashtra'),
(5, 'CS-2024-002', 'Computer Science', 4, 2024, '2003-08-22', 'female', 'Delhi, India'),
(6, 'CS-2024-003', 'Computer Science', 4, 2024, '2003-11-10', 'male', 'Bangalore, Karnataka');

-- =============================================
-- Seed Data: Sample Timetable
-- =============================================
INSERT INTO timetable (department, semester, day_of_week, time_slot, subject, faculty_id, room, type) VALUES
('Computer Science', 4, 'Monday', '09:00-10:00', 'Data Structures', 1, 'CS-101', 'lecture'),
('Computer Science', 4, 'Monday', '10:00-11:00', 'Operating Systems', 2, 'CS-102', 'lecture'),
('Computer Science', 4, 'Monday', '11:30-12:30', 'Database Systems', 1, 'CS-101', 'lecture'),
('Computer Science', 4, 'Tuesday', '09:00-10:00', 'Computer Networks', 2, 'CS-102', 'lecture'),
('Computer Science', 4, 'Tuesday', '10:00-12:00', 'Data Structures Lab', 1, 'Lab-1', 'lab'),
('Computer Science', 4, 'Wednesday', '09:00-10:00', 'Data Structures', 1, 'CS-101', 'lecture'),
('Computer Science', 4, 'Wednesday', '10:00-11:00', 'Operating Systems', 2, 'CS-102', 'lecture'),
('Computer Science', 4, 'Wednesday', '11:30-12:30', 'Mathematics-IV', NULL, 'CS-103', 'lecture'),
('Computer Science', 4, 'Thursday', '09:00-10:00', 'Database Systems', 1, 'CS-101', 'lecture'),
('Computer Science', 4, 'Thursday', '10:00-12:00', 'Operating Systems Lab', 2, 'Lab-2', 'lab'),
('Computer Science', 4, 'Friday', '09:00-10:00', 'Computer Networks', 2, 'CS-102', 'lecture'),
('Computer Science', 4, 'Friday', '10:00-11:00', 'Mathematics-IV', NULL, 'CS-103', 'lecture'),
('Computer Science', 4, 'Friday', '11:30-01:30', 'Database Systems Lab', 1, 'Lab-1', 'lab');

-- =============================================
-- Seed Data: Sample Attendance
-- =============================================
INSERT INTO attendance (student_id, subject, date, status, marked_by) VALUES
(1, 'Data Structures', '2026-05-12', 'present', 2),
(1, 'Operating Systems', '2026-05-12', 'present', 3),
(1, 'Database Systems', '2026-05-12', 'present', 2),
(2, 'Data Structures', '2026-05-12', 'present', 2),
(2, 'Operating Systems', '2026-05-12', 'absent', 3),
(2, 'Database Systems', '2026-05-12', 'present', 2),
(3, 'Data Structures', '2026-05-12', 'late', 2),
(3, 'Operating Systems', '2026-05-12', 'present', 3),
(3, 'Database Systems', '2026-05-12', 'present', 2),
(1, 'Data Structures', '2026-05-14', 'present', 2),
(1, 'Operating Systems', '2026-05-14', 'absent', 3),
(2, 'Data Structures', '2026-05-14', 'present', 2),
(3, 'Data Structures', '2026-05-14', 'present', 2);

-- =============================================
-- Seed Data: Sample Marks
-- =============================================
INSERT INTO marks (student_id, subject, exam_type, marks_obtained, total_marks, semester, academic_year, entered_by) VALUES
(1, 'Data Structures', 'midterm', 42, 50, 4, '2025-26', 2),
(1, 'Operating Systems', 'midterm', 38, 50, 4, '2025-26', 3),
(1, 'Database Systems', 'midterm', 45, 50, 4, '2025-26', 2),
(1, 'Computer Networks', 'midterm', 40, 50, 4, '2025-26', 3),
(1, 'Data Structures', 'assignment', 18, 20, 4, '2025-26', 2),
(2, 'Data Structures', 'midterm', 35, 50, 4, '2025-26', 2),
(2, 'Operating Systems', 'midterm', 41, 50, 4, '2025-26', 3),
(2, 'Database Systems', 'midterm', 44, 50, 4, '2025-26', 2),
(2, 'Computer Networks', 'midterm', 37, 50, 4, '2025-26', 3),
(3, 'Data Structures', 'midterm', 28, 50, 4, '2025-26', 2),
(3, 'Operating Systems', 'midterm', 33, 50, 4, '2025-26', 3),
(3, 'Database Systems', 'midterm', 39, 50, 4, '2025-26', 2);

-- =============================================
-- Seed Data: Sample Notifications
-- =============================================
INSERT INTO notifications (title, message, type, target_role, created_by) VALUES
('Welcome to University SIS', 'Welcome to the new Student Information System. Please update your profile.', 'info', 'all', 1),
('Mid-Semester Exams', 'Mid-semester examinations will begin from June 1st, 2026. Check your timetable.', 'warning', 'student', 1),
('Faculty Meeting', 'All faculty members are requested to attend the department meeting on May 20th.', 'event', 'faculty', 1);
