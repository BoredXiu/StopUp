const router = require("express").Router();
const FeedbackController = require("../controllers/FeedbackController");
const { authRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const Joi = require("joi");

router.post(
	"/",
	authRequired,
	validate(
		Joi.object({
			type: Joi.string().valid("bug", "feature", "experience", "ui", "other").required().messages({
				"any.only": "请选择反馈类型",
			}),
			content: Joi.string().min(5).max(1000).required().messages({
				"string.min": "反馈内容至少5个字",
				"string.max": "反馈内容不能超过1000字",
			}),
			images: Joi.array().items(Joi.string()).optional(),
			contact: Joi.string().max(50).optional(),
		}),
	),
	FeedbackController.create,
);

module.exports = router;