const router = require('express').Router();
const UploadController = require('../controllers/UploadController');
const { authRequired } = require('../middlewares/auth');

router.post('/', authRequired, UploadController.uploadSingle, UploadController.handleUpload);

module.exports = router;