const router = require('express').Router();
const NotificationController = require('../controllers/NotificationController');
const { authRequired } = require('../middlewares/auth');

router.get('/', authRequired, NotificationController.list);
router.get('/unread-count', authRequired, NotificationController.unreadCount);
router.put('/:id/read', authRequired, NotificationController.markRead);
router.put('/read-all', authRequired, NotificationController.markAllRead);

module.exports = router;