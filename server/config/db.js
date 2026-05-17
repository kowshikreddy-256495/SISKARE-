const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'university_sis',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
    console.error('   Make sure MySQL is running and credentials are correct in .env');
  });

module.exports = pool;
