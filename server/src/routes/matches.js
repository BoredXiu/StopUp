const router = require('express').Router();
const MatchController = require('../controllers/MatchController');
const { authRequired, authOptional } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const Joi = require('joi');

const matchSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  sport_id: Joi.number().integer().min(1).required(),
  venue_id: Joi.number().integer().optional().allow(null),
  match_date: Joi.date().iso().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  max_players: Joi.number().integer().min(2).max(100).required(),
  min_players: Joi.number().integer().min(2).optional(),
  fee_type: Joi.number().integer().valid(1, 2, 3).optional(),
  total_fee: Joi.number().min(0).optional(),
  per_person_fee: Joi.number().min(0).optional(),
  level_required: Joi.number().integer().min(0).max(5).optional(),
  gender_required: Joi.number().integer().valid(0, 1, 2).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  cover_image: Joi.string().optional().allow(''),
});

router.get('/', authOptional, MatchController.list);
router.get('/my', authRequired, MatchController.myMatches);
router.get('/favorites', authRequired, MatchController.myFavorites);
router.get('/:id', authOptional, MatchController.detail);
router.get('/:id/members', MatchController.getMembers);

router.post('/', authRequired, validate(matchSchema), MatchController.create);
router.put('/:id', authRequired, MatchController.update);
router.post('/:id/join', authRequired, MatchController.join);
router.post('/:id/leave', authRequired, MatchController.leave);
router.post('/:id/cancel', authRequired, MatchController.cancel);
router.post('/:id/complete', authRequired, MatchController.complete);
router.post('/:id/favorite', authRequired, MatchController.favorite);
router.delete('/:id/favorite', authRequired, MatchController.unfavorite);

module.exports = router;