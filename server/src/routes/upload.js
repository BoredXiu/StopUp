const router = require("express").Router();
const UploadController = require("../controllers/UploadController");
const { authRequired } = require("../middlewares/auth");

// 上传到正式目录
router.post("/", authRequired, UploadController.uploadSingle, UploadController.handleUpload);

// 上传到临时目录
router.post("/tmp", authRequired, UploadController.uploadTmp, UploadController.handleTmpUpload);

// 确认上传：从 tmp 移动到正式目录
router.post("/confirm", authRequired, UploadController.handleConfirm);

module.exports = router;
