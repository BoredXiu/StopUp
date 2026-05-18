const db = require('../config/database');

const NotificationModel = {
  async create(data) {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, content, related_id, related_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.user_id, data.type, data.title, data.content || null,
       data.related_id || null, data.related_type || null]
    );
    return result.insertId;
  },

  async batchCreate(notifications) {
    if (!notifications.length) return;
    const values = notifications.map((n) => [
      n.user_id, n.type, n.title, n.content || null,
      n.related_id || null, n.related_type || null,
    ]);
    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    await db.query(
      `INSERT INTO notifications (user_id, type, title, content, related_id, related_type)
       VALUES ${placeholders}`,
      values.flat()
    );
  },

  async list({ userId, page = 1, pageSize = 20, isRead, type }) {
    const conditions = ['user_id = ?'];
    const values = [userId];

    if (isRead !== undefined) {
      conditions.push('is_read = ?');
      values.push(isRead);
    }
    if (type) {
      conditions.push('type = ?');
      values.push(type);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * pageSize;

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM notifications ${where}`, values);
    const [rows] = await db.query(
      `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async markAsRead(id, userId) {
    await db.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  },

  async markAllAsRead(userId) {
    await db.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
      [userId]
    );
  },

  async getUnreadCount(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  },
};

module.exports = NotificationModel;