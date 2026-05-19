const AuthService = require("../services/AuthService");
const SmsService = require("../services/SmsService");
const { success } = require("../utils/response");

const captchaStore = new Map();

function generateCode() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	var code = "";
	for (var i = 0; i < 4; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

function generateCaptchaSvg(code) {
	var colors = ["#409EFF", "#E6A23C", "#67C23A", "#F56C6C", "#909399"];
	var color = colors[Math.floor(Math.random() * colors.length)];
	var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44">' + '<rect width="120" height="44" fill="#f5f5f5" rx="4"/>';
	for (var i = 0; i < 4; i++) {
		var x = 18 + i * 24;
		var y = 20 + Math.floor(Math.random() * 10);
		var rotate = (Math.random() - 0.5) * 30;
		svg +=
			'<text x="' +
			x +
			'" y="' +
			y +
			'" transform="rotate(' +
			rotate +
			"," +
			x +
			"," +
			y +
			')" ' +
			'font-family="Arial" font-size="20" fill="' +
			color +
			'" font-weight="bold">' +
			code[i] +
			"</text>";
	}
	for (var j = 0; j < 3; j++) {
		svg +=
			'<line x1="' +
			Math.floor(Math.random() * 100) +
			'" y1="' +
			Math.floor(Math.random() * 40) +
			'" ' +
			'x2="' +
			Math.floor(Math.random() * 100) +
			'" y2="' +
			Math.floor(Math.random() * 40) +
			'" stroke="#ddd" stroke-width="1"/>';
	}
	svg += '<circle cx="' + Math.floor(Math.random() * 100) + '" cy="' + Math.floor(Math.random() * 40) + '" r="' + (1 + Math.random() * 2) + '" fill="#ddd"/>';
	svg += "</svg>";
	return svg;
}

function clearExpiredCaptchas() {
	var now = Date.now();
	captchaStore.forEach(function (v, k) {
		if (now > v.expireAt) captchaStore.delete(k);
	});
}

const AuthController = {
	async getCaptcha(req, res) {
		clearExpiredCaptchas();
		var code = generateCode();
		var captchaId = "cap_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
		captchaStore.set(captchaId, { code: code.toLowerCase(), expireAt: Date.now() + 300000 });
		var svg = generateCaptchaSvg(code);
		var base64 = Buffer.from(svg).toString("base64");
		res.json(success({ captchaId: captchaId, image: "data:image/svg+xml;base64," + base64 }));
	},

	verifyCaptcha(captchaId, input) {
		if (!captchaId || !input) return false;
		clearExpiredCaptchas();
		var item = captchaStore.get(captchaId);
		if (!item) return false;
		captchaStore.delete(captchaId);
		return item.code === input.toLowerCase();
	},

	async loginByPhone(req, res) {
		const { phone, password, captchaId, captchaCode } = req.body;
		if (captchaId && captchaCode) {
			if (!AuthController.verifyCaptcha(captchaId, captchaCode)) {
				return res.json({ code: 400, message: "图形验证码错误", data: null });
			}
		}
		const result = await AuthService.loginByPhone(phone, password);
		res.json(success(result, "登录成功"));
	},

	async loginByWechat(req, res) {
		const { code, userInfo } = req.body;
		// 实际项目中通过code换取openid
		const openid = `mock_openid_${code || Date.now()}`;
		const result = await AuthService.loginByWechat(openid, null, userInfo);
		res.json(success(result, "登录成功"));
	},

	async sendSms(req, res, next) {
		try {
			const { phone, captchaId, captchaCode } = req.body;
			await SmsService.sendCode(phone, captchaId, captchaCode, captchaStore);
			res.json(success(null, "短信验证码已发送"));
		} catch (err) {
			if (err.statusCode) {
				return res.json({ code: err.statusCode, message: err.message, data: null });
			}
			next(err);
		}
	},

	async register(req, res) {
		const { phone, password, nickname, smsCode } = req.body;
		if (smsCode) {
			if (!SmsService.verifyCode(phone, smsCode)) {
				return res.json({ code: 400, message: "短信验证码错误或已过期", data: null });
			}
		}
		const result = await AuthService.registerByPhone(phone, password, nickname);
		res.json(success(result, "注册成功"));
	},

	async refreshToken(req, res) {
		const { refreshToken } = req.body;
		const result = await AuthService.refreshToken(refreshToken);
		res.json(success(result, "令牌刷新成功"));
	},
};

module.exports = AuthController;
