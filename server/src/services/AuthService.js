const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const { jwt: jwtConfig } = require('../config');
const { BusinessError, UnauthorizedError } = require('../utils/errors');

const AuthService = {
  async loginByPhone(phone, password) {
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new BusinessError('手机号未注册');
    }
    if (user.status === 0) {
      throw new BusinessError('账号已被禁用');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BusinessError('密码错误');
    }
    await UserModel.update(user.id, { last_login_at: new Date() });
    return this.generateTokens(user);
  },

  async loginByWechat(openid, unionid, userInfo) {
    let user = await UserModel.findByOpenid(openid);
    if (!user) {
      user = await UserModel.create({
        openid,
        unionid,
        nickname: userInfo?.nickname || '微信用户',
        avatar: userInfo?.avatar || null,
        gender: userInfo?.gender || 0,
        city: userInfo?.city || null,
      });
    }
    if (user.status === 0) {
      throw new BusinessError('账号已被禁用');
    }
    await UserModel.update(user.id, { last_login_at: new Date() });
    return this.generateTokens(user);
  },

  async registerByPhone(phone, password, nickname) {
    const existing = await UserModel.findByPhone(phone);
    if (existing) {
      throw new BusinessError('手机号已注册');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      phone,
      password: hashedPassword,
      nickname: nickname || `用户${phone.slice(-4)}`,
    });
    return this.generateTokens(user);
  },

  generateTokens(user) {
    const payload = {
      userId: user.id,
      phone: user.phone,
      isAdmin: false,
    };
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      jwtConfig.secret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4) : null,
        gender: user.gender,
        creditScore: user.credit_score,
        city: user.city,
      },
    };
  },

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('无效的刷新令牌');
      }
      const user = await UserModel.findById(decoded.userId);
      if (!user || user.status === 0) {
        throw new UnauthorizedError('用户不存在或已禁用');
      }
      return this.generateTokens(user);
    } catch (err) {
      if (err.isOperational) throw err;
      throw new UnauthorizedError('刷新令牌无效或已过期');
    }
  },
};

module.exports = AuthService;