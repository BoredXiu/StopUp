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
					@tap="activeTab = 'phone'"
				>
					手机号登录
				</view>
				<view
					class="tab-item"
					:class="{ active: activeTab === 'register' }"
					@tap="activeTab = 'register'"
				>
					注册
				</view>
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
						placeholder="验证码"
						maxlength="6"
					/>
					<button
						class="sms-btn"
						@tap="sendSms"
						:disabled="smsCountdown > 0"
					>
						{{ smsCountdown > 0 ? `${smsCountdown}s` : "获取验证码" }}
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

<script setup>
	import { ref, reactive } from "vue";
	import { authApi } from "@/api";
	import { useUserStore } from "@/store/user";

	const userStore = useUserStore();
	const activeTab = ref("phone");
	const loading = ref(false);
	const smsCountdown = ref(0);

	const phoneForm = reactive({ phone: "", password: "" });
	const registerForm = reactive({ phone: "", smsCode: "", nickname: "", password: "" });

	async function handlePhoneLogin() {
		if (!phoneForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!phoneForm.password) {
			uni.showToast({ title: "请输入密码", icon: "none" });
			return;
		}
		loading.value = true;
		try {
			const res = await authApi.loginByPhone(phoneForm);
			userStore.setToken(res.data.token);
			userStore.user = res.data.user;
			uni.showToast({ title: "登录成功", icon: "success" });
			setTimeout(() => uni.navigateBack(), 1500);
		} finally {
			loading.value = false;
		}
	}

	async function sendSms() {
		if (!registerForm.phone || registerForm.phone.length !== 11) {
			uni.showToast({ title: "请输入正确的手机号", icon: "none" });
			return;
		}
		try {
			await authApi.sendSms(registerForm.phone);
			uni.showToast({ title: "验证码已发送", icon: "success" });
			smsCountdown.value = 60;
			const timer = setInterval(() => {
				smsCountdown.value--;
				if (smsCountdown.value <= 0) clearInterval(timer);
			}, 1000);
		} catch (e) {
			/* ignore */
		}
	}

	async function handleRegister() {
		if (!registerForm.phone) {
			uni.showToast({ title: "请输入手机号", icon: "none" });
			return;
		}
		if (!registerForm.smsCode) {
			uni.showToast({ title: "请输入验证码", icon: "none" });
			return;
		}
		if (!registerForm.nickname) {
			uni.showToast({ title: "请输入昵称", icon: "none" });
			return;
		}
		if (!registerForm.password) {
			uni.showToast({ title: "请设置密码", icon: "none" });
			return;
		}
		loading.value = true;
		try {
			const res = await authApi.loginByPhone({
				phone: registerForm.phone,
				smsCode: registerForm.smsCode,
				nickname: registerForm.nickname,
				password: registerForm.password,
				isRegister: true,
			});
			userStore.setToken(res.data.token);
			userStore.user = res.data.user;
			uni.showToast({ title: "注册成功", icon: "success" });
			setTimeout(() => uni.navigateBack(), 1500);
		} finally {
			loading.value = false;
		}
	}

	async function handleWechatLogin(e) {
		try {
			const res = await uni.login({ provider: "weixin" });
			const loginRes = await authApi.loginByWechat(res.code);
			userStore.setToken(loginRes.data.token);
			userStore.user = loginRes.data.user;
			uni.showToast({ title: "登录成功", icon: "success" });
			setTimeout(() => uni.navigateBack(), 1500);
		} catch (e) {
			/* ignore */
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 24px;
		background: linear-gradient(135deg, #409eff, #337ecc);
	}
	.login-card {
		width: 100%;
		background: #fff;
		border-radius: 16px;
		padding: 32px 24px;
	}
	.logo-area {
		text-align: center;
		margin-bottom: 28px;
	}
	.logo-icon {
		font-size: 48px;
	}
	.logo-text {
		display: block;
		font-size: 24px;
		font-weight: 700;
		margin: 8px 0 4px;
	}
	.logo-desc {
		font-size: 13px;
		color: #999;
	}

	.login-tabs {
		display: flex;
		margin-bottom: 24px;
	}
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 10px;
		font-size: 15px;
		color: #999;
		border-bottom: 2px solid transparent;
	}
	.tab-item.active {
		color: #409eff;
		border-bottom-color: #409eff;
		font-weight: 600;
	}

	.form-input {
		width: 100%;
		height: 48px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 0 14px;
		font-size: 15px;
		margin-bottom: 14px;
		box-sizing: border-box;
		background: #fafafa;
	}
	.sms-row {
		display: flex;
		gap: 10px;
	}
	.sms-input {
		flex: 1;
	}
	.sms-btn {
		width: 110px;
		height: 48px;
		line-height: 48px;
		background: #f0f0f0;
		color: #666;
		border-radius: 8px;
		font-size: 13px;
		border: none;
		flex-shrink: 0;
	}
	.submit-btn {
		width: 100%;
		height: 48px;
		line-height: 48px;
		background: #409eff;
		color: #fff;
		border-radius: 24px;
		font-size: 16px;
		border: none;
		margin-top: 8px;
	}

	.wechat-login {
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid #f0f0f0;
	}
	.wechat-btn {
		width: 100%;
		height: 48px;
		line-height: 48px;
		background: #07c160;
		color: #fff;
		border-radius: 24px;
		font-size: 16px;
		border: none;
	}
</style>
