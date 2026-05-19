<template>
	<view class="page">
		<scroll-view
			class="form-scroll"
			scroll-y
		>
			<view class="form-section">
				<text class="section-title">举报类型</text>
				<view class="type-grid">
					<view
						v-for="t in reportTypes"
						:key="t.value"
						class="type-item"
						:class="{ active: form.type === t.value }"
						@tap="form.type = t.value"
					>
						<text class="type-icon">{{ t.icon }}</text>
						<text class="type-label">{{ t.label }}</text>
						<text class="type-desc">{{ t.desc }}</text>
					</view>
				</view>
			</view>

			<view class="form-section">
				<text class="section-title">举报对象</text>
				<view class="target-row">
					<view class="target-switch">
						<view
							class="switch-item"
							:class="{ active: targetMode === 'user' }"
							@tap="targetMode = 'user'"
							>选择用户</view
						>
						<view
							class="switch-item"
							:class="{ active: targetMode === 'match' }"
							@tap="targetMode = 'match'"
							>关联场局</view
						>
					</view>
				</view>
				<view
					class="target-search"
					v-if="targetMode === 'user'"
				>
					<input
						class="search-input"
						v-model="userSearchKey"
						@confirm="searchUsers"
						placeholder="搜索用户昵称"
					/>
					<button
						class="search-btn"
						@tap="searchUsers"
					>
						搜索
					</button>
				</view>
				<view
					class="target-list"
					v-if="targetMode === 'user' && userList.length"
				>
					<view
						v-for="u in userList"
						:key="u.id"
						class="target-item"
						:class="{ selected: form.reportedUserId === u.id }"
						@tap="selectUser(u)"
					>
						<image
							:src="u.avatar || '/static/default-avatar.png'"
							class="target-avatar"
							mode="aspectFill"
						/>
						<text class="target-name">{{ u.nickname }}</text>
						<text
							v-if="form.reportedUserId === u.id"
							class="target-check"
							>✓</text
						>
					</view>
				</view>
				<view
					class="empty"
					v-if="targetMode === 'user' && userSearched && !userList.length"
					>未找到相关用户</view
				>
			</view>

			<view class="form-section">
				<text class="section-title">详细描述</text>
				<textarea
					class="desc-input"
					v-model="form.reason"
					placeholder="请详细描述举报原因（至少10个字）"
					maxlength="500"
				/>
				<text class="char-count">{{ form.reason.length }}/500</text>
			</view>

			<view class="form-section">
				<text class="section-title">证据截图（选填）</text>
				<view class="image-upload">
					<view
						v-for="(img, idx) in form.images"
						:key="idx"
						class="image-item"
					>
						<image
							:src="img"
							class="preview-img"
							mode="aspectFill"
						/>
						<text
							class="remove-btn"
							@tap="removeImage(idx)"
							>✕</text
						>
					</view>
					<view
						v-if="form.images.length < 4"
						class="add-btn"
						@tap="chooseImage"
					>
						<text class="add-icon">+</text>
						<text class="add-text">添加图片</text>
					</view>
				</view>
			</view>

			<view class="submit-area">
				<button
					class="submit-btn"
					:loading="submitting"
					:disabled="!canSubmit"
					@tap="handleSubmit"
				>
					提交举报
				</button>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed } from "vue";
	import { reportApi } from "@/api";

	const reportTypes = [
		{ value: "no_show", icon: "🚫", label: "未参加活动", desc: "报名后未到场参加" },
		{ value: "violation", icon: "⛔", label: "违规行为", desc: "违反平台规则" },
		{ value: "abuse", icon: "💢", label: "不文明行为", desc: "辱骂、骚扰等不良行为" },
		{ value: "other", icon: "📋", label: "其他", desc: "其他违规或不合理行为" },
	];

	const targetMode = ref("user");
	const form = reactive({
		type: "",
		reportedUserId: 0,
		reportedUserNickname: "",
		reason: "",
		images: [] as string[],
	});

	const userSearchKey = ref("");
	const userList = ref<any[]>([]);
	const userSearched = ref(false);
	const submitting = ref(false);

	const canSubmit = computed(() => {
		return form.type && form.reason.length >= 10;
	});

	async function searchUsers(): Promise<void> {
		if (!userSearchKey.value.trim()) return;
		try {
			const { userApi } = await import("@/api");
			const res = await userApi.list({ keyword: userSearchKey.value.trim(), pageSize: 10 });
			userList.value = res.data.list;
			userSearched.value = true;
		} catch {
			userList.value = [];
			userSearched.value = true;
		}
	}

	function selectUser(user: any): void {
		if (form.reportedUserId === user.id) {
			form.reportedUserId = 0;
			form.reportedUserNickname = "";
		} else {
			form.reportedUserId = user.id;
			form.reportedUserNickname = user.nickname;
		}
	}

	function chooseImage(): void {
		uni.chooseImage({
			count: 4 - form.images.length,
			sizeType: ["compressed"],
			sourceType: ["album", "camera"],
			success: async (res: any) => {
				for (const path of res.tempFilePaths) {
					try {
						const uploadRes = await uploadImage(path);
						form.images.push(uploadRes);
					} catch {
						/* ignore single upload failure */
					}
				}
			},
		});
	}

	async function uploadImage(filePath: string): Promise<string> {
		try {
			const { uploadApi } = await import("@/api");
			const res = await uploadApi.upload(filePath);
			return res.data.url || "";
		} catch {
			return "";
		}
	}

	function removeImage(idx: number): void {
		form.images.splice(idx, 1);
	}

	async function handleSubmit(): Promise<void> {
		if (!canSubmit.value) return;
		if (form.reason.length < 10) {
			uni.showToast({ title: "描述内容至少10个字", icon: "none" });
			return;
		}
		submitting.value = true;
		try {
			const data: any = {
				type: form.type,
				reason: form.reason,
				images: form.images.filter(Boolean),
			};
			if (form.reportedUserId) {
				data.reported_user_id = form.reportedUserId;
			}
			await reportApi.create(data);
			uni.showToast({ title: "举报已提交", icon: "success" });
			setTimeout(() => {
				uni.navigateBack();
			}, 1000);
		} catch (err: any) {
			const msg = err?.message || "提交失败，请重试";
			uni.showToast({ title: msg, icon: "none" });
		} finally {
			submitting.value = false;
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f5f5f5;
	}
	.form-scroll {
		padding: 12px;
	}
	.form-section {
		background: #fff;
		border-radius: 10px;
		padding: 14px;
		margin-bottom: 10px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 700;
		color: #333;
		display: block;
		margin-bottom: 10px;
	}
	.type-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.type-item {
		width: calc(50% - 4px);
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 12px;
		text-align: center;
		box-sizing: border-box;
	}
	.type-item.active {
		border-color: #409eff;
		background: #ecf5ff;
	}
	.type-icon {
		font-size: 24px;
		display: block;
	}
	.type-label {
		font-size: 14px;
		font-weight: 600;
		color: #333;
		display: block;
		margin: 4px 0 2px;
	}
	.type-desc {
		font-size: 11px;
		color: #999;
		display: block;
	}
	.target-row {
		margin-bottom: 8px;
	}
	.target-switch {
		display: flex;
		background: #f5f5f5;
		border-radius: 6px;
		padding: 2px;
	}
	.switch-item {
		flex: 1;
		text-align: center;
		padding: 8px;
		font-size: 13px;
		color: #666;
		border-radius: 4px;
	}
	.switch-item.active {
		background: #409eff;
		color: #fff;
	}
	.target-search {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}
	.search-input {
		flex: 1;
		height: 40px;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
		padding: 0 10px;
		font-size: 13px;
	}
	.search-btn {
		width: 60px;
		height: 40px;
		line-height: 40px;
		background: #409eff;
		color: #fff;
		border-radius: 6px;
		font-size: 13px;
		text-align: center;
		padding: 0;
	}
	.target-list {
		margin-top: 8px;
	}
	.target-item {
		display: flex;
		align-items: center;
		padding: 10px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		margin-bottom: 6px;
	}
	.target-item.selected {
		border-color: #409eff;
		background: #ecf5ff;
	}
	.target-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		margin-right: 8px;
	}
	.target-name {
		flex: 1;
		font-size: 14px;
		color: #333;
	}
	.target-check {
		color: #409eff;
		font-weight: 700;
		font-size: 16px;
	}
	.desc-input {
		width: 100%;
		min-height: 120px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 10px;
		font-size: 13px;
		box-sizing: border-box;
	}
	.char-count {
		font-size: 11px;
		color: #999;
		text-align: right;
		display: block;
		margin-top: 4px;
	}
	.image-upload {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.image-item {
		position: relative;
		width: 80px;
		height: 80px;
	}
	.preview-img {
		width: 80px;
		height: 80px;
		border-radius: 6px;
	}
	.remove-btn {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 20px;
		height: 20px;
		background: #f56c6c;
		color: #fff;
		border-radius: 50%;
		font-size: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.add-btn {
		width: 80px;
		height: 80px;
		border: 1px dashed #ccc;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.add-icon {
		font-size: 28px;
		color: #ccc;
	}
	.add-text {
		font-size: 10px;
		color: #999;
	}
	.submit-area {
		padding: 10px 0;
	}
	.submit-btn {
		width: 100%;
		height: 44px;
		line-height: 44px;
		background: #409eff;
		color: #fff;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
	}
	.submit-btn[disabled] {
		background: #ccc;
	}
	.empty {
		text-align: center;
		padding: 20px 0;
		color: #999;
		font-size: 13px;
	}
</style>
