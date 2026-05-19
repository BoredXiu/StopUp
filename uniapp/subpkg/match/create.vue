<template>
	<view class="page">
		<view class="form-card">
			<view class="form-title">创建场局</view>

			<view class="form-group">
				<text class="form-label">场局标题</text>
				<input
					class="form-input"
					v-model="form.title"
					placeholder="如：周六下午篮球3v3"
					maxlength="100"
				/>
			</view>

			<view class="form-group">
				<text class="form-label">运动类型</text>
				<picker
					:range="sportNames"
					:value="sportIndex"
					@change="onSportChange"
				>
					<view
						class="picker-value"
						:class="{ 'picker-placeholder': !form.sportName }"
						>{{ form.sportName || "请选择运动类型" }}</view
					>
				</picker>
			</view>

			<view class="form-group">
				<text class="form-label">日期</text>
				<view class="picker-row">
					<picker
						mode="date"
						@change="onDateChange"
					>
						<view class="picker-value">{{ form.matchDate || "请选择日期" }}</view>
					</picker>
					<view
						class="clear-btn"
						v-if="form.matchDate"
						@tap.stop="clearDate"
					>
						<text>✕</text>
					</view>
				</view>
			</view>

			<view class="form-row">
				<view class="form-group half">
					<text class="form-label">开始时间</text>
					<picker
						mode="time"
						@change="onStartTimeChange"
					>
						<view class="picker-value">{{ form.startTime || "开始" }}</view>
					</picker>
				</view>
				<view class="form-group half">
					<text class="form-label">结束时间</text>
					<picker
						mode="time"
						@change="onEndTimeChange"
					>
						<view class="picker-value">{{ form.endTime || "结束" }}</view>
					</picker>
				</view>
			</view>

			<view class="form-row">
				<view class="form-group half">
					<text class="form-label">最大人数</text>
					<input
						class="form-input"
						v-model.number="form.maxPlayers"
						type="number"
					/>
				</view>
				<view class="form-group half">
					<text class="form-label">最少人数</text>
					<input
						class="form-input"
						v-model.number="form.minPlayers"
						type="number"
					/>
				</view>
			</view>

			<view class="form-group">
				<text class="form-label">费用模式</text>
				<picker
					:range="feeTypes"
					:value="form.feeType - 1"
					@change="onFeeTypeChange"
				>
					<view
						class="picker-value"
						:class="{ 'picker-placeholder': !form.feeType }"
					>
						{{ feeTypes[form.feeType - 1] || "请选择" }}
					</view>
				</picker>
			</view>

			<view
				class="form-row"
				v-if="form.feeType !== 3"
			>
				<view class="form-group half">
					<text class="form-label">总费用(元)</text>
					<input
						class="form-input"
						v-model.number="form.totalFee"
						type="digit"
					/>
				</view>
				<view class="form-group half">
					<text class="form-label">人均(元)</text>
					<input
						class="form-input"
						v-model.number="form.perPersonFee"
						type="digit"
					/>
				</view>
			</view>

			<view class="form-group">
				<text class="form-label">水平要求</text>
				<picker
					:range="levels"
					@change="onLevelChange"
				>
					<view class="picker-value">{{ levels[form.levelRequired] }}</view>
				</picker>
			</view>

			<view class="form-group">
				<text class="form-label">性别要求</text>
				<picker
					:range="genders"
					@change="onGenderChange"
				>
					<view class="picker-value">{{ genders[form.genderRequired] }}</view>
				</picker>
			</view>

			<view class="form-group">
				<text class="form-label">场局描述</text>
				<textarea
					class="form-textarea"
					v-model="form.description"
					placeholder="补充一些场局信息..."
					maxlength="1000"
				/>
			</view>

			<button
				class="submit-btn"
				@tap="handleSubmit"
				:loading="submitting"
			>
				创建场局
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue";
	import { matchApi, sportApi } from "@/api";
	import type { Sport } from "@/types";

	const sports = ref<Sport[]>([]);
	const sportNames = ref<string[]>([]);
	const sportIndex = ref(-1);
	const feeTypes = ["AA制", "固定费用", "免费"];
	const levels = ["不限", "入门", "初级", "中级", "高级", "专业"];
	const genders = ["不限", "仅男生", "仅女生"];
	const submitting = ref(false);

	const form = reactive({
		title: "",
		sportId: null as number | null,
		sportName: "",
		matchDate: "",
		startTime: "",
		endTime: "",
		maxPlayers: 10,
		minPlayers: 4,
		feeType: 1,
		totalFee: 0,
		perPersonFee: 0,
		levelRequired: 0,
		genderRequired: 0,
		description: "",
	});

	function onSportChange(e: any): void {
		const idx = e.detail.value as number;
		sportIndex.value = idx;
		form.sportId = sports.value[idx].id;
		form.sportName = sports.value[idx].name;
	}
	function onDateChange(e: any): void {
		form.matchDate = e.detail.value;
	}
	function clearDate(): void {
		form.matchDate = "";
	}
	function onStartTimeChange(e: any): void {
		form.startTime = e.detail.value;
	}
	function onEndTimeChange(e: any): void {
		form.endTime = e.detail.value;
	}
	function onFeeTypeChange(e: any): void {
		form.feeType = Number(e.detail.value) + 1;
	}
	function onLevelChange(e: any): void {
		form.levelRequired = e.detail.value as number;
	}
	function onGenderChange(e: any): void {
		form.genderRequired = e.detail.value as number;
	}

	async function handleSubmit(): Promise<void> {
		if (!form.title) {
			uni.showToast({ title: "请输入标题", icon: "none" });
			return;
		}
		if (!form.sportId) {
			uni.showToast({ title: "请选择运动类型", icon: "none" });
			return;
		}
		if (!form.matchDate) {
			uni.showToast({ title: "请选择日期", icon: "none" });
			return;
		}
		if (!form.startTime || !form.endTime) {
			uni.showToast({ title: "请选择时间", icon: "none" });
			return;
		}
		if (form.startTime >= form.endTime) {
			uni.showToast({ title: "结束时间必须晚于开始时间", icon: "none" });
			return;
		}

		const feeType = Number(form.feeType);
		if (![1, 2, 3].includes(feeType)) {
			uni.showToast({ title: "请选择费用模式", icon: "none" });
			return;
		}

		submitting.value = true;
		try {
			await matchApi.create({
				title: form.title,
				sport_id: form.sportId,
				match_date: form.matchDate,
				start_time: form.startTime,
				end_time: form.endTime,
				max_players: Number(form.maxPlayers) || 0,
				min_players: Number(form.minPlayers) || 0,
				fee_type: feeType,
				total_fee: Number(form.totalFee) || 0,
				per_person_fee: Number(form.perPersonFee) || 0,
				level_required: Number(form.levelRequired) || 0,
				gender_required: Number(form.genderRequired) || 0,
				description: form.description,
			});
			uni.showToast({ title: "创建成功", icon: "success" });
			setTimeout(() => uni.navigateBack(), 1500);
		} catch (err: any) {
			const msg = err?.message || "";
			if (msg.includes("验证码") || msg.includes("captcha")) {
				uni.showToast({ title: "验证码错误，请重试", icon: "none" });
			} else if (msg.includes("时间冲突") || msg.includes("冲突")) {
				uni.showToast({ title: msg, icon: "none", duration: 3000 });
			} else if (msg) {
				uni.showToast({ title: msg, icon: "none" });
			}
		} finally {
			submitting.value = false;
		}
	}

	onMounted(async () => {
		const res = await sportApi.getAll();
		sports.value = res.data as Sport[];
		sportNames.value = (res.data as Sport[]).map((s) => s.name);
	});
