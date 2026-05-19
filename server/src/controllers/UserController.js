const UserModel = require("../models/User");
const FollowModel = require("../models/Follow");
const CreditLogModel = require("../models/CreditLog");
const { success, paginate } = require("../utils/response");
const { NotFoundError } = require("../utils/errors");

const UserController = {
	async list(req, res) {
		const { page = 1, pageSize = 20, keyword } = req.query;
		const result = await UserModel.list({
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			keyword,
			status: 1,
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async getProfile(req, res) {
		const user = await UserModel.findById(req.user.userId);
		if (!user) throw new NotFoundError("用户不存在");

		res.json(
			success({
				id: user.id,
				nickname: user.nickname,
				avatar: user.avatar,
				gender: user.gender,
				birthday: user.birthday,
				bio: user.bio,
				city: user.city,
				creditScore: user.credit_score,
				phone: user.phone ? user.phone.slice(0, 3) + "****" + user.phone.slice(-4) : null,
				sportTags: [],
				createdAt: user.created_at,
			}),
		);
	},

	async updateProfile(req, res) {
		const allowedFields = ["nickname", "avatar", "gender", "birthday", "bio", "city"];
		const data = {};
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				data[field] = req.body[field];
			}
		}
		const user = await UserModel.update(req.user.userId, data);
		res.json(success(user, "更新成功"));
	},

	async getUserDetail(req, res) {
		const userId = parseInt(req.params.id);
		const user = await UserModel.findById(userId);
		if (!user) throw new NotFoundError("用户不存在");

		const isFollowing = req.user ? await FollowModel.isFollowing(req.user.userId, userId) : false;

		res.json(
			success({
				id: user.id,
				nickname: user.nickname,
				avatar: user.avatar,
				gender: user.gender,
				bio: user.bio,
				city: user.city,
				creditScore: user.credit_score,
				isFollowing,
				createdAt: user.created_at,
			}),
		);
	},

	async getCreditLogs(req, res) {
		const { page = 1, pageSize = 20 } = req.query;
		const result = await CreditLogModel.list({
			userId: req.user.userId,
			page: parseInt(page),
			pageSize: parseInt(pageSize),
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async follow(req, res) {
		const followedId = parseInt(req.params.id);
		await FollowModel.follow(req.user.userId, followedId);
		res.json(success(null, "关注成功"));
	},

	async unfollow(req, res) {
		const followedId = parseInt(req.params.id);
		await FollowModel.unfollow(req.user.userId, followedId);
		res.json(success(null, "已取消关注"));
	},

	async getFollowers(req, res) {
		const { page = 1, pageSize = 20 } = req.query;
		const userId = parseInt(req.params.id);
		const result = await FollowModel.getFollowers(userId, {
			page: parseInt(page),
			pageSize: parseInt(pageSize),
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async getFollowing(req, res) {
		const { page = 1, pageSize = 20 } = req.query;
		const userId = parseInt(req.params.id);
		const result = await FollowModel.getFollowing(userId, {
			page: parseInt(page),
			pageSize: parseInt(pageSize),
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async getFrequentPartners(req, res) {
		const userId = parseInt(req.params.id);
		const partners = await FollowModel.getFrequentPartners(userId);
		res.json(success(partners));
	},
};

module.exports = UserController;
