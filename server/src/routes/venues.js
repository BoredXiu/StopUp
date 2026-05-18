const router = require('express').Router();
const VenueController = require('../controllers/VenueController');

router.get('/', VenueController.list);
router.get('/hot', VenueController.getHot);
router.get('/:id', VenueController.detail);

module.exports = router;