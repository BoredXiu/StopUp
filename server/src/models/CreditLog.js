const db = require('../config/database');

const CreditLogModel = {
  async create(data) {
    const [result] = await db.query(
      `INSERT INTO credit_logs (user_id, change_amount, balance, reason, related_id, related_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.user_id, data.change_amount, data.balance, data.reason,
       data.related_id || null, data.related_type || null]
    );
    return result.insertId;
  },

  async list({ userId, page = 1, pageSize = 20 }) {
    const conditions = ['user_id = ?'];
    const values = [userId];
    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * pageSize;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM credit_logs ${where}`, values);
    const [rows] = await db.query(
      `SELECT * FROM credit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },
};

module.exports = CreditLogModel;