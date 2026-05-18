const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const UserModel = require('../models/User');
const MatchModel = require('../models/Match');
const VenueModel = require('../models/Venue');
const OrderModel = require('../models/Order');
const ReportModel = require('../models/Report');
const { jwt: jwtConfig } = require('../config');
const { success, paginate } = require('../utils/response');
const { BusinessError } = require('../utils/errors');

const AdminController = {
  async login(req, res) {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    const admin = rows[0];
    if (!admin) throw new BusinessError('用户名或密码错误');
    if (admin.status === 0) throw new BusinessError('账号已被禁用');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new BusinessError('用户名或密码错误');

    await db.query(
      'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [req.ip, admin.id]
    );

    const token = jwt.sign(
      { userId: admin.id, isAdmin: true, role: admin.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json(success({
      token,
      user: { id: admin.id, username: admin.username, nickname: admin.nickname, role: admin.role },
    }, '登录成功'));
  },

  async dashboard(req, res) {
    const [[userCount]] = await db.query('SELECT COUNT(*) as total FROM users');
    const [[matchCount]] = await db.query('SELECT COUNT(*) as total FROM matches');
    const [[venueCount]] = await db.query('SELECT COUNT(*) as total FROM venues WHERE status = 1');
    const [[orderCount]] = await db.query('SELECT COUNT(*) as total FROM orders WHERE status = 2');
    const [[reportCount]] = await db.query('SELECT COUNT(*) as total FROM reports WHERE status = 1');
    const [[todayMatchCount]] = await db.query(
      'SELECT COUNT(*) as total FROM matches WHERE match_date = CURDATE()'
    );

    const [[totalRevenue]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status IN (2, 4)'
    );

    const [sportStats] = await db.query(
      `SELECT s.name, COUNT(*) as count
       FROM matches m JOIN sports s ON m.sport_id = s.id
       WHERE m.status IN (1, 2, 3, 4)
       GROUP BY m.sport_id ORDER BY count DESC LIMIT 10`
    );

    const [dailyStats] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM matches WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );

    res.json(success({
      userCount: userCount.total,
      matchCount: matchCount.total,
      venueCount: venueCount.total,
      orderCount: orderCount.total,
      reportCount: reportCount.total,
      todayMatchCount: todayMatchCount.total,
      totalRevenue: totalRevenue.total,
      sportStats,
      dailyStats,
    }));
  },

  async listUsers(req, res) {
    const { page = 1, pageSize = 20, keyword, status, city } = req.query;
    const result = await UserModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      keyword,
      status: status !== undefined ? parseInt(status) : undefined,
      city,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async updateUserStatus(req, res) {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    await UserModel.update(id, { status });
    res.json(success(null, '更新成功'));
  },

  async listMatches(req, res) {
    const { page = 1, pageSize = 20, sportId, status, keyword } = req.query;
    const result = await MatchModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sportId: sportId ? parseInt(sportId) : undefined,
      status: status !== undefined ? parseInt(status) : undefined,
      keyword,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async updateMatchStatus(req, res) {
    const id = parseInt(req.params.id);
    const { status, cancelReason } = req.body;
    await MatchModel.update(id, { status, cancel_reason: cancelReason });
    res.json(success(null, '更新成功'));
  },

  async listVenues(req, res) {
    const { page = 1, pageSize = 20, city, keyword } = req.query;
    const result = await VenueModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      city,
      keyword,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async createVenue(req, res) {
    const venue = await VenueModel.create(req.body);
    res.json(success(venue, '场馆创建成功'));
  },

  async updateVenue(req, res) {
    const id = parseInt(req.params.id);
    const venue = await VenueModel.update(id, req.body);
    res.json(success(venue, '更新成功'));
  },

  async listOrders(req, res) {
    const { page = 1, pageSize = 20, status } = req.query;
    const result = await OrderModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status: status !== undefined ? parseInt(status) : undefined,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async listReports(req, res) {
    const { page = 1, pageSize = 20, status, type } = req.query;
    const result = await ReportModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status: status !== undefined ? parseInt(status) : undefined,
      type,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },
};

module.exports = AdminController;