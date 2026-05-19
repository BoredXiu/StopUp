require("dotenv").config();

module.exports = {
	jwt: {
		secret: process.env.JWT_SECRET || "spotup_jwt_secret",
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
		refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
	},
	wechat: {
		appId: process.env.WECHAT_APPID || "",
		secret: process.env.WECHAT_SECRET || "",
		mchId: process.env.WECHAT_MCHID || "",
		apiKey: process.env.WECHAT_API_KEY || "",
	},
	sms: {
		apiKey: process.env.SMS_API_KEY || "",
		apiSecret: process.env.SMS_API_SECRET || "",
		signName: process.env.SMS_SIGN_NAME || "拼个场",
	},
	upload: {
		dir: process.env.UPLOAD_DIR || "uploads",
		tmpDir: process.env.UPLOAD_TMP_DIR || "uploads/tmp",
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
		tmpTtlMs: parseInt(process.env.UPLOAD_TMP_TTL) || 10 * 60 * 1000,
	},
	cors: {
		origin: process.env.CORS_ORIGIN || "http://localhost:5173",
	},
};
