const router = require('express').Router();
const ReportController = require('../controllers/ReportController');
const { authRequired } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const Joi = require('joi');

router.post('/', authRequired, validate(Joi.object({
  reported_user_id: Joi.number().integer().optional().allow(null),
  match_id: Joi.number().integer().optional().allow(null),
  type: Joi.string().valid('no_show', 'violation', 'abuse', 'other').required(),
  reason: Joi.string().min(10).max(500).required(),
  images: Joi.array().items(Joi.string()).optional(),
})), ReportController.create);

module.exports = router;