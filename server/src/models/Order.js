const db = require('../config/database');
const { generateOrderNo } = require('../utils/helpers');

const OrderModel = {
  async findById(id) {
    const [rows] = await db.query(
      `SELECT o.*, m.title as match_title, m.match_date, m.start_time, m.end_time,
              s.name as sport_name, v.name as venue_name
       FROM orders o
       LEFT JOIN matches m ON o.match_id = m.id
       LEFT JOIN sports s ON m.sport_id = s.id
       LEFT JOIN venues v ON m.venue_id = v.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByOrderNo(orderNo) {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_no = ?', [orderNo]);
    return rows[0] || null;
  },

  async create(data) {
    const orderNo = generateOrderNo();
    const expireMinutes = 30;
    const [result] = await db.query(
      `INSERT INTO orders (order_no, user_id, match_id, amount, status, expire_at)
       VALUES (?, ?, ?, ?, 1, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [orderNo, data.user_id, data.match_id, data.amount, expireMinutes]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status, extra = {}) {
    const fields = ['status = ?'];
    const values = [status];

    if (status === 2) {
      fields.push('paid_at = NOW()');
    }
    if (status === 5) {
      fields.push('refund_at = NOW()');
      if (extra.refundAmount) {
        fields.push('refund_amount = ?');
        values.push(extra.refundAmount);
      }
    }
    if (extra.remark) {
      fields.push('remark = ?');
      values.push(extra.remark);
    }

    values.push(id);
    await db.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async list({ page = 1, pageSize = 20, userId, matchId, status, orderBy = 'created_at', orderDir = 'DESC' }) {
    const conditions = [];
    const values = [];

    if (userId) {
      conditions.push('o.user_id = ?');
      values.push(userId);
    }
    if (matchId) {
      conditions.push('o.match_id = ?');
      values.push(matchId);
    }
    if (status !== undefined) {
      conditions.push('o.status = ?');
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const allowedOrderFields = ['created_at', 'amount'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const safeOrderDir = orderDir === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM orders o ${where}`, values);
    const [rows] = await db.query(
      `SELECT o.*, m.title as match_title, m.match_date, s.name as sport_name
       FROM orders o
       LEFT JOIN matches m ON o.match_id = m.id
       LEFT JOIN sports s ON m.sport_id = s.id
       ${where}
       ORDER BY o.${safeOrderBy} ${safeOrderDir}
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async cancelExpired() {
    const [result] = await db.query(
      `UPDATE orders SET status = 3, remark = '超时自动取消'
       WHERE status = 1 AND expire_at < NOW()`
    );
    return result.affectedRows;
  },
};

module.exports = OrderModel;