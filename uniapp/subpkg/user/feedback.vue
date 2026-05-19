<template>
<view class="page">
	<scroll-view class="form-scroll" scroll-y>
		<view class="form-section">
			<text class="section-title">反馈类型</text>
			<view class="type-grid">
				<view
					v-for="t in feedbackTypes"
					:key="t.value"
					class="type-item"
					:class="{ active: form.type === t.value }"
					@tap="form.type = t.value"
				>
					<text class="type-icon">{{ t.icon }}</text>
					<text class="type-label">{{ t.label }}</text>
				</view>
			</view>
		</view>

		<view class="form-section">
			<text class="section-title">反馈内容</text>
			<textarea
				class="desc-input"
				v-model="form.content"
				placeholder="请详细描述您遇到的问题或建议（至少5个字）"
				maxlength="1000"
			/>
			<text class="char-count">{{ form.content.length }}/1000</text>
		</view>

		<view class="form-section">
			<text class="section-title">截图（选填，最多4张）</text>
			<view class="image-upload">
				<view
					v-for="(img, idx) in form.images"
					:key="idx"
					class="image-item"
				>
					<image :src="img" class="preview-img" mode="aspectFill" />
					<text class="remove-btn" @tap="removeImage(idx)">✕</text>
				</view>
				<view
					v-if="form.images.length < 4"
					class="add-btn"
					@tap="chooseImage"
				>
					<text class="add-icon">+</text>
					<text class="add-text">添加截图</text>
				</view>
			</view>
		</view>

		<view class="form-section">
			<text class="section-title">联系方式（选填）</text>
			<input
				class="contact-input"
				v-model="form.contact"
				placeholder="手机号/微信号，方便我们联系您"
				maxlength="50"
			/>
		</view>

		<view class="tips-card">
			<text class="tips-title">温馨提示</text>
			<text class="tips-item">· 我们将认真对待每一条反馈，感谢您的宝贵意见</text>
			<text class="tips-item">· 紧急问题可联系客服：400-000-0000</text>
		</view>

		<view class="submit-area">
			<button
				class="submit-btn"
				:loading="submitting"
				:disabled="!canSubmit"
				@tap="handleSubmit"
			>提交反馈</button>
		</view>
	</scroll-view>
</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { feedbackApi } from "@/api";

const feedbackTypes = [
	{ value: "bug", icon: "🐛", label: "功能异常" },
	{ value: "feature", icon: "💡", label: "功能建议" },
	{ value: "experience", icon: "😊", label: "使用体验" },
	{ value: "ui", icon: "🎨", label: "界面设计" },
	{ value: "other", icon: "📋", label: "其他" },
];

const form = reactive({
	type: "",
	content: "",
	images: [] as string[],
	contact: "",
});

const submitting = ref(false);

const canSubmit = computed(() => {
	return form.type && form.content.length >= 5;
});

function chooseImage(): void {
	uni.chooseImage({
		count: 4 - form.images.length,
		sizeType: ["compressed"],
		sourceType: ["album", "camera"],
		success: async (res: any) => {
			for (const path of res.tempFilePaths) {
				try {
					const uploadRes = await uploadImage(path);
					if (uploadRes) form.images.push(uploadRes);
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
	submitting.value = true;
	try {
		await feedbackApi.create({
			type: form.type,
			content: form.content,
			images: form.images.filter(Boolean),
			contact: form.contact || undefined,
		});
		uni.showToast({ title: "感谢您的反馈！", icon: "success" });
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
	gap: 8px;
}
.type-item {
	flex: 1;
	border: 1px solid #e5e5e5;
	border-radius: 8px;
	padding: 12px 6px;
	text-align: center;
}
.type-item.active {
	border-color: #409eff;
	background: #ecf5ff;
}
.type-icon {
	font-size: 22px;
	display: block;
}
.type-label {
	font-size: 12px;
	color: #666;
	display: block;
	margin-top: 4px;
}
.type-item.active .type-label {
	color: #409eff;
}
.desc-input {
	width: 100%;
	min-height: 140px;
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
.contact-input {
	width: 100%;
	height: 44px;
	border: 1px solid #e5e5e5;
	border-radius: 8px;
	padding: 0 10px;
	font-size: 14px;
	box-sizing: border-box;
}
.tips-card {
	background: #fffbe6;
	border-radius: 10px;
	padding: 14px;
	margin-bottom: 10px;
}
.tips-title {
	font-size: 14px;
	font-weight: 600;
	color: #e6a23c;
	display: block;
	margin-bottom: 6px;
}
.tips-item {
	font-size: 12px;
	color: #8a6d3b;
	display: block;
	line-height: 1.6;
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
</style>