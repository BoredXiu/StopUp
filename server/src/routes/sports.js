const router = require('express').Router();
const SportController = require('../controllers/SportController');

router.get('/', SportController.getAll);

module.exports = router;