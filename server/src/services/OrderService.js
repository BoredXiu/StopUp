const OrderModel = require("../models/Order");
const PaymentModel = require("../models/Payment");
const MatchModel = require("../models/Match");
const NotificationModel = require("../models/Notification");
const { BusinessError, NotFoundError } = require("../utils/errors");

const OrderService = {
	async createOrder(matchId, userId) {
		const match = await MatchModel.findById(matchId);
		if (!match) {
			throw new NotFoundError("球局不存在");
		}

		if (match.fee_type === 3 || match.per_person_fee <= 0) {
			throw new BusinessError("该球局免费，无需支付");
		}

		const isMember = await MatchModel.isMember(matchId, userId);
		if (!isMember) {
			throw new BusinessError("请先报名球局");
		}

		const existingOrders = await OrderModel.list({
			userId,
			matchId,
			status: 1,
			pageSize: 1,
		});
		if (existingOrders.total > 0) {
			throw new BusinessError("您已有待支付的订单");
		}

		const order = await OrderModel.create({
			user_id: userId,
			match_id: matchId,
			amount: match.per_person_fee,
		});

		await PaymentModel.create({
			order_id: order.id,
			user_id: userId,
			amount: match.per_person_fee,
			channel: "wechat",
		});

		return order;
	},

	async payOrder(orderId, userId) {
		const order = await OrderModel.findById(orderId);
		if (!order) {
			throw new NotFoundError("订单不存在");
		}

		if (order.user_id !== userId) {
			throw new BusinessError("无权操作该订单");
		}

		if (order.status !== 1) {
			throw new BusinessError("订单状态不允许支付");
		}

		if (order.expire_at && new Date(order.expire_at) < new Date()) {
			await OrderModel.updateStatus(orderId, 3, { remark: "超时自动取消" });
			throw new BusinessError("订单已过期");
		}

		// 模拟支付成功（实际接入微信支付）
		await OrderModel.updateStatus(orderId, 2);
		const payment = await PaymentModel.findByOrderId(orderId);
		if (payment) {
			await PaymentModel.updateStatus(payment.id, 2, {
				transactionId: `WX${Date.now()}`,
			});
		}

		await NotificationModel.create({
			user_id: userId,
			type: "payment",
			title: "支付成功",
			content: `球局「${order.match_title}」支付成功，金额 ¥${order.amount}`,
			related_id: orderId,
			related_type: "order",
		});

		return OrderModel.findById(orderId);
	},

	async refundOrder(orderId, userId, reason) {
		const order = await OrderModel.findById(orderId);
		if (!order) {
			throw new NotFoundError("订单不存在");
		}

		if (order.user_id !== userId) {
			throw new BusinessError("无权操作该订单");
		}

		if (order.status !== 2) {
			throw new BusinessError("只有已支付的订单可以退款");
		}

		await OrderModel.updateStatus(orderId, 5, {
			refundAmount: order.amount,
			remark: reason || "用户申请退款",
		});

		await NotificationModel.create({
			user_id: userId,
			type: "payment",
			title: "退款成功",
			content: `球局「${order.match_title}」已退款 ¥${order.amount}`,
			related_id: orderId,
			related_type: "order",
		});

		return OrderModel.findById(orderId);
	},

	async cancelExpiredOrders() {
		const count = await OrderModel.cancelExpired();
		return count;
	},
};

module.exports = OrderService;
