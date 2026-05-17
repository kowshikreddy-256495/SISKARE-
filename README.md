# 🎓 University Student Information System (SIS)

A full-stack University SIS with React frontend, Node.js/Express backend, MySQL database, and Razorpay payment integration.

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind)
      ↓ /api proxy
Node.js Backend (Express)
      ↓ mysql2
MySQL Database
      ↓ Razorpay SDK
Razorpay Payment Gateway
```

## 📁 Project Structure

```
university-sis/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth & Theme contexts
│   │   ├── layouts/         # Dashboard layout
│   │   ├── pages/           # Route pages
│   │   └── services/        # Axios API client
│   └── index.html
├── server/                  # Node.js + Express backend
│   ├── config/db.js         # MySQL connection pool
│   ├── middleware/          # auth.js, upload.js
│   ├── routes/              # All API routes
│   └── utils/pdfGenerator.js
├── database/
│   └── schema.sql           # Full MySQL schema + seed data
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MySQL 8.x (local or cloud)

### 1. Database Setup

```sql
-- In your MySQL client:
source database/schema.sql;
```

Or import the file from MySQL Workbench / phpMyAdmin.

### 2. Backend Setup

```bash
cd server
# Edit .env with your MySQL credentials and Razorpay keys
npm install
node server.js
```

The server runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app runs on **http://localhost:5173**

## 🔑 Default Credentials

| Role    | Email                            | Password    |
|---------|----------------------------------|-------------|
| Admin   | admin@university.edu             | password    |
| Faculty | rajesh.kumar@university.edu      | password    |
| Student | aarav.patel@university.edu       | password    |

> ⚠️ Change default passwords in production!

## ⚙️ Environment Variables (`server/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=university_sis

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_SECRET=your_razorpay_secret
```

## 📱 Features

### Student Portal
- Dashboard with attendance %, grades, and today's schedule
- Subject-wise attendance records with visual progress bars
- Examination results with grade cards and PDF download
- Interactive timetable (grid + list view)
- Fee payment via Razorpay (semester, hostel, exam, library)
- Payment history and receipt download

### Faculty Portal
- Dashboard with class overview and student list
- One-click attendance marking with bulk UI
- Marks entry per subject and exam type
- Timetable view

### Admin Panel
- Full student management (create, view, delete)
- Department analytics with charts
- Notification broadcast (all users, students, or faculty)
- Payment overview and revenue tracking
- Timetable management

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v4     |
| State     | React Context (Auth, Theme)         |
| Routing   | React Router DOM v6                 |
| Charts    | Chart.js + react-chartjs-2          |
| HTTP      | Axios with JWT interceptor          |
| Backend   | Node.js, Express 4                  |
| Database  | MySQL 8 via mysql2                  |
| Auth      | JWT + bcryptjs                      |
| Uploads   | Multer (disk storage)               |
| PDF       | PDFKit                              |
| Payments  | Razorpay SDK                        |

## 💳 Razorpay Integration

1. Create account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get test API keys from Settings → API Keys
3. Add to `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_SECRET=your_secret
   ```
4. Test with card: `4111 1111 1111 1111`, any future expiry, any CVV

## 🌙 Dark Mode

Click the 🌙/☀️ toggle in the navbar or login page. Preference saved in `localStorage`.

## 📄 PDF Generation

- **Result Card**: `GET /api/marks/result-pdf/:studentId` — Full marks sheet with grades
- **Payment Receipt**: `GET /api/payments/receipt/:paymentId` — Payment confirmation

## 🔒 Security

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (10 rounds)
- Role-based route protection on frontend and backend
- HMAC-SHA256 payment signature verification

# SISKARE-
