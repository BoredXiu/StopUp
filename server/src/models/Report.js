const db = require('../config/database');

const ReportModel = {
  async create(data) {
    const [result] = await db.query(
      `INSERT INTO reports (reporter_id, reported_user_id, match_id, type, reason, images)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.reporter_id, data.reported_user_id || null, data.match_id || null,
       data.type, data.reason, JSON.stringify(data.images || [])]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*,
              u1.nickname as reporter_nickname, u1.avatar as reporter_avatar,
              u2.nickname as reported_nickname, u2.avatar as reported_avatar
       FROM reports r
       LEFT JOIN users u1 ON r.reporter_id = u1.id
       LEFT JOIN users u2 ON r.reported_user_id = u2.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async handle(id, handlerId, status, handleResult) {
    await db.query(
      'UPDATE reports SET status = ?, handler_id = ?, handle_result = ?, handled_at = NOW() WHERE id = ?',
      [status, handlerId, handleResult || null, id]
    );
    return this.findById(id);
  },

  async list({ page = 1, pageSize = 20, status, type }) {
    const conditions = [];
    const values = [];

    if (status !== undefined) {
      conditions.push('r.status = ?');
      values.push(status);
    }
    if (type) {
      conditions.push('r.type = ?');
      values.push(type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM reports r ${where}`, values);
    const [rows] = await db.query(
      `SELECT r.*,
              u1.nickname as reporter_nickname,
              u2.nickname as reported_nickname
       FROM reports r
       LEFT JOIN users u1 ON r.reporter_id = u1.id
       LEFT JOIN users u2 ON r.reported_user_id = u2.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },
};

module.exports = ReportModel;