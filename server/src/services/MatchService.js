const MatchModel = require('../models/Match');
const UserModel = require('../models/User');
const OrderModel = require('../models/Order');
const NotificationModel = require('../models/Notification');
const CreditLogModel = require('../models/CreditLog');
const { BusinessError, NotFoundError } = require('../utils/errors');

const MatchService = {
  async createMatch(data, userId) {
    const user = await UserModel.findById(userId);
    if (!user || user.status === 0) {
      throw new BusinessError('用户状态异常');
    }

    const match = await MatchModel.create({ ...data, creator_id: userId });
    await MatchModel.addMember(match.id, userId, 1);

    return match;
  },

  async joinMatch(matchId, userId) {
    const match = await MatchModel.findById(matchId);
    if (!match) {
      throw new NotFoundError('球局不存在');
    }

    if (match.status !== 1) {
      throw new BusinessError('当前球局状态不允许报名');
    }

    if (match.current_players >= match.max_players) {
      throw new BusinessError('球局已满员');
    }

    const isMember = await MatchModel.isMember(matchId, userId);
    if (isMember) {
      throw new BusinessError('您已报名该球局');
    }

    const user = await UserModel.findById(userId);
    if (user.credit_score < 60) {
      throw new BusinessError('信用分不足60分，无法报名球局');
    }

    if (match.gender_required === 1 && user.gender !== 1) {
      throw new BusinessError('该球局仅限男生报名');
    }
    if (match.gender_required === 2 && user.gender !== 2) {
      throw new BusinessError('该球局仅限女生报名');
    }

    await MatchModel.addMember(matchId, userId, 2);
    await MatchModel.incrementPlayerCount(matchId);

    const updatedMatch = await MatchModel.findById(matchId);
    if (updatedMatch.current_players >= updatedMatch.max_players) {
      await MatchModel.update(matchId, { status: 2 });
    }

    await NotificationModel.create({
      user_id: match.creator_id,
      type: 'match_join',
      title: '新的报名',
      content: `${user.nickname} 报名了你的球局「${match.title}」`,
      related_id: matchId,
      related_type: 'match',
    });

    return updatedMatch;
  },

  async leaveMatch(matchId, userId) {
    const match = await MatchModel.findById(matchId);
    if (!match) {
      throw new NotFoundError('球局不存在');
    }

    if (match.creator_id === userId) {
      throw new BusinessError('创建者不能退出球局，请取消球局');
    }

    if (![1, 2].includes(match.status)) {
      throw new BusinessError('当前球局状态不允许退出');
    }

    const isMember = await MatchModel.isMember(matchId, userId);
    if (!isMember) {
      throw new BusinessError('您未报名该球局');
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
      throw new NotFoundError('球局不存在');
    }

    if (match.creator_id !== userId) {
      throw new BusinessError('只有创建者可以取消球局');
    }

    if (![1, 2].includes(match.status)) {
      throw new BusinessError('当前球局状态不允许取消');
    }

    await MatchModel.update(matchId, { status: 5, cancel_reason: '创建者取消' });

    const members = await MatchModel.getMembers(matchId);
    const notifications = members
      .filter((m) => m.user_id !== userId)
      .map((m) => ({
        user_id: m.user_id,
        type: 'match_cancel',
        title: '球局已取消',
        content: `球局「${match.title}」已被创建者取消`,
        related_id: matchId,
        related_type: 'match',
      }));
    if (notifications.length > 0) {
      await NotificationModel.batchCreate(notifications);
    }

    return MatchModel.findById(matchId);
  },

  async completeMatch(matchId, userId) {
    const match = await MatchModel.findById(matchId);
    if (!match) {
      throw new NotFoundError('球局不存在');
    }

    if (match.creator_id !== userId) {
      throw new BusinessError('只有创建者可以结束球局');
    }

    if (match.status !== 3) {
      throw new BusinessError('只有已开始的球局才能结束');
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
          reason: 'complete_match',
          related_id: matchId,
          related_type: 'match',
        });
      }
    }

    return MatchModel.findById(matchId);
  },
};

module.exports = MatchService;