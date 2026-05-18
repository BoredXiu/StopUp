const AuthService = require('../services/AuthService');
const { success } = require('../utils/response');

const AuthController = {
  async loginByPhone(req, res) {
    const { phone, password } = req.body;
    const result = await AuthService.loginByPhone(phone, password);
    res.json(success(result, '登录成功'));
  },

  async loginByWechat(req, res) {
    const { code, userInfo } = req.body;
    // 实际项目中通过code换取openid
    const openid = `mock_openid_${code || Date.now()}`;
    const result = await AuthService.loginByWechat(openid, null, userInfo);
    res.json(success(result, '登录成功'));
  },

  async register(req, res) {
    const { phone, password, nickname } = req.body;
    const result = await AuthService.registerByPhone(phone, password, nickname);
    res.json(success(result, '注册成功'));
  },

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.json(success(result, '令牌刷新成功'));
  },
};

module.exports = AuthController;