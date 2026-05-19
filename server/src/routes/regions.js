const router = require("express").Router();
const RegionController = require("../controllers/RegionController");

router.get("/", RegionController.getAll);
router.get("/full", RegionController.getFull);

module.exports = router;