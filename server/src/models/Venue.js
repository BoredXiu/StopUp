const db = require('../config/database');

const VenueModel = {
  async findById(id) {
    const [rows] = await db.query('SELECT * FROM venues WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const venue = rows[0];
    const [images] = await db.query(
      'SELECT id, url, sort_order FROM venue_images WHERE venue_id = ? ORDER BY sort_order ASC',
      [id]
    );
    venue.images = images;
    return venue;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO venues (name, address, city, district, latitude, longitude, phone, business_hours, description, facilities, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.address, data.city, data.district || null, data.latitude, data.longitude,
       data.phone || null, data.business_hours || null, data.description || null,
       JSON.stringify(data.facilities || []), data.cover_image || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowedFields = ['name', 'address', 'city', 'district', 'latitude', 'longitude',
      'phone', 'business_hours', 'description', 'facilities', 'cover_image', 'status', 'is_hot'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'facilities') {
          fields.push('facilities = ?');
          values.push(JSON.stringify(data[field]));
        } else {
          fields.push(`${field} = ?`);
          values.push(data[field]);
        }
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await db.query(`UPDATE venues SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async addImage(venueId, url, sortOrder = 0) {
    await db.query('INSERT INTO venue_images (venue_id, url, sort_order) VALUES (?, ?, ?)',
      [venueId, url, sortOrder]);
  },

  async deleteImage(imageId) {
    await db.query('DELETE FROM venue_images WHERE id = ?', [imageId]);
  },

  async list({ page = 1, pageSize = 20, city, district, isHot, keyword, orderBy = 'rating', orderDir = 'DESC' }) {
    const conditions = ['status = 1'];
    const values = [];

    if (city) {
      conditions.push('city = ?');
      values.push(city);
    }
    if (district) {
      conditions.push('district = ?');
      values.push(district);
    }
    if (isHot !== undefined) {
      conditions.push('is_hot = ?');
      values.push(isHot);
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR address LIKE ?)');
      values.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * pageSize;

    const allowedOrderFields = ['rating', 'match_count', 'created_at'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'rating';
    const safeOrderDir = orderDir === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM venues ${where}`, values);
    const [rows] = await db.query(
      `SELECT id, name, address, city, district, latitude, longitude, phone, business_hours,
              cover_image, rating, match_count, is_hot
       FROM venues ${where}
       ORDER BY ${safeOrderBy} ${safeOrderDir}
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async getHot(limit = 6) {
    const [rows] = await db.query(
      `SELECT id, name, address, city, cover_image, rating, match_count
       FROM venues WHERE status = 1 AND is_hot = 1
       ORDER BY rating DESC LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

module.exports = VenueModel;