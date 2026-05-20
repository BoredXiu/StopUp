const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const { authRequired } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const Joi = require('joi');

router.get('/', authRequired, OrderController.myOrders);
router.get('/:id', authRequired, OrderController.detail);

router.post('/', authRequired, validate(Joi.object({
  matchId: Joi.number().integer().required(),
})), OrderController.create);

// 支付订单（余额优先 + 微信支付差额）
router.post('/:id/pay', authRequired, OrderController.pay);

// 确认微信支付完成
router.post('/:id/pay/confirm', authRequired, OrderController.confirmWechatPay);

router.post('/:id/refund', authRequired, validate(Joi.object({
  reason: Joi.string().max(200).optional(),
})), OrderController.refund);

module.exports = router;