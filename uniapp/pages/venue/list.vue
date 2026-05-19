<template>
	<view class="page">
		<view class="search-bar">
			<view class="city-bar">
				<view
					class="location-tag"
					@tap="chooseLocation"
				>
					<text class="location-icon">📍</text>
					<text class="location-text">{{ displayRegion || "点击定位" }}</text>
				</view>
				<picker
					class="city-picker"
					mode="multiSelector"
					:range="regionPickRange"
					:value="regionPickValue"
					@change="onRegionPick"
					@columnchange="onRegionColumnChange"
				>
					<view class="city-pick-trigger">
						<text>{{ displayRegion || "选择区域" }}</text>
						<text class="pick-arrow">▾</text>
					</view>
				</picker>
				<view
					class="clear-btn"
					v-if="displayRegion"
					@tap="clearRegion"
				>
					<text>✕</text>
				</view>
			</view>
			<view class="search-row">
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索场馆"
					confirm-type="search"
					@confirm="fetchVenues"
				/>
				<view
					class="clear-btn"
					v-if="keyword"
					@tap="clearKeyword"
				>
					<text>✕</text>
				</view>
			</view>
		</view>

		<view
			class="venue-list"
			v-if="venues.length"
		>
			<view
				v-for="venue in venues"
				:key="venue.id"
				class="venue-card"
				@tap="goDetail(venue.id)"
			>
				<image
					:src="venue.coverImage || getVenueImage(venue.id)"
					class="venue-cover"
					mode="aspectFill"
				/>
				<view class="venue-info">
					<text class="venue-name">{{ venue.name }}</text>
					<text class="venue-addr">{{ venue.address }}</text>
					<view class="venue-footer">
						<text class="venue-city">{{ venue.city }}{{ venue.district ? " · " + venue.district : "" }}</text>
						<text class="venue-rating">⭐ {{ venue.rating }}</text>
					</view>
				</view>
			</view>
		</view>

		<view
			class="empty"
			v-if="!firstLoad && venues.length === 0"
			>暂无场馆</view
		>

		<view
			class="load-more"
			v-if="hasMore && venues.length"
			@tap="loadMore"
			>加载更多</view
		>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from "vue";
	import { venueApi } from "@/api";
	import type { Venue } from "@/types";
	import { REGION_DATA } from "@/data/regions";

	const VENUE_PICS = [
		"https://picsum.photos/seed/gym1/400/300",
		"https://picsum.photos/seed/gym2/400/300",
		"https://picsum.photos/seed/gym3/400/300",
		"https://picsum.photos/seed/gym4/400/300",
		"https://picsum.photos/seed/gym5/400/300",
		"https://picsum.photos/seed/gym6/400/300",
		"https://picsum.photos/seed/gym7/400/300",
		"https://picsum.photos/seed/gym8/400/300",
		"https://picsum.photos/seed/gym9/400/300",
		"https://picsum.photos/seed/gym10/400/300",
	];

	function getVenueImage(seed: number): string {
		return VENUE_PICS[seed % VENUE_PICS.length];
	}

	const keyword = ref("");
	const venues = ref<Venue[]>([]);
	const firstLoad = ref(true);
	const page = ref(1);
	const hasMore = ref(true);
	const currentCity = ref("");
	const currentDistrict = ref("");
	const currentProvince = ref("");
	const regionPickValue = ref([0, 0, 0]);
	const displayRegion = ref("");

	const regionPickRange = computed(() => {
		const provinces = REGION_DATA.map((r) => r.name);
		const cities = REGION_DATA[regionPickValue.value[0]]?.cities.map((c) => c.name) || ["不限"];
		const districts = REGION_DATA[regionPickValue.value[0]]?.cities[regionPickValue.value[1]]?.districts || ["不限"];
		return [provinces, cities, districts];
	});

	function buildDisplayRegion(): string {
		const p = REGION_DATA[regionPickValue.value[0]];
		if (!p || p.name === "全国") return "";
		const c = p.cities[regionPickValue.value[1]];
		if (!c || c.name === "不限") return p.name;
		const d = c.districts[regionPickValue.value[2]];
		if (!d || d === "不限") return c.name === p.name ? p.name : c.name;
		return c.name === p.name ? d : c.name + d;
	}

	function onRegionPick(e: any): void {
		const [pIdx, cIdx, dIdx] = e.detail.value;
		regionPickValue.value = [pIdx, cIdx, dIdx];
		const p = REGION_DATA[pIdx];
		if (!p || p.name === "全国") {
			currentProvince.value = "";
			currentCity.value = "";
			currentDistrict.value = "";
		} else {
			currentProvince.value = p.name;
			const c = p.cities[cIdx];
			currentCity.value = c && c.name !== "不限" ? c.name : "";
			currentDistrict.value = "";
			if (c) {
				const d = c.districts[dIdx];
				currentDistrict.value = d && d !== "不限" ? d : "";
			}
		}
		displayRegion.value = buildDisplayRegion();
		uni.setStorageSync("venueProvince", currentProvince.value);
		uni.setStorageSync("venueCity", currentCity.value);
		uni.setStorageSync("venueDistrict", currentDistrict.value);
		fetchVenues();
	}

	function clearRegion(): void {
		regionPickValue.value = [0, 0, 0];
		displayRegion.value = "";
		currentProvince.value = "";
		currentCity.value = "";
		currentDistrict.value = "";
		uni.removeStorageSync("venueProvince");
		uni.removeStorageSync("venueCity");
		uni.removeStorageSync("venueDistrict");
		fetchVenues();
	}

	function clearKeyword(): void {
		keyword.value = "";
		fetchVenues();
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

	function goDetail(id: number): void {
		uni.navigateTo({ url: "/subpkg/venue/detail?id=" + id });
	}

	function chooseLocation(): void {
		uni.chooseLocation({
			success: (res: any) => {
				const addr: string = res.address || res.name || "";
				let found = false;
				for (let pi = 0; pi < REGION_DATA.length; pi++) {
					const p = REGION_DATA[pi];
					if (p.name === "全国") continue;
					if (!addr.includes(p.name.replace(/[省市]$/, ""))) continue;
					currentProvince.value = p.name;
					let ci = 0;
					for (let cj = 0; cj < p.cities.length; cj++) {
						if (addr.includes(p.cities[cj].name)) {
							ci = cj;
							break;
						}
					}
					const c = p.cities[ci];
					currentCity.value = c.name !== "不限" ? c.name : "";
					currentDistrict.value = "";
					let di = 0;
					if (c) {
						for (let dk = 0; dk < c.districts.length; dk++) {
							if (c.districts[dk] !== "不限" && addr.includes(c.districts[dk])) {
								currentDistrict.value = c.districts[dk];
								di = dk;
								break;
							}
						}
					}
					regionPickValue.value = [pi, ci, di];
					displayRegion.value = buildDisplayRegion();
					found = true;
					break;
				}
				if (!found) {
					currentProvince.value = "";
					currentCity.value = addr.slice(0, 10) || "已选择";
					currentDistrict.value = "";
					regionPickValue.value = [0, 0, 0];
					displayRegion.value = currentCity.value;
				}
				uni.setStorageSync("venueProvince", currentProvince.value);
				uni.setStorageSync("venueCity", currentCity.value);
				uni.setStorageSync("venueDistrict", currentDistrict.value);
				fetchVenues();
			},
			fail: () => {
				const cached = uni.getStorageSync("venueCity") as string;
				currentCity.value = cached || "全国";
			},
		});
	}

	async function fetchVenues(): Promise<void> {
		page.value = 1;
		firstLoad.value = false;
		try {
			const params: Record<string, any> = { page: 1, pageSize: 15 };
			if (keyword.value) params.keyword = keyword.value;
			if (currentCity.value && currentCity.value !== "全国") params.city = currentCity.value;
			const res = await venueApi.list(params);
			venues.value = res.data.list;
			hasMore.value = res.data.list.length >= 15;
		} catch (_) {
			/* ignore */
		}
	}

	async function loadMore(): Promise<void> {
		page.value++;
		try {
			const params: Record<string, any> = { page: page.value, pageSize: 15 };
			if (keyword.value) params.keyword = keyword.value;
			if (currentCity.value && currentCity.value !== "全国") params.city = currentCity.value;
			const res = await venueApi.list(params);
			venues.value.push(...res.data.list);
			hasMore.value = res.data.list.length >= 15;
		} catch (_) {
			/* ignore */
		}
	}

	onMounted(() => {
		const cached = uni.getStorageSync("venueCity") as string;
		currentCity.value = cached || "";
		fetchVenues();
	});
</script>

<style scoped>
	.page {
		padding: 0;
		background: #f5f5f5;
		min-height: 100vh;
	}
	.search-bar {
		display: flex;
		flex-direction: column;
		padding: 10px 14px;
		background: #fff;
		gap: 8px;
	}
	.search-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.clear-btn {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		color: #999;
		flex-shrink: 0;
	}
	.city-bar {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.location-tag {
		display: flex;
		align-items: center;
		background: #f5f5f5;
		padding: 6px 10px;
		border-radius: 6px;
		flex-shrink: 0;
	}
	.location-icon {
		font-size: 12px;
		margin-right: 2px;
	}
	.location-text {
		font-size: 12px;
		color: #333;
		max-width: 60px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.city-picker {
		flex: 1;
	}
	.city-pick-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #f5f5f5;
		border-radius: 6px;
		padding: 6px 10px;
		font-size: 12px;
		color: #333;
	}
	.pick-arrow {
		font-size: 10px;
		color: #999;
		margin-left: 2px;
	}
	.search-input {
		flex: 1;
		height: 36px;
		background: #f5f5f5;
		border-radius: 6px;
		padding: 0 10px;
		font-size: 13px;
	}
	.venue-list {
		padding: 10px;
	}
	.venue-card {
		display: flex;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		margin-bottom: 10px;
	}
	.venue-cover {
		width: 110px;
		height: 90px;
		flex-shrink: 0;
	}
	.venue-info {
		flex: 1;
		padding: 8px 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.venue-name {
		font-size: 15px;
		font-weight: 600;
		color: #333;
	}
	.venue-addr {
		font-size: 12px;
		color: #888;
		margin: 3px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.venue-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2px;
	}
	.venue-city {
		font-size: 11px;
		color: #aaa;
	}
	.venue-rating {
		font-size: 12px;
		color: #f0ad4e;
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
		font-size: 14px;
	}
	.load-more {
		text-align: center;
		padding: 14px;
		color: #409eff;
		font-size: 13px;
	}
</style>
