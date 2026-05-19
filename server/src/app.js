require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const config = require("./config");

const app = express();

// 安全中间件
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.cors.origin, credentials: true }));

// 请求解析
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 日志
app.use(morgan("dev"));

// 静态文件
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// 全局限流
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 500,
	message: { code: 429, message: "请求过于频繁，请稍后再试", data: null },
});
app.use("/api", globalLimiter);

// 路由
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/venues", require("./routes/venues"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/feedbacks", require("./routes/feedbacks"));
app.use("/api/sports", require("./routes/sports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/regions", require("./routes/regions"));

// 健康检查
app.get("/api/health", (req, res) => {
	res.json({ code: 200, message: "ok", data: { uptime: process.uptime() } });
});

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`[服务] 拼个场 API 已启动: http://localhost:${PORT}`);
});

module.exports = app;
