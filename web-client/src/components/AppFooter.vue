<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">🏀 拼个场</span>
        <p class="footer-desc">年轻人的运动拼场与搭子组局平台</p>
      </div>
      <div class="footer-links">
        <div class="link-group">
          <h4>关于我们</h4>
          <a href="#">平台介绍</a>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="link-group">
          <h4>帮助中心</h4>
          <a href="#">常见问题</a>
          <a href="#">信用规则</a>
          <a href="#">举报指南</a>
        </div>
        <div class="link-group">
          <h4>联系我们</h4>
          <a href="#">意见反馈</a>
          <a href="#">商务合作</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 拼个场 SpotUp. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #fff;
  border-top: 1px solid var(--border-color);
  margin-top: 40px;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  padding: 40px 20px;
  gap: 60px;
}
.footer-brand {
  max-width: 240px;
}
.footer-logo {
  font-size: 20px;
  font-weight: 700;
}
.footer-desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.footer-links {
  display: flex;
  gap: 60px;
}
.link-group h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}
.link-group a {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  transition: color 0.2s;
}
.link-group a:hover {
  color: var(--primary-color);
}
.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding: 16px 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>