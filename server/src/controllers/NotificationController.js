const NotificationModel = require('../models/Notification');
const { success, paginate } = require('../utils/response');

const NotificationController = {
  async list(req, res) {
    const { page = 1, pageSize = 20, isRead, type } = req.query;
    const result = await NotificationModel.list({
      userId: req.user.userId,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      isRead: isRead !== undefined ? parseInt(isRead) : undefined,
      type,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async markRead(req, res) {
    const id = parseInt(req.params.id);
    await NotificationModel.markAsRead(id, req.user.userId);
    res.json(success(null, '已标记为已读'));
  },

  async markAllRead(req, res) {
    await NotificationModel.markAllAsRead(req.user.userId);
    res.json(success(null, '全部已读'));
  },

  async unreadCount(req, res) {
    const count = await NotificationModel.getUnreadCount(req.user.userId);
    res.json(success({ count }));
  },
};

module.exports = NotificationController;