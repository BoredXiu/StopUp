const ReportModel = require('../models/Report');
const UserModel = require('../models/User');
const CreditLogModel = require('../models/CreditLog');
const NotificationModel = require('../models/Notification');
const { BusinessError, NotFoundError } = require('../utils/errors');

const ReportService = {
  async createReport(data, reporterId) {
    if (data.reported_user_id === reporterId) {
      throw new BusinessError('不能举报自己');
    }
    return ReportModel.create({ ...data, reporter_id: reporterId });
  },

  async handleReport(reportId, handlerId, status, handleResult) {
    const report = await ReportModel.findById(reportId);
    if (!report) {
      throw new NotFoundError('举报不存在');
    }

    if (report.status !== 1) {
      throw new BusinessError('该举报已处理');
    }

    await ReportModel.handle(reportId, handlerId, status, handleResult);

    if (status === 2 && report.reported_user_id) {
      if (report.type === 'no_show') {
        const user = await UserModel.findById(report.reported_user_id);
        const newScore = Math.max(0, user.credit_score - 20);
        await UserModel.updateCreditScore(report.reported_user_id, -20);
        await CreditLogModel.create({
          user_id: report.reported_user_id,
          change_amount: -20,
          balance: newScore,
          reason: 'report_approved',
          related_id: reportId,
          related_type: 'report',
        });
      }

      await NotificationModel.create({
        user_id: report.reported_user_id,
        type: 'system',
        title: '举报处理通知',
        content: `您收到一条举报处理结果：${handleResult || '举报成立'}`,
        related_id: reportId,
        related_type: 'report',
      });
    }

    return ReportModel.findById(reportId);
  },
};

module.exports = ReportService;