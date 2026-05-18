const db = require('../config/database');

const MatchModel = {
  async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, s.name as sport_name, s.icon as sport_icon,
              v.name as venue_name, v.address as venue_address, v.latitude, v.longitude,
              u.nickname as creator_nickname, u.avatar as creator_avatar
       FROM matches m
       LEFT JOIN sports s ON m.sport_id = s.id
       LEFT JOIN venues v ON m.venue_id = v.id
       LEFT JOIN users u ON m.creator_id = u.id
       WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO matches (title, sport_id, venue_id, creator_id, match_date, start_time, end_time,
        max_players, min_players, fee_type, total_fee, per_person_fee, level_required, gender_required,
        description, cover_image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title, data.sport_id, data.venue_id || null, data.creator_id, data.match_date,
       data.start_time, data.end_time, data.max_players, data.min_players || 2,
       data.fee_type || 1, data.total_fee || 0, data.per_person_fee || 0,
       data.level_required || 0, data.gender_required || 0,
       data.description || null, data.cover_image || null, 1]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['title', 'sport_id', 'venue_id', 'match_date', 'start_time', 'end_time',
      'max_players', 'min_players', 'fee_type', 'total_fee', 'per_person_fee',
      'level_required', 'gender_required', 'description', 'cover_image', 'status', 'cancel_reason',
      'current_players', 'is_featured'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await db.query(`UPDATE matches SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async incrementViewCount(id) {
    await db.query('UPDATE matches SET view_count = view_count + 1 WHERE id = ?', [id]);
  },

  async incrementPlayerCount(id) {
    await db.query('UPDATE matches SET current_players = current_players + 1 WHERE id = ?', [id]);
  },

  async decrementPlayerCount(id) {
    await db.query('UPDATE matches SET current_players = GREATEST(0, current_players - 1) WHERE id = ?', [id]);
  },

  async list({ page = 1, pageSize = 20, sportId, city, status, date, isFeatured, creatorId, keyword, orderBy = 'created_at', orderDir = 'DESC' }) {
    const conditions = [];
    const values = [];

    if (sportId) {
      conditions.push('m.sport_id = ?');
      values.push(sportId);
    }
    if (city) {
      conditions.push('v.city = ?');
      values.push(city);
    }
    if (status !== undefined) {
      conditions.push('m.status = ?');
      values.push(status);
    }
    if (date) {
      conditions.push('m.match_date = ?');
      values.push(date);
    }
    if (isFeatured !== undefined) {
      conditions.push('m.is_featured = ?');
      values.push(isFeatured);
    }
    if (creatorId) {
      conditions.push('m.creator_id = ?');
      values.push(creatorId);
    }
    if (keyword) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ?)');
      values.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const allowedOrderFields = ['created_at', 'match_date', 'view_count', 'current_players'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const safeOrderDir = orderDir === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM matches m LEFT JOIN venues v ON m.venue_id = v.id ${where}`,
      values
    );
    const [rows] = await db.query(
      `SELECT m.*, s.name as sport_name, s.icon as sport_icon,
              v.name as venue_name, v.address as venue_address, v.city as venue_city,
              u.nickname as creator_nickname, u.avatar as creator_avatar
       FROM matches m
       LEFT JOIN sports s ON m.sport_id = s.id
       LEFT JOIN venues v ON m.venue_id = v.id
       LEFT JOIN users u ON m.creator_id = u.id
       ${where}
       ORDER BY m.${safeOrderBy} ${safeOrderDir}
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async getMembers(matchId) {
    const [rows] = await db.query(
      `SELECT mm.*, u.nickname, u.avatar, u.gender, u.credit_score
       FROM match_members mm
       LEFT JOIN users u ON mm.user_id = u.id
       WHERE mm.match_id = ?
       ORDER BY mm.role ASC, mm.joined_at ASC`,
      [matchId]
    );
    return rows;
  },

  async addMember(matchId, userId, role = 2) {
    await db.query(
      'INSERT INTO match_members (match_id, user_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = 1, role = VALUES(role)',
      [matchId, userId, role]
    );
  },

  async removeMember(matchId, userId) {
    await db.query(
      'UPDATE match_members SET status = 3 WHERE match_id = ? AND user_id = ?',
      [matchId, userId]
    );
  },

  async isMember(matchId, userId) {
    const [rows] = await db.query(
      'SELECT id FROM match_members WHERE match_id = ? AND user_id = ? AND status IN (1, 2)',
      [matchId, userId]
    );
    return rows.length > 0;
  },

  async getUserMatches(userId, { page = 1, pageSize = 20, status }) {
    const conditions = ['mm.user_id = ?'];
    const values = [userId];
    if (status !== undefined) {
      conditions.push('mm.status = ?');
      values.push(status);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * pageSize;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM match_members mm ${where}`,
      values
    );
    const [rows] = await db.query(
      `SELECT m.*, mm.role as member_role, mm.status as member_status, mm.joined_at,
              s.name as sport_name, s.icon as sport_icon,
              v.name as venue_name,
              u.nickname as creator_nickname, u.avatar as creator_avatar
       FROM match_members mm
       JOIN matches m ON mm.match_id = m.id
       LEFT JOIN sports s ON m.sport_id = s.id
       LEFT JOIN venues v ON m.venue_id = v.id
       LEFT JOIN users u ON m.creator_id = u.id
       ${where}
       ORDER BY m.match_date DESC, m.start_time DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },
};

module.exports = MatchModel;