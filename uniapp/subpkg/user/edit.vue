<template>
	<view class="page">
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">头像</text>
				<view
					class="avatar-upload"
					@tap="chooseAvatar"
				>
					<image
						:src="form.avatar || '/static/default-avatar.png'"
						class="avatar-preview"
						mode="aspectFill"
					/>
					<text class="avatar-tip">点击更换</text>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">昵称</text>
				<input
					class="form-input"
					v-model="form.nickname"
					placeholder="请输入昵称"
					maxlength="20"
				/>
			</view>

			<view class="form-item">
				<text class="form-label">性别</text>
				<picker
					class="form-picker"
					mode="selector"
					:range="genderOptions"
					:value="genderIndex"
					@change="onGenderPick"
				>
					<view class="picker-display">
						<text :class="{ placeholder: !form.gender }">{{ genderLabel || "请选择" }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
				<view
					class="clear-btn"
					v-if="form.gender"
					@tap.stop="clearGender"
				>
					<text>✕</text>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">生日</text>
				<picker
					class="form-picker"
					mode="date"
					:value="form.birthday"
					@change="onBirthdayPick"
				>
					<view class="picker-display">
						<text :class="{ placeholder: !form.birthday }">{{ form.birthday || "请选择" }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
				<view
					class="clear-btn"
					v-if="form.birthday"
					@tap.stop="clearBirthday"
				>
					<text>✕</text>
				</view>
			</view>

			<view class="form-item">
				<text class="form-label">城市</text>
				<picker
					class="form-picker"
					mode="multiSelector"
					:range="regionPickRange"
					:value="regionPickValue"
					@change="onRegionPick"
					@columnchange="onRegionColumnChange"
				>
					<view class="picker-display">
						<text :class="{ placeholder: !regionDisplay }">{{ regionDisplay || "请选择" }}</text>
						<text class="picker-arrow">▾</text>
					</view>
				</picker>
				<view
					class="clear-btn"
					v-if="regionDisplay"
					@tap.stop="clearRegion"
				>
					<text>✕</text>
				</view>
			</view>

			<view class="form-item form-item-textarea">
				<text class="form-label">个人简介</text>
				<textarea
					class="form-textarea"
					v-model="form.bio"
					placeholder="介绍一下自己吧..."
					maxlength="200"
				/>
			</view>
		</view>

		<view class="btn-area">
			<button
				class="save-btn"
				@tap="handleSave"
				:loading="saving"
			>
				保存
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed, onMounted } from "vue";
	import { userApi } from "@/api";
	import { useUserStore } from "@/store/user";
	import { REGION_DATA } from "@/data/regions";

	const userStore = useUserStore();
	const saving = ref(false);

	const genderOptions = ["男", "女"];

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

	function onGenderPick(e: any): void {
		form.gender = e.detail.value === 0 ? 1 : 2;
	}

	function onBirthdayPick(e: any): void {
		form.birthday = e.detail.value;
	}

	function clearGender(): void {
		form.gender = 0;
	}

	function clearBirthday(): void {
		form.birthday = "";
	}

	function clearRegion(): void {
		regionPickValue.value = [0, 0, 0];
		regionDisplay.value = "";
		form.city = "";
	}

	const regionPickValue = ref([0, 0, 0]);
	const regionDisplay = ref("");

	const regionPickRange = computed(() => {
		const provinces = REGION_DATA.map((r) => r.name);
		const cities = REGION_DATA[regionPickValue.value[0]]?.cities.map((c) => c.name) || ["不限"];
		const districts = REGION_DATA[regionPickValue.value[0]]?.cities[regionPickValue.value[1]]?.districts || ["不限"];
		return [provinces, cities, districts];
	});

	function buildRegionDisplay(): string {
		const p = REGION_DATA[regionPickValue.value[0]];
		if (!p || p.name === "全国") return "";
		const c = p.cities[regionPickValue.value[1]];
		if (!c || c.name === "不限") return p.name;
		const d = c.districts[regionPickValue.value[2]];
		if (!d || d === "不限") return c.name === p.name ? p.name : c.name + d;
		return c.name === p.name ? d : c.name + d;
	}

	function updateFormCity(): void {
		const p = REGION_DATA[regionPickValue.value[0]];
		if (!p || p.name === "全国") {
			form.city = "";
			return;
		}
		const c = p.cities[regionPickValue.value[1]];
		const d = c?.districts[regionPickValue.value[2]];
		const parts: string[] = [];
		if (p.name !== "全国") parts.push(p.name);
		if (c && c.name !== "不限") parts.push(c.name);
		if (d && d !== "不限") parts.push(d);
		form.city = parts.join("-");
	}

	function onRegionPick(e: any): void {
		const [pIdx, cIdx, dIdx] = e.detail.value;
		regionPickValue.value = [pIdx, cIdx, dIdx];
		regionDisplay.value = buildRegionDisplay();
		updateFormCity();
	}

	function onRegionColumnChange(e: any): void {
		const col = e.detail.column;
		const val = e.detail.value;
		if (col === 0) {
			regionPickValue.value = [val, 0, 0];
		} else if (col === 1) {
			regionPickValue.value = [regionPickValue.value[0], val, 0];
		}
	}

	function parseCityToRegion(cityStr: string): void {
		if (!cityStr) {
			regionPickValue.value = [0, 0, 0];
			regionDisplay.value = "";
			return;
		}
		const parts = cityStr.split("-");
		for (let pi = 0; pi < REGION_DATA.length; pi++) {
			const p = REGION_DATA[pi];
			if (p.name === "全国") continue;
			if (parts[0] && parts[0] !== p.name && !p.name.includes(parts[0])) continue;
			let ci = 0;
			if (parts[1]) {
				for (let cj = 0; cj < p.cities.length; cj++) {
					if (p.cities[cj].name.includes(parts[1])) {
						ci = cj;
						break;
					}
				}
			}
			let di = 0;
			const c = p.cities[ci];
			if (c && parts[2]) {
				for (let dk = 0; dk < c.districts.length; dk++) {
					if (c.districts[dk].includes(parts[2])) {
						di = dk;
						break;
					}
				}
			}
			regionPickValue.value = [pi, ci, di];
			regionDisplay.value = buildRegionDisplay();
			return;
		}
		regionPickValue.value = [0, 0, 0];
		regionDisplay.value = "";
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

	function formatDate(dateStr: string): string {
		if (!dateStr) return "";
		const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
		return match ? match[0] : dateStr;
	}

	onMounted(() => {
		if (userStore.user) {
			form.avatar = userStore.user.avatar || "";
			form.nickname = userStore.user.nickname || "";
			form.gender = userStore.user.gender || 0;
			form.birthday = formatDate(userStore.user.birthday || "");
			form.city = userStore.user.city || "";
			form.bio = userStore.user.bio || "";
			parseCityToRegion(form.city);
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
	.clear-btn {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #999;
		margin-left: 8px;
		flex-shrink: 0;
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
