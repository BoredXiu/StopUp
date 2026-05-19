const db = require("../config/database");
const MatchModel = require("../models/Match");
const MatchService = require("../services/MatchService");
const { success, paginate } = require("../utils/response");
const { NotFoundError } = require("../utils/errors");

const MatchController = {
	async list(req, res) {
		const { page = 1, pageSize = 20, sportId, city, status, date, isFeatured, keyword, orderBy, orderDir } = req.query;
		const result = await MatchModel.list({
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			sportId: sportId ? parseInt(sportId) : undefined,
			city,
			status: status !== undefined ? parseInt(status) : undefined,
			date,
			isFeatured: isFeatured !== undefined ? parseInt(isFeatured) : undefined,
			keyword,
			orderBy,
			orderDir,
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async detail(req, res) {
		const id = parseInt(req.params.id);
		const match = await MatchModel.findById(id);
		if (!match) throw new NotFoundError("球局不存在");

		await MatchModel.incrementViewCount(id);

		const members = await MatchModel.getMembers(id);
		const isMember = req.user ? await MatchModel.isMember(id, req.user.userId) : false;

		res.json(success({ ...match, members, isMember }));
	},

	async create(req, res) {
		const match = await MatchService.createMatch(req.body, req.user.userId);
		res.json(success(match, "球局创建成功"));
	},

	async update(req, res) {
		const id = parseInt(req.params.id);
		const match = await MatchModel.findById(id);
		if (!match) throw new NotFoundError("球局不存在");
		if (match.creator_id !== req.user.userId) {
			return res.status(403).json({ code: 403, message: "只有创建者可以修改球局", data: null });
		}
		const updated = await MatchModel.update(id, req.body);
		res.json(success(updated, "更新成功"));
	},

	async join(req, res) {
		const id = parseInt(req.params.id);
		const result = await MatchService.joinMatch(id, req.user.userId);
		res.json(success(result, "报名成功"));
	},

	async leave(req, res) {
		const id = parseInt(req.params.id);
		const match = await MatchService.leaveMatch(id, req.user.userId);
		res.json(success(match, "已退出球局"));
	},

	async cancel(req, res) {
		const id = parseInt(req.params.id);
		const match = await MatchService.cancelMatch(id, req.user.userId);
		res.json(success(match, "球局已取消"));
	},

	async complete(req, res) {
		const id = parseInt(req.params.id);
		const match = await MatchService.completeMatch(id, req.user.userId);
		res.json(success(match, "球局已结束"));
	},

	async getMembers(req, res) {
		const id = parseInt(req.params.id);
		const members = await MatchModel.getMembers(id);
		res.json(success(members));
	},

	async myMatches(req, res) {
		const { page = 1, pageSize = 20, status } = req.query;
		const result = await MatchModel.getUserMatches(req.user.userId, {
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			status: status !== undefined ? parseInt(status) : undefined,
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async favorite(req, res) {
		const matchId = parseInt(req.params.id);
		await db.query("INSERT IGNORE INTO match_favorites (user_id, match_id) VALUES (?, ?)", [req.user.userId, matchId]);
		res.json(success(null, "收藏成功"));
	},

	async unfavorite(req, res) {
		const matchId = parseInt(req.params.id);
		await db.query("DELETE FROM match_favorites WHERE user_id = ? AND match_id = ?", [req.user.userId, matchId]);
		res.json(success(null, "已取消收藏"));
	},

	async myFavorites(req, res) {
		const { page = 1, pageSize = 20 } = req.query;
		const offset = (parseInt(page) - 1) * parseInt(pageSize);
		const [countResult] = await db.query("SELECT COUNT(*) as total FROM match_favorites WHERE user_id = ?", [req.user.userId]);
		const [rows] = await db.query(
			`SELECT m.*, s.name as sport_name, v.name as venue_name,
              u.nickname as creator_nickname, u.avatar as creator_avatar,
              mf.created_at as favorited_at
       FROM match_favorites mf
       JOIN matches m ON mf.match_id = m.id
       LEFT JOIN sports s ON m.sport_id = s.id
       LEFT JOIN venues v ON m.venue_id = v.id
       LEFT JOIN users u ON m.creator_id = u.id
       WHERE mf.user_id = ?
       ORDER BY mf.created_at DESC
       LIMIT ? OFFSET ?`,
			[req.user.userId, parseInt(pageSize), offset],
		);
		res.json(paginate(rows, countResult[0].total, parseInt(page), parseInt(pageSize)));
	},
};

module.exports = MatchController;
