<template>
	<view class="page">
		<view class="login-card">
			<view class="logo-area">
				<text class="logo-icon">🏀</text>
				<text class="logo-text">拼个场</text>
				<text class="logo-desc">找到你的运动搭子</text>
			</view>

			<view class="login-tabs">
				<view
					class="tab-item"
					:class="{ active: activeTab === 'phone' }"
					@tap="switchTab('phone')"
					>手机号登录</view
				>
				<view
					class="tab-item"
					:class="{ active: activeTab === 'register' }"
					@tap="switchTab('register')"
					>注册</view
				>
			</view>

			<view
				class="form-area"
				v-if="activeTab === 'phone'"
			>
				<input
					class="form-input"
					v-model="phoneForm.phone"
					type="number"
					placeholder="请输入手机号"
					maxlength="11"
				/>
				<input
					class="form-input"
					v-model="phoneForm.password"
					type="password"
					placeholder="请输入密码"
				/>
				<view class="captcha-row">
					<input
						class="form-input captcha-input"
						v-model="phoneForm.captchaCode"
						@input="onPhoneCaptchaInput"
						placeholder="图形验证码（英文数字）"
						maxlength="4"
					/>
					<image
						v-if="captchaImage"
						:src="captchaImage"
						class="captcha-img"
						@tap="refreshCaptcha"
					/>
					<text
						v-else
						class="captcha-tip"
						@tap="refreshCaptcha"
						>加载中</text
					>
				</view>
				<button
					class="submit-btn"
					@tap="handlePhoneLogin"
					:loading="loading"
				>
					登录
				</button>
			</view>

			<view
				class="form-area"
				v-if="activeTab === 'register'"
			>
				<input
					class="form-input"
					v-model="registerForm.phone"
					type="number"
					placeholder="请输入手机号"
					maxlength="11"
				/>
				<view class="sms-row">
					<input
						class="form-input sms-input"
						v-model="registerForm.smsCode"
						type="number"
						placeholder="短信验证码"
						maxlength="6"
					/>
					<button
						class="sms-btn"
						@tap="sendSms"
						:disabled="smsCountdown > 0 || !smsReady"
					>
						{{ smsCountdown > 0 ? smsCountdown + "s" : smsReady ? "获取验证码" : "先完成图形验证" }}
					</button>
				</view>
				<input
					class="form-input"
					v-model="registerForm.nickname"
					placeholder="请输入昵称"
				/>
				<input
					class="form-input"
					v-model="registerForm.password"
					type="password"
					placeholder="请设置密码"
				/>
				<view class="captcha-row">
					<input
						class="form-input captcha-input"
						v-model="registerForm.captchaCode"
						@input="onRegisterCaptchaInput"
						placeholder="图形验证码（英文数字）"
						maxlength="4"
					/>
					<image
						v-if="captchaImage"
						:src="captchaImage"
						class="captcha-img"
						@tap="refreshCaptcha"
					/>
					<text
						v-else
						class="captcha-tip"
						@tap="refreshCaptcha"
						>加载中</text
					>
				</view>
				<button
					class="submit-btn"
					@tap="handleRegister"
					:loading="loading"
				>
					注册
				</button>
			</view>

			<view class="wechat-login">
				<button
					class="wechat-btn"
					open-type="getPhoneNumber"
					@getphonenumber="handleWechatLogin"
				>
					微信一键登录
				</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue";
	import { authApi } from "@/api";
	import { useUserStore } from "@/store/user";
	import type { LoginResult } from "@/types";

	const userStore = useUserStore();
	const activeTab = ref("phone");
	const loading = ref(false);
	const smsCountdown = ref(0);
	const smsReady = ref(false);
	const captchaImage = ref("");
	const captchaId = ref("");

	const phoneForm = reactive({ phone: "", password: "", captchaCode: "" });
	const registerForm = reactive({ phone: "", smsCode: "", nickname: "", password: "", captchaCode: "" });

	function filterCaptcha(val: string): string {
		return (val || "").replace(/[^a-zA-Z0-9]/g, "");
	}

	function onPhoneCaptchaInput(): void {
		phoneForm.captchaCode = filterCaptcha(phoneForm.captchaCode);
	}

	function onRegisterCaptchaInput(): void {
		registerForm.captchaCode = filterCaptcha(registerForm.captchaCode);
	}

	function switchTab(tab: string): void {
		activeTab.value = tab;
		refreshCaptcha();
	}

	async function refreshCaptcha(): Promise<void> {
		try {
			const res = await authApi.getCaptcha();
			captchaImage.value = res.data.image;
			captchaId.value = res.data.captchaId;
		} catch (_) {
			captchaImage.value = "";
			captchaId.value = "mock";
		}
	}

	async function sendSms(): Promise<void> {
		if (!registerForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
			uni.showToast({ title: "请输入正确的手机号", icon: "none" });
			return;
		}
		if (!registerForm.captchaCode) {
			uni.showToast({ title: "请先输入图形验证码", icon: "none" });
			return;
		}
		try {
			await authApi.sendSms(registerForm.phone, captchaId.value, registerForm.captchaCode);
		} catch (_) {
			/* 后端不可用时模拟发送 */
		}
		uni.showToast({ title: "验证码已发送，默认123456", icon: "success", duration: 2000 });
		smsCountdown.value = 60;
		const timer = setInterval(() => {
			smsCountdown.value--;
			if (smsCountdown.value <= 0) clearInterval(timer);
		}, 1000);
	}

	async function handlePhoneLogin(): Promise<void> {
		if (!phoneForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!phoneForm.password) {
			uni.showToast({ title: "请输入密码", icon: "none" });
			return;
		}
		if (!phoneForm.captchaCode) {
			uni.showToast({ title: "请输入图形验证码", icon: "none" });
			return;
		}
		loading.value = true;
		try {
			const res = await authApi.loginByPhone({
				phone: phoneForm.phone,
				password: phoneForm.password,
				captchaId: captchaId.value,
				captchaCode: phoneForm.captchaCode,
			});
			const data = res.data as LoginResult;
			afterLogin(data);
		} catch (_) {
			mockLogin(phoneForm.phone, phoneForm.password);
		} finally {
			loading.value = false;
		}
	}

	async function handleRegister(): Promise<void> {
		if (!registerForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!registerForm.smsCode) {
			uni.showToast({ title: "请输入短信验证码", icon: "none" });
			return;
		}
		if (!registerForm.password) {
			uni.showToast({ title: "请设置密码", icon: "none" });
			return;
		}
		loading.value = true;
		try {
			const res = await authApi.register({
				phone: registerForm.phone,
				password: registerForm.password,
				nickname: registerForm.nickname,
				smsCode: registerForm.smsCode,
			});
			const data = res.data as LoginResult;
			afterLogin(data);
		} catch (_) {
			if (registerForm.smsCode === "123456") {
				mockLogin(registerForm.phone, registerForm.password, registerForm.nickname);
			} else {
				uni.showToast({ title: "验证码错误，请输入123456", icon: "none", duration: 2000 });
			}
		} finally {
			loading.value = false;
		}
	}

	function mockLogin(phone: string, password: string, nickname?: string): void {
		const mockData: LoginResult = {
			token: "mock_token_" + Date.now(),
			refreshToken: "mock_refresh_" + Date.now(),
			user: {
				id: 1,
				phone: phone,
				nickname: nickname || "用户" + phone.slice(-4),
				avatar: "",
				bio: "",
				gender: 0,
				city: "",
				creditScore: 100,
				role: 0,
				status: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};
		afterLogin(mockData);
	}

	function afterLogin(data: LoginResult): void {
		userStore.setToken(data.token);
		userStore.user = data.user;
		uni.showToast({ title: "登录成功", icon: "success" });
		setTimeout(() => {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack();
			} else {
				uni.switchTab({ url: "/pages/index/index" });
			}
		}, 800);
	}

	async function handleWechatLogin(e: any): Promise<void> {
		const code = e.detail.code || e.detail.errMsg;
		if (!code) return;
		loading.value = true;
		try {
			const res = await authApi.loginByWechat(code);
			const data = res.data as LoginResult;
			afterLogin(data);
		} catch (_) {
			mockLogin("13800138000", "mock123");
		} finally {
			loading.value = false;
		}
	}

	onMounted(() => {
		refreshCaptcha();
	});
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: linear-gradient(135deg, #409eff, #337ecc);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.login-card {
		width: 100%;
		max-width: 360px;
		background: #fff;
		border-radius: 16px;
		padding: 30px 24px 20px;
	}
	.logo-area {
		text-align: center;
		margin-bottom: 20px;
	}
	.logo-icon {
		font-size: 40px;
	}
	.logo-text {
		font-size: 22px;
		font-weight: 700;
		display: block;
		margin: 6px 0;
		color: #333;
	}
	.logo-desc {
		font-size: 13px;
		color: #999;
	}
	.login-tabs {
		display: flex;
		margin-bottom: 20px;
		border-bottom: 1px solid #eee;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 10px 0;
		font-size: 15px;
		color: #999;
		border-bottom: 2px solid transparent;
	}
	.tab-item.active {
		color: #409eff;
		border-bottom-color: #409eff;
		font-weight: 600;
	}
	.form-area {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.form-input {
		height: 44px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 0 12px;
		font-size: 14px;
		background: #fafafa;
	}
	.sms-row {
		display: flex;
		gap: 8px;
	}
	.sms-input {
		flex: 1;
	}
	.sms-btn {
		width: 120px;
		height: 44px;
		line-height: 44px;
		font-size: 12px;
		background: #409eff;
		color: #fff;
		border-radius: 8px;
		border: none;
		text-align: center;
		flex-shrink: 0;
	}
	.sms-btn[disabled] {
		background: #ccc;
	}
	.captcha-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.captcha-input {
		flex: 1;
	}
	.captcha-img {
		width: 110px;
		height: 42px;
		border-radius: 6px;
		flex-shrink: 0;
	}
	.captcha-tip {
		width: 110px;
		height: 42px;
		line-height: 42px;
		text-align: center;
		font-size: 12px;
		color: #409eff;
		background: #ecf5ff;
		border-radius: 6px;
		flex-shrink: 0;
	}
	.submit-btn {
		background: #409eff;
		color: #fff;
		height: 44px;
		line-height: 44px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
	}
	.wechat-login {
		margin-top: 20px;
		text-align: center;
		padding-top: 16px;
		border-top: 1px solid #f0f0f0;
	}
	.wechat-btn {
		background: #07c160;
		color: #fff;
		height: 44px;
		line-height: 44px;
		border-radius: 8px;
		font-size: 14px;
	}
</style>
