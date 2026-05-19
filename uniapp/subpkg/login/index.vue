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
				<view class="pwd-row">
					<input
						class="form-input pwd-input"
						v-model="phoneForm.password"
						:password="!showPassword"
						placeholder="请输入密码"
					/>
					<text
						class="pwd-toggle"
						@tap="showPassword = !showPassword"
						>{{ showPassword ? "🙈" : "👁" }}</text
					>
				</view>
				<view class="captcha-row">
					<input
						class="form-input captcha-input"
						v-model="phoneForm.captchaCode"
						@input="onPhoneCaptchaInput"
						placeholder="图形验证码（英文+数字）"
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
				<view class="remember-row">
					<label
						class="remember-label"
						@tap="rememberMe = !rememberMe"
					>
						<view
							class="checkbox-icon"
							:class="{ checked: rememberMe }"
						>
							<text v-if="rememberMe">✓</text>
						</view>
						<text class="remember-text">七天免登录</text>
					</label>
				</view>
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
				<view class="captcha-row">
					<input
						class="form-input captcha-input"
						v-model="registerForm.captchaCode"
						@input="onRegCaptchaInput"
						placeholder="图形验证码（英文+数字）"
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
				<input
					class="form-input"
					v-model="registerForm.nickname"
					placeholder="请输入昵称"
				/>
				<view class="pwd-row">
					<input
						class="form-input pwd-input"
						v-model="registerForm.password"
						:password="!showRegPassword"
						placeholder="请设置密码"
					/>
					<text
						class="pwd-toggle"
						@tap="showRegPassword = !showRegPassword"
						>{{ showRegPassword ? "🙈" : "👁" }}</text
					>
				</view>
				<button
					class="submit-btn"
					@tap="handleRegister"
					:loading="loading"
				>
					注册
				</button>
				<view class="remember-row">
					<label
						class="remember-label"
						@tap="rememberMe = !rememberMe"
					>
						<view
							class="checkbox-icon"
							:class="{ checked: rememberMe }"
						>
							<text v-if="rememberMe">✓</text>
						</view>
						<text class="remember-text">七天免登录</text>
					</label>
				</view>
			</view>

			<view
				class="wechat-login"
				v-if="activeTab === 'phone'"
			>
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
	const showPassword = ref(false);
	const showRegPassword = ref(false);
	const captchaImage = ref("");
	const captchaId = ref("");
	const rememberMe = ref(false);

	const phoneForm = reactive({ phone: "", password: "", captchaCode: "" });
	const registerForm = reactive({ phone: "", captchaCode: "", nickname: "", password: "" });

	function filterCaptcha(val: string): string {
		return (val || "").replace(/[^a-zA-Z0-9]/g, "");
	}

	function onPhoneCaptchaInput(): void {
		phoneForm.captchaCode = filterCaptcha(phoneForm.captchaCode);
	}

	function onRegCaptchaInput(): void {
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

	async function handlePhoneLogin(): Promise<void> {
		if (!phoneForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
			uni.showToast({ title: "请输入正确的手机号", icon: "none" });
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
				rememberMe: rememberMe.value,
			});
			const data = res.data as LoginResult;
			if (!data || !data.accessToken) {
				uni.showToast({ title: "登录失败：服务器返回数据异常", icon: "none" });
				refreshCaptcha();
				return;
			}
			afterLogin(data);
		} catch (err: any) {
			const msg = err?.message || "";
			if (msg.includes("密码") || msg.includes("password")) {
				uni.showToast({ title: "密码错误，请重试", icon: "none" });
			} else if (msg.includes("验证码") || msg.includes("captcha")) {
				uni.showToast({ title: "验证码错误，请重试", icon: "none" });
				refreshCaptcha();
			} else {
				uni.showToast({ title: msg || "登录失败，请重试", icon: "none" });
			}
			phoneForm.captchaCode = "";
			refreshCaptcha();
		} finally {
			loading.value = false;
		}
	}

	async function handleRegister(): Promise<void> {
		if (!registerForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
			uni.showToast({ title: "请输入正确的手机号", icon: "none" });
			return;
		}
		if (!registerForm.captchaCode) {
			uni.showToast({ title: "请输入图形验证码", icon: "none" });
			return;
		}
		if (!registerForm.password) {
			uni.showToast({ title: "请设置密码", icon: "none" });
			return;
		}
		if (registerForm.password.length < 6) {
			uni.showToast({ title: "密码长度至少6位", icon: "none" });
			return;
		}
		loading.value = true;
		try {
			const res = await authApi.register({
				phone: registerForm.phone,
				password: registerForm.password,
				nickname: registerForm.nickname || undefined,
				captchaId: captchaId.value,
				captchaCode: registerForm.captchaCode,
				rememberMe: rememberMe.value,
			});
			const data = res.data as LoginResult;
			if (!data || !data.accessToken) {
				uni.showToast({ title: "注册失败：服务器返回数据异常", icon: "none" });
				return;
			}
			afterLogin(data);
		} catch (err: any) {
			const msg = err?.message || "";
			if (msg.includes("验证码") || msg.includes("captcha")) {
				uni.showToast({ title: "验证码错误，请重试", icon: "none" });
				refreshCaptcha();
			} else {
				uni.showToast({ title: msg || "注册失败，请重试", icon: "none" });
			}
		} finally {
			loading.value = false;
		}
	}

	function afterLogin(data: LoginResult): void {
		if (!data || !data.accessToken) {
			uni.showToast({ title: "登录异常，请重试", icon: "none" });
			return;
		}
		userStore.setToken(data.accessToken);
		userStore.user = data.user;
		uni.setStorageSync("user", JSON.stringify(data.user));
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
			if (!data || !data.accessToken) {
				uni.showToast({ title: "微信登录失败：数据异常", icon: "none" });
				return;
			}
			afterLogin(data);
		} catch (err: any) {
			const msg = err?.message || "";
			uni.showToast({ title: msg || "微信登录失败", icon: "none" });
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
	.captcha-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.pwd-row {
		display: flex;
		gap: 0;
		align-items: center;
		position: relative;
	}
	.pwd-input {
		flex: 1;
		padding-right: 44px;
	}
	.pwd-toggle {
		position: absolute;
		right: 8px;
		font-size: 18px;
		padding: 4px;
		z-index: 1;
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
		width: 100%;
		background: #409eff;
		color: #fff;
		height: 44px;
		line-height: 44px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 400;
		padding: 0;
	}
	.wechat-login {
		margin-top: 20px;
		text-align: center;
		padding-top: 16px;
		border-top: 1px solid #f0f0f0;
	}
	.wechat-btn {
		width: 100%;
		background: #07c160;
		color: #fff;
		height: 44px;
		line-height: 44px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 400;
		padding: 0;
	}
	.remember-row {
		display: flex;
		justify-content: flex-start;
		padding: 4px 0;
	}
	.remember-label {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.checkbox-icon {
		width: 18px;
		height: 18px;
		border: 1px solid #d0d0d0;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #fff;
		background: #fff;
	}
	.checkbox-icon.checked {
		background: #409eff;
		border-color: #409eff;
	}
	.remember-text {
		font-size: 13px;
		color: #666;
	}
	.picker-placeholder {
		color: #999;
	}
</style>
