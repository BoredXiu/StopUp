const router = require("express").Router();
const { authRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const WalletController = require("../controllers/WalletController");
const Joi = require("joi");

// 获取余额
router.get("/balance", authRequired, WalletController.getBalance);

// 创建充值订单（返回预支付参数）
router.post(
	"/recharge",
	authRequired,
	validate({
		body: Joi.object({
			amount: Joi.number().min(0.01).max(5000).required(),
			openid: Joi.string().optional(),
		}),
	}),
	WalletController.recharge,
);

// 确认充值成功
router.post(
	"/recharge/confirm",
	authRequired,
	validate({
		body: Joi.object({
			orderNo: Joi.string().required(),
		}),
	}),
	WalletController.confirmRecharge,
);

// 交易记录
router.get("/transactions", authRequired, WalletController.getTransactions);

module.exports = router;
