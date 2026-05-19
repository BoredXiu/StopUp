const crypto = require("crypto");
const { sms: smsConfig } = require("../config");

const smsStore = new Map();

function generateSmsCode() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

function clearExpiredSms() {
	const now = Date.now();
	smsStore.forEach((v, k) => {
		if (now > v.expireAt) smsStore.delete(k);
	});
}

async function sendYunmaSms(phone, code) {
	if (!smsConfig.apiKey || !smsConfig.apiSecret) {
		console.log(`\n===== Yunma SMS (Mock) =====`);
		console.log(`To: ${phone}`);
		console.log(`Code: ${code}`);
		console.log(`Sign: ${smsConfig.signName}`);
		console.log(`===========================\n`);
		return true;
	}

	// TODO: Replace with actual Yunma API call
	// const params = {
	//   apikey: smsConfig.apiKey,
	//   mobile: phone,
	//   text: `【${smsConfig.signName}】您的验证码是${code}，5分钟内有效，请勿泄露。`,
	// };
	// const sign = crypto.createHmac('sha256', smsConfig.apiSecret)
	//   .update(Object.values(params).sort().join(''))
	//   .digest('hex');
	// const res = await fetch('https://sms.yunpian.com/v2/sms/single_send.json', {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	//   body: new URLSearchParams({ ...params, sign }),
	// });
	// const json = await res.json();
	// if (json.code !== 0) throw new Error(json.msg || '短信发送失败');
	// return true;

	console.log(`\n===== Yunma SMS (Mock) =====`);
	console.log(`To: ${phone}`);
	console.log(`Code: ${code}`);
	console.log(`Sign: ${smsConfig.signName}`);
	console.log(`===========================\n`);
	return true;
}

const SmsService = {
	async sendCode(phone, captchaId, captchaCode, captchaStore) {
		if (!phone) {
			throw Object.assign(new Error("手机号不能为空"), { statusCode: 400 });
		}

		const now = Date.now();
		clearExpiredSms();

		if (captchaId && captchaCode && captchaStore) {
			const captchaItem = captchaStore.get(captchaId);
			if (!captchaItem || now > captchaItem.expireAt) {
				throw Object.assign(new Error("图形验证码已过期"), { statusCode: 400 });
			}
			if (captchaItem.code !== captchaCode.toLowerCase()) {
				throw Object.assign(new Error("图形验证码错误"), { statusCode: 400 });
			}
			captchaStore.delete(captchaId);
		}

		const existing = smsStore.get(phone);
		if (existing && now < existing.resendAt) {
			throw Object.assign(new Error("发送过于频繁，请稍后再试"), { statusCode: 429 });
		}

		const code = generateSmsCode();
		const expireAt = now + 5 * 60 * 1000;
		const resendAt = now + 60 * 1000;

		smsStore.set(phone, { code, expireAt, resendAt });

		await sendYunmaSms(phone, code);

		return true;
	},

	verifyCode(phone, code) {
		if (!phone || !code) return false;
		clearExpiredSms();
		const item = smsStore.get(phone);
		if (!item) return false;
		if (item.code !== String(code)) return false;
		smsStore.delete(phone);
		return true;
	},
};

module.exports = SmsService;
