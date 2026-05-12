const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '192.168.56.10',
  user:     process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'AppPass123!',
  database: process.env.DB_NAME     || 'letterboxd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
