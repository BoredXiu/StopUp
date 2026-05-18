const db = require('../config/database');

const SportModel = {
  async getAll() {
    const [rows] = await db.query(
      'SELECT id, name, icon, sort_order FROM sports WHERE status = 1 ORDER BY sort_order ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM sports WHERE id = ?', [id]);
    return rows[0] || null;
  },
};

module.exports = SportModel;