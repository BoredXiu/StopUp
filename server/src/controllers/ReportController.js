const ReportModel = require('../models/Report');
const ReportService = require('../services/ReportService');
const { success, paginate } = require('../utils/response');

const ReportController = {
  async create(req, res) {
    const reportId = await ReportService.createReport(req.body, req.user.userId);
    res.json(success({ id: reportId }, '举报提交成功'));
  },

  async list(req, res) {
    const { page = 1, pageSize = 20, status, type } = req.query;
    const result = await ReportModel.list({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status: status !== undefined ? parseInt(status) : undefined,
      type,
    });
    res.json(paginate(result.list, result.total, parseInt(page), parseInt(pageSize)));
  },

  async detail(req, res) {
    const id = parseInt(req.params.id);
    const report = await ReportModel.findById(id);
    if (!report) {
      return res.status(404).json({ code: 404, message: '举报不存在', data: null });
    }
    res.json(success(report));
  },

  async handle(req, res) {
    const id = parseInt(req.params.id);
    const { status, handleResult } = req.body;
    const report = await ReportService.handleReport(id, req.user.userId, status, handleResult);
    res.json(success(report, '处理成功'));
  },
};

module.exports = ReportController;