const FeedbackModel = require("../models/Feedback");
const { success, paginate } = require("../utils/response");

const FeedbackController = {
	async create(req, res) {
		const data = {
			user_id: req.user.userId,
			type: req.body.type,
			content: req.body.content,
			images: req.body.images || [],
			contact: req.body.contact || "",
		};
		const feedbackId = await FeedbackModel.create(data);
		res.json(success({ id: feedbackId }, "反馈提交成功"));
	},

	async list(req, res) {
		const { page = 1, pageSize = 20, status, type } = req.query;
		const result = await FeedbackModel.list({
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			status: status !== undefined ? parseInt(status) : undefined,
			type,
		});
		res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
	},

	async detail(req, res) {
		const id = parseInt(req.params.id);
		const feedback = await FeedbackModel.findById(id);
		if (!feedback) {
			return res.status(404).json({ code: 404, message: "反馈不存在", data: null });
		}
		res.json(success(feedback));
	},

	async handle(req, res) {
		const id = parseInt(req.params.id);
		const { status, reply } = req.body;
		const feedback = await FeedbackModel.handle(id, req.user.userId, status, reply);
		res.json(success(feedback, "处理成功"));
	},
};

module.exports = FeedbackController;