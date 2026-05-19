<template>
	<div class="login-page">
		<div class="login-card">
			<h2>拼个场管理后台</h2>
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-position="top"
				@submit.prevent="handleLogin"
			>
				<el-form-item
					label="用户名"
					prop="username"
				>
					<el-input
						v-model="form.username"
						placeholder="请输入用户名"
						size="large"
					/>
				</el-form-item>
				<el-form-item
					label="密码"
					prop="password"
				>
					<el-input
						v-model="form.password"
						type="password"
						placeholder="请输入密码"
						size="large"
						show-password
					/>
				</el-form-item>
				<el-form-item>
					<el-checkbox v-model="rememberMe">七天免登录</el-checkbox>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						size="large"
						native-type="submit"
						:loading="loading"
						style="width: 100%"
					>
						登录
					</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, reactive } from "vue";
	import { useRouter } from "vue-router";
	import { ElMessage } from "element-plus";
	import type { FormInstance, FormRules } from "element-plus";
	import { adminApi } from "@/api";

	const router = useRouter();
	const formRef = ref<FormInstance>();
	const loading = ref(false);
	const rememberMe = ref(false);
	const form = reactive({ username: "", password: "" });
	const rules: FormRules = {
		username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
		password: [{ required: true, message: "请输入密码", trigger: "blur" }],
	};

	async function handleLogin() {
		const valid = await formRef.value?.validate().catch(() => false);
		if (!valid) return;
		loading.value = true;
		try {
			const res = await adminApi.login({ ...form, rememberMe: rememberMe.value });
			localStorage.setItem("admin_token", res.data.token);
			localStorage.setItem("admin_user", JSON.stringify(res.data.user));
			if (rememberMe.value) {
				localStorage.setItem("admin_rememberMe", "true");
			}
			ElMessage.success("登录成功");
			router.push("/");
		} finally {
			loading.value = false;
		}
	}
</script>

<style scoped>
	.login-page {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #304156;
	}
	.login-card {
		width: 400px;
		background: #fff;
		border-radius: 12px;
		padding: 40px;
	}
	.login-card h2 {
		text-align: center;
		font-size: 22px;
		margin-bottom: 32px;
	}
</style>