</script>

<style scoped>
	.page {
		padding: 16px;
		padding-bottom: 40px;
	}
	.form-card {
		background: #fff;
		border-radius: 12px;
		padding: 20px;
	}
	.form-title {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 20px;
		text-align: center;
	}
	.form-group {
		margin-bottom: 16px;
	}
	.form-label {
		font-size: 13px;
		color: #666;
		display: block;
		margin-bottom: 6px;
	}
	.form-input {
		height: 44px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 0 12px;
		font-size: 14px;
		background: #fafafa;
	}
	.form-textarea {
		width: 100%;
		height: 100px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 14px;
		background: #fafafa;
		box-sizing: border-box;
	}
	.picker-value {
		height: 44px;
		line-height: 44px;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		padding: 0 12px;
		font-size: 14px;
		background: #fafafa;
		color: #333;
	}
	.picker-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.picker-row .picker-value {
		flex: 1;
	}
	.clear-btn {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #999;
		flex-shrink: 0;
	}
	.picker-placeholder {
		color: #999;
	}
	.form-row {
		display: flex;
		gap: 10px;
	}
	.half {
		flex: 1;
	}
	.submit-btn {
		background: #409eff;
		color: #fff;
		height: 46px;
		line-height: 46px;
		border-radius: 10px;
		font-size: 16px;
		font-weight: 600;
		text-align: center;
	}
</style>
