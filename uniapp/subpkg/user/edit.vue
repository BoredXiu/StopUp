<template>
	<view class="page">
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">头像</text>
				<view class="avatar-upload" @tap="chooseAvatar">
					<image :src="form.avatar || '/static/default-avatar.png'" class="avatar-preview" mode="aspectFill" />
					<text class="avatar-tip">点击更换</text>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">昵称</text>
				<input class="form-input" v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
			</view>

			<view class="form-item">
				<text class="form-label">性别</text>
				<picker class="form-picker" mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderPick">
					<view class="picker-display">
						<text :class="{ placeholder: !form.gender }">{{ genderLabel || '请选择' }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">生日</text>
				<picker class="form-picker" mode="date" :value="form.birthday" @change="onBirthdayPick">
					<view class="picker-display">
						<text :class="{ placeholder: !form.birthday }">{{ form.birthday || '请选择' }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">城市</text>
				<picker class="form-picker" mode="selector" :range="cityOptions" :value="cityIndex" @change="onCityPick">
					<view class="picker-display">
						<text :class="{ placeholder: !form.city }">{{ form.city || '请选择' }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
			</view>

			<view class="form-item form-item-textarea">
				<text class="form-label">个人简介</text>
				<textarea class="form-textarea" v-model="form.bio" placeholder="介绍一下自己吧..." maxlength="200" />
			</view>
		</view>

		<view class="btn-area">
			<button class="save-btn" @tap="handleSave" :loading="saving">保存</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed, onMounted } from "vue";
	import { userApi } from "@/api";
	import { useUserStore } from "@/store/user";

	const userStore = useUserStore();
	const saving = ref(false);

	const genderOptions = ["男", "女"];
	const cityOptions = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "天津", "苏州", "长沙", "郑州"];

	const form = reactive({
		avatar: "",
		nickname: "",
		gender: 0,
		birthday: "",
		city: "",
		bio: "",
	});

	const genderLabel = computed(() => {
		if (!form.gender) return "";
		return form.gender === 1 ? "男" : "女";
	});

	const genderIndex = computed(() => {
		return form.gender === 2 ? 1 : 0;
	});

	const cityIndex = computed(() => {
		const idx = cityOptions.indexOf(form.city);
		return idx >= 0 ? idx : 0;
	});

	function onGenderPick(e: any): void {
		form.gender = e.detail.value === 0 ? 1 : 2;
	}

	function onBirthdayPick(e: any): void {
		form.birthday = e.detail.value;
	}

	function onCityPick(e: any): void {
		form.city = cityOptions[e.detail.value];
	}

	function chooseAvatar(): void {
		uni.chooseImage({
			count: 1,
			sizeType: ["compressed"],
			sourceType: ["album", "camera"],
			success: (res: any) => {
				form.avatar = res.tempFilePaths[0];
			},
		});
	}

	async function handleSave(): void {
		if (!form.nickname.trim()) {
			uni.showToast({ title: "请输入昵称", icon: "none" });
			return;
		}
		saving.value = true;
		try {
			const data: Record<string, any> = {
				nickname: form.nickname.trim(),
				gender: form.gender || undefined,
				birthday: form.birthday || undefined,
				city: form.city || undefined,
				bio: form.bio.trim() || undefined,
			};
			if (form.avatar) data.avatar = form.avatar;
			await userApi.updateProfile(data);
			await userStore.fetchProfile();
			uni.showToast({ title: "保存成功", icon: "success" });
			setTimeout(() => uni.navigateBack(), 800);
		} catch (_) {
			/* ignore */
		} finally {
			saving.value = false;
		}
	}

	onMounted(() => {
		if (userStore.user) {
			form.avatar = userStore.user.avatar || "";
			form.nickname = userStore.user.nickname || "";
			form.gender = userStore.user.gender || 0;
			form.birthday = userStore.user.birthday || "";
			form.city = userStore.user.city || "";
			form.bio = userStore.user.bio || "";
		}
	});
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f5f5f5;
	}
	.form-section {
		background: #fff;
		margin: 10px 12px;
		border-radius: 8px;
		overflow: hidden;
	}
	.form-item {
		display: flex;
		align-items: center;
		padding: 14px;
		border-bottom: 1px solid #f5f5f5;
	}
	.form-item:last-child {
		border-bottom: none;
	}
	.form-item-textarea {
		flex-direction: column;
		align-items: flex-start;
	}
	.form-label {
		font-size: 14px;
		color: #333;
		width: 70px;
		flex-shrink: 0;
	}
	.form-input {
		flex: 1;
		font-size: 14px;
		color: #333;
		text-align: right;
	}
	.form-picker {
		flex: 1;
	}
	.picker-display {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		font-size: 14px;
		color: #333;
	}
	.picker-display .placeholder {
		color: #ccc;
	}
	.picker-arrow {
		font-size: 12px;
		color: #ccc;
		margin-left: 4px;
	}
	.form-textarea {
		width: 100%;
		height: 80px;
		font-size: 14px;
		color: #333;
		margin-top: 8px;
		padding: 8px;
		background: #f5f5f5;
		border-radius: 6px;
		box-sizing: border-box;
	}
	.avatar-upload {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
		gap: 8px;
	}
	.avatar-preview {
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}
	.avatar-tip {
		font-size: 12px;
		color: #409eff;
	}
	.btn-area {
		padding: 20px 16px;
	}
	.save-btn {
		width: 100%;
		height: 44px;
		line-height: 44px;
		background: #409eff;
		color: #fff;
		border-radius: 8px;
		font-size: 16px;
		border: none;
	}
</style>