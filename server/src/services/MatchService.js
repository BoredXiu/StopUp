const MatchModel = require("../models/Match");
const UserModel = require("../models/User");
const OrderModel = require("../models/Order");
const OrderService = require("../services/OrderService");
const NotificationModel = require("../models/Notification");
const CreditLogModel = require("../models/CreditLog");
const { BusinessError, NotFoundError } = require("../utils/errors");

const MatchService = {
	async createMatch(data, userId) {
		const user = await UserModel.findById(userId);
		if (!user || user.status === 0) {
			throw new BusinessError("用户状态异常");
		}

		const match = await MatchModel.create({ ...data, creator_id: userId });
		await MatchModel.addMember(match.id, userId, 1);

		return match;
	},

	async joinMatch(matchId, userId) {
		const match = await MatchModel.findById(matchId);
		if (!match) {
			throw new NotFoundError("球局不存在");
		}

		if (match.status !== 1) {
			throw new BusinessError("当前球局状态不允许报名");
		}

		if (match.current_players >= match.max_players) {
			throw new BusinessError("球局已满员");
		}

		const isMember = await MatchModel.isMember(matchId, userId);
		if (isMember) {
			throw new BusinessError("您已报名该球局");
		}

		const user = await UserModel.findById(userId);
		if (user.credit_score < 60) {
			throw new BusinessError("信用分不足60分，无法报名球局");
		}

		if (match.gender_required === 1 && user.gender !== 1) {
			throw new BusinessError("该球局仅限男生报名");
		}
		if (match.gender_required === 2 && user.gender !== 2) {
			throw new BusinessError("该球局仅限女生报名");
		}

		const db = require("../config/database");
		const [conflicts] = await db.query(
			`SELECT m.id, m.title, m.match_date, m.start_time, m.end_time
			 FROM matches m
			 JOIN match_members mm ON m.id = mm.match_id
			 WHERE mm.user_id = ?
			   AND mm.status IN (1, 2)
			   AND m.status IN (1, 2, 3)
			   AND m.id != ?
			   AND m.match_date = ?
			   AND (
			     (m.start_time < ? AND m.end_time > ?) OR
			     (m.start_time >= ? AND m.start_time < ?)
			   )`,
			[userId, matchId, match.match_date, match.end_time, match.start_time, match.start_time, match.end_time],
		);
		if (conflicts.length > 0) {
			const conflict = conflicts[0];
			throw new BusinessError(`时间冲突：您已报名了同日的「${conflict.title}」(${conflict.start_time}-${conflict.end_time})，请勿重复报名`);
		}

		await MatchModel.addMember(matchId, userId, 2);
		await MatchModel.incrementPlayerCount(matchId);

		const updatedMatch = await MatchModel.findById(matchId);
		if (updatedMatch.current_players >= updatedMatch.max_players) {
			await MatchModel.update(matchId, { status: 2 });
		}

		// 自动创建订单（若场局需要付费）
		let order = null;
		if (match.fee_type !== 3 && match.per_person_fee > 0) {
			try {
				order = await OrderService.createOrder(matchId, userId);
			} catch (_err) {
				// 订单创建失败不阻塞报名流程
				console.error("自动创建订单失败:", _err.message);
			}
		}

		await NotificationModel.create({
			user_id: match.creator_id,
			type: "match_join",
			title: "新的报名",
			content: `${user.nickname} 报名了你的球局「${match.title}」`,
			related_id: matchId,
			related_type: "match",
		});

		return { match: updatedMatch, order };
	},

	async leaveMatch(matchId, userId) {
		const match = await MatchModel.findById(matchId);
		if (!match) {
			throw new NotFoundError("球局不存在");
		}

		if (match.creator_id === userId) {
			throw new BusinessError("创建者不能退出球局，请取消球局");
		}

		if (![1, 2].includes(match.status)) {
			throw new BusinessError("当前球局状态不允许退出");
		}

		const isMember = await MatchModel.isMember(matchId, userId);
		if (!isMember) {
			throw new BusinessError("您未报名该球局");
		}

		await MatchModel.removeMember(matchId, userId);
		await MatchModel.decrementPlayerCount(matchId);

		if (match.status === 2) {
			await MatchModel.update(matchId, { status: 1 });
		}

		return MatchModel.findById(matchId);
	},

	async cancelMatch(matchId, userId) {
		const match = await MatchModel.findById(matchId);
		if (!match) {
			throw new NotFoundError("球局不存在");
		}

		if (match.creator_id !== userId) {
			throw new BusinessError("只有创建者可以取消球局");
		}

		if (![1, 2].includes(match.status)) {
			throw new BusinessError("当前球局状态不允许取消");
		}

		await MatchModel.update(matchId, { status: 5, cancel_reason: "创建者取消" });

		const members = await MatchModel.getMembers(matchId);
		const notifications = members
			.filter((m) => m.user_id !== userId)
			.map((m) => ({
				user_id: m.user_id,
				type: "match_cancel",
				title: "球局已取消",
				content: `球局「${match.title}」已被创建者取消`,
				related_id: matchId,
				related_type: "match",
			}));
		if (notifications.length > 0) {
			await NotificationModel.batchCreate(notifications);
		}

		return MatchModel.findById(matchId);
	},

	async completeMatch(matchId, userId) {
		const match = await MatchModel.findById(matchId);
		if (!match) {
			throw new NotFoundError("球局不存在");
		}

		if (match.creator_id !== userId) {
			throw new BusinessError("只有创建者可以结束球局");
		}

		if (match.status !== 3) {
			throw new BusinessError("只有已开始的球局才能结束");
		}

		await MatchModel.update(matchId, { status: 4 });

		const members = await MatchModel.getMembers(matchId);
		for (const member of members) {
			if (member.status === 2) {
				const user = await UserModel.findById(member.user_id);
				const newScore = Math.min(100, user.credit_score + 5);
				await UserModel.updateCreditScore(member.user_id, 5);
				await CreditLogModel.create({
					user_id: member.user_id,
					change_amount: 5,
					balance: newScore,
					reason: "complete_match",
					related_id: matchId,
					related_type: "match",
				});
			}
		}

		return MatchModel.findById(matchId);
	},
};

module.exports = MatchService;
