const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spotup',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
});

pool.getConnection()
  .then((conn) => {
    console.log('[数据库] MySQL 连接成功');
    conn.release();
  })
  .catch((err) => {
    console.error('[数据库] MySQL 连接失败:', err.message);
  });

module.exports = pool;