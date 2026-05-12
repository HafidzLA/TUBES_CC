const mysql = require('mysql2/promise');

const isLocal = !process.env.DB_HOST || process.env.DB_HOST.includes('192.168');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '192.168.56.10',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'AppPass123!',
  database: process.env.DB_NAME     || 'letterboxd',
  ssl:      isLocal ? undefined : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
