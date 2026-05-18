const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('请先登录');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('登录已过期，请重新登录');
    }
    throw new UnauthorizedError('无效的登录凭证');
  }
}

function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.user = decoded;
    } catch (err) {
      // 忽略无效token
    }
  }
  next();
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!req.user.isAdmin) {
      throw new ForbiddenError('需要管理员权限');
    }
    next();
  });
}

function superAdminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenError('需要超级管理员权限');
    }
    next();
  });
}

module.exports = {
  authRequired,
  authOptional,
  adminRequired,
  superAdminRequired,
};