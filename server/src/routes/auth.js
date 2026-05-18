const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const { validate } = require('../middlewares/validate');
const Joi = require('joi');

router.post('/login/phone', validate(Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入正确的手机号',
  }),
  password: Joi.string().min(6).max(20).required().messages({
    'string.min': '密码至少6位',
  }),
})), AuthController.loginByPhone);

router.post('/login/wechat', validate(Joi.object({
  code: Joi.string().required(),
  userInfo: Joi.object({
    nickname: Joi.string().optional(),
    avatar: Joi.string().optional(),
    gender: Joi.number().optional(),
    city: Joi.string().optional(),
  }).optional(),
})), AuthController.loginByWechat);

router.post('/register', validate(Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  password: Joi.string().min(6).max(20).required(),
  nickname: Joi.string().max(20).optional(),
})), AuthController.register);

router.post('/refresh', validate(Joi.object({
  refreshToken: Joi.string().required(),
})), AuthController.refreshToken);

module.exports = router;