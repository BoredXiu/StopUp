const fs = require("fs");
const path = require("path");
const WxPay = require("wechatpay-node-v3");
const config = require("../config");
const db = require("../config/database");
const { BusinessError } = require("../utils/errors");

// 微信支付实例（懒加载）
let payInstance = null;
function getPayInstance() {
	if (payInstance) return payInstance;
	try {
		const certPath = path.join(__dirname, "..", "..", "data", "apiclient_cert.pem");
		const keyPath = path.join(__dirname, "..", "..", "data", "apiclient_key.pem");
		if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
			console.warn("[支付] 微信支付证书文件不存在，使用模拟模式");
			return null;
		}
		payInstance = new WxPay({
			appid: config.wechat.appId,
			mchid: config.wechat.mchId,
			publicKey: fs.readFileSync(certPath),
			privateKey: fs.readFileSync(keyPath),
		});
	} catch (err) {
		console.warn("[支付] 初始化微信支付失败:", err.message, "使用模拟模式");
		payInstance = null;
	}
	return payInstance;
}

function genOrderNo() {
	return "RC" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function genPaymentNo() {
	return "PY" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

const PaymentService = {
	/**
	 * 创建充值订单并返回预支付参数
	 */
	async createRechargeOrder(userId, openid, amount) {
		const amountNum = parseFloat(amount);
		if (!amountNum || amountNum <= 0 || amountNum > 5000) {
			throw new BusinessError("充值金额无效");
		}

		const orderNo = genOrderNo();
		const amountInFen = Math.round(amountNum * 100);

		// 插入待支付交易记录
		await db.query(
			`INSERT INTO wallet_transactions
       (user_id, order_no, type, amount, balance_before, balance_after, payment_method, status, created_at)
       VALUES (?, ?, 'recharge', ?, 0, 0, 'wechat', 0, NOW())`,
			[userId, orderNo, amountNum],
		);

		const pay = getPayInstance();

		if (pay) {
			try {
				const params = {
					description: "余额充值",
					out_trade_no: orderNo,
					notify_url: config.wechat.notifyUrl || `${config.server.baseUrl}/api/payments/wechat/callback`,
					amount: { total: amountInFen },
					payer: { openid },
				};
				const result = await pay.transactions_jsapi(params);
				return { orderNo, prepayParams: result };
			} catch (err) {
				await db.query("DELETE FROM wallet_transactions WHERE order_no = ?", [orderNo]);
				throw new BusinessError("支付下单失败: " + (err.message || "未知错误"));
			}
		}

		// 开发模式：返回模拟预支付参数（不做真实支付，直接可确认）
		return {
			orderNo,
			prepayParams: {
				timeStamp: String(Math.floor(Date.now() / 1000)),
				nonceStr: Math.random().toString(36).slice(2, 12),
				package: `prepay_id=dev_${orderNo}`,
				signType: "MD5",
				paySign: "DEV_MODE",
				_devMode: true,
			},
		};
	},

	/**
	 * 创建订单支付（用于场局支付剩余金额）
	 */
	async createOrderPayment(userId, openid, orderId, amount, orderNo) {
		const amountNum = parseFloat(amount);
		const amountInFen = Math.round(amountNum * 100);

		const pay = getPayInstance();

		if (pay) {
			try {
				const params = {
					description: "场局费用",
					out_trade_no: orderNo,
					notify_url: config.wechat.notifyUrl || `${config.server.baseUrl}/api/payments/wechat/callback`,
					amount: { total: amountInFen },
					payer: { openid },
					attach: JSON.stringify({ type: "order_pay", orderId, userId }),
				};
				const result = await pay.transactions_jsapi(params);
				return { orderNo, prepayParams: result };
			} catch (err) {
				throw new BusinessError("支付下单失败: " + (err.message || "未知错误"));
			}
		}

		// 开发模式
		return {
			orderNo,
			prepayParams: {
				timeStamp: String(Math.floor(Date.now() / 1000)),
				nonceStr: Math.random().toString(36).slice(2, 12),
				package: `prepay_id=dev_${orderNo}`,
				signType: "MD5",
				paySign: "DEV_MODE",
				_devMode: true,
			},
		};
	},

	/**
	 * 确认充值成功
	 */
	async confirmRecharge(userId, orderNo) {
		const [rows] = await db.query("SELECT * FROM wallet_transactions WHERE order_no = ? AND user_id = ? AND status = 0", [orderNo, userId]);
		if (rows.length === 0) {
			throw new BusinessError("订单不存在或已处理");
		}

		const tx = rows[0];
		const amountNum = parseFloat(tx.amount);

		const [walletRows] = await db.query("SELECT balance FROM wallets WHERE user_id = ?", [userId]);
		const balanceBefore = walletRows.length > 0 ? parseFloat(walletRows[0].balance) : 0;
		const balanceAfter = +(balanceBefore + amountNum).toFixed(2);

		if (walletRows.length > 0) {
			await db.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [balanceAfter, userId]);
		} else {
			await db.query("INSERT INTO wallets (user_id, balance) VALUES (?, ?)", [userId, balanceAfter]);
		}

		await db.query("UPDATE wallet_transactions SET status = 1, balance_before = ?, balance_after = ? WHERE order_no = ?", [
			balanceBefore,
			balanceAfter,
			orderNo,
		]);

		return { orderNo, amount: amountNum, balanceBefore, balanceAfter };
	},

	/**
	 * 确认订单微信支付成功（回调用）
	 */
	async confirmOrderPayment(orderNo, transactionId) {
		const OrderModel = require("../models/Order");
		const PaymentModel = require("../models/Payment");
		const NotificationModel = require("../models/Notification");

		// 查临时关联表
		const [tmpRows] = await db.query("SELECT * FROM payment_tmp WHERE order_no = ?", [orderNo]);

		if (tmpRows.length === 0) {
			console.error(`[支付回调] 找不到临时支付记录: ${orderNo}`);
			return false;
		}

		const tmp = tmpRows[0];

		// 查找订单的原始支付记录
		const payment = await PaymentModel.findByOrderId(tmp.order_id);
		if (payment && payment.status === 1) {
			await PaymentModel.updateStatus(payment.id, 2, { transactionId: transactionId || `WX${orderNo}` });
		}

		// 更新订单状态为已支付
		await OrderModel.updateStatus(tmp.order_id, 2);

		await NotificationModel.create({
			user_id: tmp.user_id,
			type: "payment",
			title: "支付成功",
			content: `微信支付成功，金额 ¥${tmp.amount}`,
			related_id: tmp.order_id,
			related_type: "order",
		});

		await db.query("DELETE FROM payment_tmp WHERE order_no = ?", [orderNo]);

		return true;
	},

	/**
	 * 处理微信支付回调
	 */
	async handleCallback(body) {
		const pay = getPayInstance();
		if (!pay) {
			console.log("[支付回调] 开发模式，跳过验签");
			return true;
		}

		const isValid = pay.verifySign(body);
		if (!isValid) {
			console.error("[支付回调] 签名验证失败");
			return false;
		}

		const { out_trade_no, trade_state, transaction_id } = body;
		if (trade_state === "SUCCESS" && out_trade_no) {
			// 判断是充值还是订单支付
			if (out_trade_no.startsWith("RC")) {
				// 充值订单
				const [rows] = await db.query("SELECT user_id FROM wallet_transactions WHERE order_no = ? AND status = 0", [out_trade_no]);
				if (rows.length > 0) {
					await this.confirmRecharge(rows[0].user_id, out_trade_no);
					console.log(`[支付回调] 充值订单 ${out_trade_no} 确认成功`);
				}
			} else if (out_trade_no.startsWith("PY")) {
				// 支付订单
				await this.confirmOrderPayment(out_trade_no, transaction_id);
				console.log(`[支付回调] 支付订单 ${out_trade_no} 确认成功`);
			}
		}

		return true;
	},
};

module.exports = PaymentService;
