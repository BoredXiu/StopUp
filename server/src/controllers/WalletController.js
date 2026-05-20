const WalletModel = require("../models/Wallet");
const PaymentService = require("../services/PaymentService");
const { success, paginate } = require("../utils/response");
const { BusinessError } = require("../utils/errors");

const WalletController = {
	async getBalance(req, res) {
		const balance = await WalletModel.getBalance(req.user.userId);
		res.json(success({ balance }));
	},

	async recharge(req, res) {
		const { amount, openid } = req.body;
		const amountNum = parseFloat(amount);

		if (!amount || isNaN(amountNum) || amountNum <= 0) {
			throw new BusinessError("请输入有效的充值金额");
		}
		if (amountNum > 5000) {
			throw new BusinessError("单次充值金额不能超过5000元");
		}

		// 获取用户的 openid（从数据库查找）
		let userOpenid = openid;
		if (!userOpenid) {
			const UserModel = require("../models/User");
			const user = await UserModel.findById(req.user.userId);
			userOpenid = user?.openid || "mock_openid_" + req.user.userId;
		}

		const result = await PaymentService.createRechargeOrder(req.user.userId, userOpenid, amountNum);
		res.json(success(result, "下单成功"));
	},

	async confirmRecharge(req, res) {
		const { orderNo } = req.body;
		if (!orderNo) {
			throw new BusinessError("缺少订单号");
		}
		const result = await PaymentService.confirmRecharge(req.user.userId, orderNo);
		res.json(success(result, "充值成功"));
	},

	async getTransactions(req, res) {
		const { page = 1, pageSize = 20 } = req.query;
		const result = await WalletModel.getTransactions(req.user.userId, {
			page: parseInt(page),
			pageSize: parseInt(pageSize),
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},
};

module.exports = WalletController;
