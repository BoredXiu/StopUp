const router = require('express').Router();

// 微信支付回调（不需要鉴权）
router.post('/wechat/callback', (req, res) => {
  // 实际项目中处理微信支付回调
  console.log('[支付回调]', req.body);
  res.json({ code: 'SUCCESS', message: 'OK' });
});

module.exports = router;