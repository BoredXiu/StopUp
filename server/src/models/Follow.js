const db = require('../config/database');
const { BusinessError } = require('../utils/errors');

const FollowModel = {
  async follow(followerId, followedId) {
    if (followerId === followedId) {
      throw new BusinessError('不能关注自己');
    }
    await db.query(
      'INSERT IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)',
      [followerId, followedId]
    );
  },

  async unfollow(followerId, followedId) {
    await db.query(
      'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
      [followerId, followedId]
    );
  },

  async isFollowing(followerId, followedId) {
    const [rows] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?',
      [followerId, followedId]
    );
    return rows.length > 0;
  },

  async getFollowers(userId, { page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM follows WHERE followed_id = ?', [userId]
    );
    const [rows] = await db.query(
      `SELECT u.id, u.nickname, u.avatar, u.bio, u.city, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followed_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async getFollowing(userId, { page = 1, pageSize = 20 }) {
    const offset = (page - 1) * pageSize;
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM follows WHERE follower_id = ?', [userId]
    );
    const [rows] = await db.query(
      `SELECT u.id, u.nickname, u.avatar, u.bio, u.city, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.followed_id = u.id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );
    return { list: rows, total: countResult[0].total };
  },

  async getFrequentPartners(userId, limit = 10) {
    const [rows] = await db.query(
      `SELECT u.id, u.nickname, u.avatar, u.city, COUNT(*) as together_count
       FROM match_members mm1
       JOIN match_members mm2 ON mm1.match_id = mm2.match_id AND mm2.user_id != ?
       JOIN users u ON mm2.user_id = u.id
       WHERE mm1.user_id = ? AND mm1.status IN (1, 2) AND mm2.status IN (1, 2)
       GROUP BY mm2.user_id
       ORDER BY together_count DESC
       LIMIT ?`,
      [userId, userId, limit]
    );
    return rows;
  },
};

module.exports = FollowModel;