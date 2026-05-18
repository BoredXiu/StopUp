const router = require('express').Router();
const UserController = require('../controllers/UserController');
const { authRequired, authOptional } = require('../middlewares/auth');

router.get('/profile', authRequired, UserController.getProfile);
router.put('/profile', authRequired, UserController.updateProfile);
router.get('/credit-logs', authRequired, UserController.getCreditLogs);

router.get('/:id', authOptional, UserController.getUserDetail);
router.get('/:id/followers', UserController.getFollowers);
router.get('/:id/following', UserController.getFollowing);
router.get('/:id/partners', UserController.getFrequentPartners);

router.post('/:id/follow', authRequired, UserController.follow);
router.delete('/:id/follow', authRequired, UserController.unfollow);

module.exports = router;