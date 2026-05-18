const OrderModel = require('../models/Order');
const OrderService = require('../services/OrderService');
const { success, paginate } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

const OrderController = {
  async create(req, res) {
    const { matchId } = req.body;
    const order = await OrderService.createOrder(matchId, req.user.userId);
    res.json(success(order, '订单创建成功'));
  },

  async pay(req, res) {
    const id = parseInt(req.params.id);
    const order = await OrderService.payOrder(id, req.user.userId);
    res.json(success(order, '支付成功'));
  },

  async refund(req, res) {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    const order = await OrderService.refundOrder(id, req.user.userId, reason);
    res.json(success(order, '退款成功'));
  },

  async detail(req, res) {
    const id = parseInt(req.params.id);
    const order = await OrderModel.findById(id);
    if (!order) throw new NotFoundError('订单不存在');
    if (order.user_id !== req.user.userId) {
      return res.status(403).json({ code: 403, message: '无权查看该订单', data: null });
    }
    res.json(success(order));
  },

  async myOrders(req, res) {
    const { page = 1, pageSize = 20, status } = req.query;
    const result = await OrderModel.list({
      userId: req.user.userId,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status: status !== undefined ? parseInt(status) : undefined,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },
};

module.exports = OrderController;