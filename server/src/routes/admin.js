const router = require("express").Router();
const AdminController = require("../controllers/AdminController");
const ReportController = require("../controllers/ReportController");
const FeedbackController = require("../controllers/FeedbackController");
const { adminRequired } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const Joi = require("joi");

router.post(
	"/login",
	validate(
		Joi.object({
			username: Joi.string().required(),
			password: Joi.string().required(),
		}),
	),
	AdminController.login,
);

router.get("/dashboard", adminRequired, AdminController.dashboard);

router.get("/users", adminRequired, AdminController.listUsers);
router.put("/users/:id/status", adminRequired, AdminController.updateUserStatus);

router.get("/matches", adminRequired, AdminController.listMatches);
router.put("/matches/:id/status", adminRequired, AdminController.updateMatchStatus);

router.get("/venues", adminRequired, AdminController.listVenues);
router.post("/venues", adminRequired, AdminController.createVenue);
router.put("/venues/:id", adminRequired, AdminController.updateVenue);

router.get("/orders", adminRequired, AdminController.listOrders);

router.get("/reports", adminRequired, AdminController.listReports);
router.get("/reports/:id", adminRequired, ReportController.detail);
router.put(
	"/reports/:id/handle",
	adminRequired,
	validate(
		Joi.object({
			status: Joi.number().integer().valid(2, 3).required(),
			handleResult: Joi.string().max(300).optional(),
		}),
	),
	ReportController.handle,
);

router.get("/feedbacks", adminRequired, FeedbackController.list);
router.get("/feedbacks/:id", adminRequired, FeedbackController.detail);
router.put(
	"/feedbacks/:id/handle",
	adminRequired,
	validate(
		Joi.object({
			status: Joi.number().integer().valid(2, 3).required(),
			reply: Joi.string().max(500).optional(),
		}),
	),
	FeedbackController.handle,
);

module.exports = router;
