const OrderModel = require("../models/Order");
const PaymentModel = require("../models/Payment");
const WalletModel = require("../models/Wallet");
const MatchModel = require("../models/Match");
const NotificationModel = require("../models/Notification");
const PaymentService = require("./PaymentService");
const db = require("../config/database");
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

	/**
	 * 支付订单：优先使用余额，不足时调起微信支付差额
	 * 返回：
	 *   { paid: true, method: 'balance', order } - 余额完全支付
	 *   { paid: false, needWechatPay: true, balancePaid, wechatAmount, prepayParams } - 需要微信支付差额
	 */
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

		const orderAmount = parseFloat(order.amount);
		const walletBalance = await WalletModel.getBalance(userId);
		const balanceNum = parseFloat(walletBalance);

		// 情况1：余额足够，直接全额扣除
		if (balanceNum >= orderAmount) {
			const payOrderNo = "PAY" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
			const deductResult = await WalletModel.pay(userId, orderAmount, payOrderNo);

			await OrderModel.updateStatus(orderId, 2);
			const payment = await PaymentModel.findByOrderId(orderId);
			if (payment) {
				await PaymentModel.updateStatus(payment.id, 2, {
					transactionId: `BAL${payOrderNo}`,
				});
			}

			await NotificationModel.create({
				user_id: userId,
				type: "payment",
				title: "支付成功",
				content: `球局「${order.match_title || ""}」支付成功，已从余额扣除 ¥${orderAmount}`,
				related_id: orderId,
				related_type: "order",
			});

			return {
				paid: true,
				method: "balance",
				deducted: orderAmount,
				balanceBefore: deductResult.balanceBefore,
				balanceAfter: deductResult.balanceAfter,
				order: await OrderModel.findById(orderId),
			};
		}

		// 情况2：余额不足，先扣余额，剩余微信支付
		const balanceToDeduct = balanceNum;
		const wechatAmount = +(orderAmount - balanceToDeduct).toFixed(2);
		const wechatAmountInFen = Math.round(wechatAmount * 100);

		let balanceDeductResult = null;
		if (balanceToDeduct > 0) {
			const payOrderNo = "PAY" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
			balanceDeductResult = await WalletModel.pay(userId, balanceToDeduct, payOrderNo);
		}

		// 获取用户 openid
		const UserModel = require("../models/User");
		const user = await UserModel.findById(userId);
		const openid = user?.openid || "mock_openid_" + userId;

		// 创建微信支付订单
		const paymentOrderNo = "PY" + Date.now() + Math.random().toString(36).slice(2, 4).toUpperCase();

		// 记录支付临时信息（用于回调确认）
		await db.query(
			`CREATE TABLE IF NOT EXISTS payment_tmp (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(64) NOT NULL,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_order_no (order_no)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
		);
		await db.query("INSERT INTO payment_tmp (order_no, order_id, user_id, amount) VALUES (?, ?, ?, ?)", [
			paymentOrderNo,
			orderId,
			userId,
			wechatAmount,
		]);

		const payResult = await PaymentService.createOrderPayment(userId, openid, orderId, wechatAmount, paymentOrderNo);

		return {
			paid: false,
			needWechatPay: true,
			balancePaid: balanceToDeduct,
			balanceBefore: balanceDeductResult ? balanceDeductResult.balanceBefore : balanceNum,
			balanceAfter: balanceDeductResult ? balanceDeductResult.balanceAfter : balanceNum,
			wechatAmount,
			payOrderNo: paymentOrderNo,
			prepayParams: payResult.prepayParams,
		};
	},

	/**
	 * 确认微信支付成功后完成订单
	 */
	async confirmOrderWechatPay(orderId, userId, payOrderNo) {
		const [tmpRows] = await db.query("SELECT * FROM payment_tmp WHERE order_no = ? AND user_id = ?", [
			payOrderNo,
			userId,
		]);
		if (tmpRows.length === 0) {
			throw new BusinessError("支付记录不存在");
		}

		await OrderModel.updateStatus(orderId, 2);
		const payment = await PaymentModel.findByOrderId(orderId);
		if (payment) {
			await PaymentModel.updateStatus(payment.id, 2, {
				transactionId: `WX${payOrderNo}`,
			});
		}

		await db.query("DELETE FROM payment_tmp WHERE order_no = ?", [payOrderNo]);

		const order = await OrderModel.findById(orderId);
		await NotificationModel.create({
			user_id: userId,
			type: "payment",
			title: "支付成功",
			content: `球局「${order.match_title || ""}」微信支付成功`,
			related_id: orderId,
			related_type: "order",
		});

		return order;
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