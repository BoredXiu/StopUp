const AuthService = require("../services/AuthService");
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
	const colors = ["#409EFF", "#E6A23C", "#67C23A", "#F56C6C", "#909399"];
	const width = 130;
	const height = 50;
	let svg =
		'<svg xmlns="http://www.w3.org/2000/svg" width="' +
		width +
		'" height="' +
		height +
		'">' +
		'<rect width="' +
		width +
		'" height="' +
		height +
		'" fill="#f8f9fa" rx="6" stroke="#e0e0e0" stroke-width="1"/>';
	for (let i = 0; i < 20; i++) {
		const dotX = Math.floor(Math.random() * width);
		const dotY = Math.floor(Math.random() * height);
		const dotR = 0.5 + Math.random() * 1.5;
		svg += '<circle cx="' + dotX + '" cy="' + dotY + '" r="' + dotR + '" fill="#d0d0d0" opacity="' + (0.3 + Math.random() * 0.4) + '"/>';
	}
	for (let i = 0; i < 4; i++) {
		svg +=
			'<line x1="' +
			Math.floor(Math.random() * 100) +
			'" y1="' +
			Math.floor(Math.random() * height) +
			'" ' +
			'x2="' +
			Math.floor(Math.random() * 100 + 30) +
			'" y2="' +
			Math.floor(Math.random() * height) +
			'" stroke="#ccc" stroke-width="0.8" opacity="0.6"/>';
	}
	for (let i = 0; i < code.length; i++) {
		const color = colors[Math.floor(Math.random() * colors.length)];
		const x = 20 + i * 26 + Math.floor(Math.random() * 6);
		const y = 28 + Math.floor(Math.random() * 12);
		const rotate = (Math.random() - 0.5) * 35;
		const fontSize = 22 + Math.floor(Math.random() * 6);
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
			'font-family="Arial,Helvetica,sans-serif" font-size="' +
			fontSize +
			'" fill="' +
			color +
			'" font-weight="bold" ' +
			'stroke="' +
			color +
			'" stroke-width="0.3">' +
			code[i] +
			"</text>";
	}
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
		const { phone, password, captchaId, captchaCode, rememberMe } = req.body;
		if (!AuthController.verifyCaptcha(captchaId, captchaCode)) {
			return res.json({ code: 400, message: "图形验证码错误", data: null });
		}
		const result = await AuthService.loginByPhone(phone, password, !!rememberMe);
		res.json(success(result, "登录成功"));
	},

	async loginByWechat(req, res) {
		const { code, userInfo } = req.body;
		const openid = `mock_openid_${code || Date.now()}`;
		const result = await AuthService.loginByWechat(openid, null, userInfo);
		res.json(success(result, "登录成功"));
	},

	async register(req, res) {
		const { phone, password, nickname, captchaId, captchaCode, rememberMe } = req.body;
		if (!AuthController.verifyCaptcha(captchaId, captchaCode)) {
			return res.json({ code: 400, message: "图形验证码错误", data: null });
		}
		const result = await AuthService.registerByPhone(phone, password, nickname, !!rememberMe);
		res.json(success(result, "注册成功"));
	},

	async refreshToken(req, res) {
		const { refreshToken } = req.body;
		const result = await AuthService.refreshToken(refreshToken);
		res.json(success(result, "令牌刷新成功"));
	},
};

module.exports = AuthController;
