const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: null,
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(422).json({
      code: 422,
      message: err.details[0]?.message || '参数验证失败',
      data: null,
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      code: 413,
      message: '文件大小超出限制',
      data: null,
    });
  }

  console.error('[错误]', err);

  return res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    code: 404,
    message: `接口 ${req.method} ${req.originalUrl} 不存在`,
    data: null,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};