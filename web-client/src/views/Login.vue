<template>
	<div class="login-page">
		<div class="login-card">
			<div class="login-header">
				<span class="login-logo">🏀</span>
				<h2>登录拼个场</h2>
				<p>找到你的运动搭子</p>
			</div>

			<el-tabs
				v-model="activeTab"
				class="login-tabs"
			>
				<el-tab-pane
					label="手机号登录"
					name="phone"
				>
					<el-form
						ref="phoneFormRef"
						:model="phoneForm"
						:rules="phoneRules"
						label-position="top"
					>
						<el-form-item
							label="手机号"
							prop="phone"
						>
							<el-input
								v-model="phoneForm.phone"
								placeholder="请输入手机号"
								size="large"
							/>
						</el-form-item>
						<el-form-item
							label="密码"
							prop="password"
						>
							<el-input
								v-model="phoneForm.password"
								type="password"
								placeholder="请输入密码"
								size="large"
								show-password
							/>
						</el-form-item>
						<el-form-item
							label="图形验证码"
							prop="captchaCode"
						>
							<div class="captcha-row">
								<el-input
									v-model="phoneForm.captchaCode"
									placeholder="验证码"
									size="large"
									maxlength="4"
									style="flex: 1"
								/>
								<img
									v-if="captchaImage"
									:src="captchaImage"
									class="captcha-img"
									@click="refreshCaptcha"
									title="点击刷新"
								/>
								<span
									v-else
									class="captcha-placeholder"
									@click="refreshCaptcha"
									>加载中</span
								>
							</div>
						</el-form-item>
						<el-form-item>
							<el-button
								type="primary"
								size="large"
								@click="handlePhoneLogin"
								:loading="loading"
								style="width: 100%"
							>
								登录
							</el-button>
						</el-form-item>
						<el-form-item>
							<el-checkbox v-model="rememberMe">七天免登录</el-checkbox>
						</el-form-item>
					</el-form>
				</el-tab-pane>

				<el-tab-pane
					label="注册"
					name="register"
				>
					<el-form
						ref="registerFormRef"
						:model="registerForm"
						:rules="registerRules"
						label-position="top"
					>
						<el-form-item
							label="手机号"
							prop="phone"
						>
							<el-input
								v-model="registerForm.phone"
								placeholder="请输入手机号"
								size="large"
							/>
						</el-form-item>
						<el-form-item
							label="图形验证码"
							prop="captchaCode"
						>
							<div class="captcha-row">
								<el-input
									v-model="registerForm.captchaCode"
									placeholder="验证码"
									size="large"
									maxlength="4"
									style="flex: 1"
								/>
								<img
									v-if="captchaImage"
									:src="captchaImage"
									class="captcha-img"
									@click="refreshCaptcha"
									title="点击刷新"
								/>
								<span
									v-else
									class="captcha-placeholder"
									@click="refreshCaptcha"
									>加载中</span
								>
							</div>
						</el-form-item>
						<el-form-item
							label="昵称"
							prop="nickname"
						>
							<el-input
								v-model="registerForm.nickname"
								placeholder="给自己取个昵称"
								size="large"
							/>
						</el-form-item>
						<el-form-item
							label="密码"
							prop="password"
						>
							<el-input
								v-model="registerForm.password"
								type="password"
								placeholder="6-20位密码"
								size="large"
								show-password
							/>
						</el-form-item>
						<el-form-item
							label="确认密码"
							prop="confirmPassword"
						>
							<el-input
								v-model="registerForm.confirmPassword"
								type="password"
								placeholder="再次输入密码"
								size="large"
								show-password
							/>
						</el-form-item>
						<el-form-item>
							<el-button
								type="primary"
								size="large"
								@click="handleRegister"
								:loading="loading"
								style="width: 100%"
							>
								注册
							</el-button>
						</el-form-item>
						<el-form-item>
							<el-checkbox v-model="rememberMe">七天免登录</el-checkbox>
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>

			<div class="wechat-login">
				<el-divider>其他方式登录</el-divider>
				<el-button
					size="large"
					@click="handleWechatLogin"
					style="width: 100%"
				>
					微信登录
				</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue";
	import { useRouter, useRoute } from "vue-router";
	import { ElMessage } from "element-plus";
	import type { FormInstance, FormRules } from "element-plus";
	import { useUserStore } from "@/store/user";
	import { authApi } from "@/api";

	const router = useRouter();
	const route = useRoute();
	const userStore = useUserStore();
	const activeTab = ref("phone");
	const loading = ref(false);
	const phoneFormRef = ref<FormInstance>();
	const registerFormRef = ref<FormInstance>();
	const captchaImage = ref("");
	const captchaId = ref("");

	const phoneForm = reactive({ phone: "", password: "", captchaCode: "" });
	const rememberMe = ref(false);
	const phoneRules: FormRules = {
		phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }],
		password: [{ required: true, min: 6, message: "密码至少6位", trigger: "blur" }],
		captchaCode: [{ required: true, message: "请输入图形验证码", trigger: "blur" }],
	};

	const registerForm = reactive({ phone: "", captchaCode: "", nickname: "", password: "", confirmPassword: "" });
	const registerRules: FormRules = {
		phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }],
		captchaCode: [{ required: true, message: "请输入图形验证码", trigger: "blur" }],
		nickname: [{ required: true, min: 2, max: 20, message: "昵称2-20个字符", trigger: "blur" }],
		password: [{ required: true, min: 6, max: 20, message: "密码6-20位", trigger: "blur" }],
		confirmPassword: [
			{ required: true, message: "请确认密码", trigger: "blur" },
			{
				validator: (_rule, value, callback) => {
					if (value !== registerForm.password) callback(new Error("两次密码不一致"));
					else callback();
				},
				trigger: "blur",
			},
		],
	};

	async function refreshCaptcha() {
		try {
			const res = await authApi.getCaptcha();
			captchaImage.value = res.data.image;
			captchaId.value = res.data.captchaId;
		} catch {
			/* ignore */
		}
	}

	async function handlePhoneLogin() {
		const valid = await phoneFormRef.value?.validate().catch(() => false);
		if (!valid) return;
		loading.value = true;
		try {
			await userStore.loginByPhone(phoneForm.phone, phoneForm.password, captchaId.value, phoneForm.captchaCode, rememberMe.value);
			ElMessage.success("登录成功");
			const redirect = route.query.redirect as string;
			router.push(redirect || "/");
		} catch {
			refreshCaptcha();
			phoneForm.captchaCode = "";
		} finally {
			loading.value = false;
		}
	}

	async function handleRegister() {
		const valid = await registerFormRef.value?.validate().catch(() => false);
		if (!valid) return;
		loading.value = true;
		try {
			await userStore.register(registerForm.phone, registerForm.password, registerForm.nickname, captchaId.value, registerForm.captchaCode, rememberMe.value);
			ElMessage.success("注册成功");
			router.push("/");
		} catch {
			/* error handled by request interceptor */
		} finally {
			loading.value = false;
		}
	}

	function handleWechatLogin() {
		ElMessage.info("微信登录功能开发中");
	}

	onMounted(() => {
		refreshCaptcha();
	});
</script>

<style scoped>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
		padding: 20px;
	}
	.login-card {
		width: 420px;
		background: #fff;
		border-radius: 16px;
		padding: 40px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	}
	.login-header {
		text-align: center;
		margin-bottom: 24px;
	}
	.login-logo {
		font-size: 48px;
	}
	.login-header h2 {
		font-size: 22px;
		font-weight: 700;
		margin: 8px 0 4px;
	}
	.login-header p {
		font-size: 14px;
		color: var(--text-secondary);
	}
	.login-tabs {
		margin-bottom: 8px;
	}
	.wechat-login {
		margin-top: 8px;
	}
	.captcha-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.captcha-img {
		height: 40px;
		width: 110px;
		border-radius: 4px;
		cursor: pointer;
		border: 1px solid #dcdfe6;
	}
	.captcha-placeholder {
		height: 40px;
		width: 110px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #999;
		border: 1px dashed #dcdfe6;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
