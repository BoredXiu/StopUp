<template>
	<view class="page">
		<view class="hero-section">
			<view class="hero-title">找到你的运动搭子</view>
			<view class="hero-subtitle">随时随地，拼一场球局</view>
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
			</view>
			<view class="search-bar">
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索场局、运动类型..."
					confirm-type="search"
					@confirm="goSearch"
				/>
				<text
					class="search-btn"
					@tap="goSearch"
					>搜索</text
				>
			</view>
			<scroll-view
				scroll-x
				class="sport-tags"
			>
				<view
					v-for="sport in sports"
					:key="sport.id"
					class="sport-tag"
					:class="{ active: activeSport === sport.id }"
					@tap="filterBySport(sport)"
				>
					{{ sport.icon }} {{ sport.name }}
				</view>
			</scroll-view>
		</view>

		<view
			class="section"
			v-if="featuredMatches.length"
		>
			<view class="section-header">
				<text class="section-title">推荐场局</text>
				<text
					class="section-more"
					@tap="goSearch"
					>更多 →</text
				>
			</view>
			<scroll-view
				scroll-x
				class="match-scroll"
			>
				<view
					v-for="match in featuredMatches"
					:key="match.id"
					class="match-card"
					@tap="goMatch(match.id)"
				>
					<image
						:src="match.coverImage || getVenueImage(match.id)"
						class="match-cover"
						mode="aspectFill"
					/>
					<view class="match-info">
						<text class="match-title">{{ match.title }}</text>
						<text class="match-meta">{{ match.sportName }} · {{ match.venueCity || match.city }}</text>
						<view class="match-footer">
							<text class="match-date">{{ match.matchDate }} {{ match.startTime }}</text>
							<text class="match-price">
								<template v-if="match.feeType === 3">免费</template>
								<template v-else>¥{{ match.perPersonFee || 0 }}/人</template>
							</text>
						</view>
						<view class="match-footer">
							<text class="match-time">{{ match.startTime }} - {{ match.endTime }}</text>
							<text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}人</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="section">
			<view class="section-header">
				<text class="section-title">最新场局</text>
				<text
					class="section-more"
					@tap="goSearch"
					>更多 →</text
				>
			</view>
			<view class="match-list">
				<view
					v-for="match in latestMatches"
					:key="match.id"
					class="match-item"
					@tap="goMatch(match.id)"
				>
					<image
						:src="match.coverImage || getVenueImage(match.id)"
						class="match-thumb"
						mode="aspectFill"
					/>
					<view class="match-body">
						<text class="match-title">{{ match.title }}</text>
						<text class="match-meta">{{ match.sportName }} · {{ match.venueName || match.venueCity || match.city }}</text>
						<text class="match-date">{{ match.matchDate }} {{ match.startTime }} - {{ match.endTime }}</text>
					</view>
					<view class="match-right">
						<text class="match-price">
								<template v-if="match.feeType === 3">免费</template>
								<template v-else>¥{{ match.perPersonFee || 0 }}</template>
							</text>
						<text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}人</text>
						<text
							class="match-status"
							:class="match.status === 1 ? 'open' : ''"
						>
							{{ match.status === 1 ? "报名中" : "已满员" }}
						</text>
					</view>
				</view>
			</view>
		</view>

		<view
			class="section"
			v-if="hotVenues.length"
		>
			<view class="section-header">
				<text class="section-title">热门场馆</text>
				<text
					class="section-more"
					@tap="goVenues"
					>更多 →</text
				>
			</view>
			<scroll-view
				scroll-x
				class="venue-scroll"
			>
				<view
					v-for="venue in hotVenues"
					:key="venue.id"
					class="venue-card"
					@tap="goVenue(venue.id)"
				>
					<image
						:src="venue.coverImage || getVenueImage(venue.id)"
						class="venue-cover"
						mode="aspectFill"
					/>
					<text class="venue-name">{{ venue.name }}</text>
					<text class="venue-addr">{{ venue.district || venue.city }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { matchApi, venueApi, sportApi } from "@/api";
import { getFeeTypeText } from "@/utils/format";
import type { Sport, Match, Venue } from "@/types";
	import { REGION_DATA } from "@/data/regions";

	const MOCK_SPORTS: Sport[] = [
		{ id: 1, name: "篮球", icon: "🏀", status: 1 },
		{ id: 2, name: "足球", icon: "⚽", status: 1 },
		{ id: 3, name: "羽毛球", icon: "🏸", status: 1 },
		{ id: 4, name: "网球", icon: "🎾", status: 1 },
		{ id: 5, name: "乒乓球", icon: "🏓", status: 1 },
		{ id: 6, name: "排球", icon: "🏐", status: 1 },
		{ id: 7, name: "游泳", icon: "🏊", status: 1 },
		{ id: 8, name: "跑步", icon: "🏃", status: 1 },
	];

	function generateMockMatches(isFeatured: boolean): Match[] {
		const titles = [
			"周末篮球3v3",
			"周五羽毛球双打",
			"晚间足球友谊赛",
			"网球单打挑战",
			"乒乓对抗赛",
			"排球娱乐局",
			"晨跑打卡",
			"游泳训练",
			"篮球全场对抗",
			"足球五人制",
			"羽毛球混双",
			"网球双打赛",
		];
		const sportNames = ["篮球", "足球", "羽毛球", "网球", "乒乓球", "排球", "跑步", "游泳"];
		const venueNames = ["星海体育中心", "阳光运动馆", "奥体中心", "城市运动公园", "大学城体育馆", "社区运动场"];
		const cities = currentCity.value ? [currentCity.value] : ["北京", "上海", "广州", "深圳"];

		const date = new Date();
		const list: Match[] = [];
		for (let i = 0; i < 8; i++) {
			date.setDate(date.getDate() + Math.floor(Math.random() * 7));
			const sportIdx = i % sportNames.length;
			const totalPlayers = [2, 3, 4, 5, 6, 10, 12][i % 7] * 2;
			const currentPlayers = Math.floor(Math.random() * (totalPlayers - 1)) + 1;
			list.push({
				id: (isFeatured ? 1000 : 2000) + i,
				title: titles[i % titles.length],
				sportId: i + 1,
				sportName: sportNames[sportIdx],
				sportIcon: MOCK_SPORTS[sportIdx].icon,
				venueId: i + 1,
				venueName: venueNames[i % venueNames.length],
				venueAddress: cities[i % cities.length] + "某区某路" + (i + 1) + "号",
				venueCity: cities[i % cities.length],
				creatorId: 1,
				creatorNickname: "发起人" + (i + 1),
				creatorAvatar: "",
				matchDate: date.toISOString().slice(0, 10),
				startTime: (14 + (i % 4)).toString().padStart(2, "0") + ":00",
				endTime: (16 + (i % 4)).toString().padStart(2, "0") + ":00",
				maxPlayers: totalPlayers,
				minPlayers: 4,
				currentPlayers: currentPlayers,
				feeType: 1,
				totalFee: 0,
				perPersonFee: [0, 20, 30, 50, 15, 25, 0, 40][i % 8],
				levelRequired: 0,
				genderRequired: 0,
				description: "一起来运动吧！",
				coverImage: "",
				status: 1,
				cancelReason: "",
				isFeatured: isFeatured ? 1 : 0,
				viewCount: Math.floor(Math.random() * 200),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}
		return list;
	}

	function generateMockVenues(): Venue[] {
		const names = ["星海体育中心", "阳光运动馆", "奥体中心", "城市运动公园", "大学城体育馆", "社区运动场"];
		const districts = ["朝阳区", "海淀区", "浦东新区", "天河区", "南山区", "西湖区"];
		const cities = currentCity.value ? [currentCity.value] : ["北京", "上海", "广州", "深圳", "杭州", "成都"];

		return names.map((name, i) => ({
			id: i + 1,
			name,
			address: cities[i] + districts[i] + (i + 1) + "号",
			city: cities[i],
			district: districts[i],
			latitude: 39.9 + i * 0.01,
			longitude: 116.4 + i * 0.01,
			phone: "010-1234567" + i,
			businessHours: "08:00-22:00",
			description: "设施齐全的运动场馆",
			facilities: ["停车场", "更衣室", "淋浴"],
			coverImage: "",
			rating: 4.0 + i * 0.1,
			matchCount: Math.floor(Math.random() * 50) + 10,
			isHot: 1,
			status: 1,
		}));
	}

	const VENUE_PICS = [
		"https://picsum.photos/seed/court1/400/300",
		"https://picsum.photos/seed/court2/400/300",
		"https://picsum.photos/seed/court3/400/300",
		"https://picsum.photos/seed/court4/400/300",
		"https://picsum.photos/seed/court5/400/300",
		"https://picsum.photos/seed/court6/400/300",
		"https://picsum.photos/seed/court7/400/300",
		"https://picsum.photos/seed/court8/400/300",
		"https://picsum.photos/seed/court9/400/300",
		"https://picsum.photos/seed/court10/400/300",
	];

	function getVenueImage(seed: number): string {
		return VENUE_PICS[seed % VENUE_PICS.length];
	}

	const keyword = ref("");
	const activeSport = ref<number | null>(null);
	const sports = ref<Sport[]>([]);
	const featuredMatches = ref<Match[]>([]);
	const latestMatches = ref<Match[]>([]);
	const hotVenues = ref<Venue[]>([]);
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
		uni.setStorageSync("currentProvince", currentProvince.value);
		uni.setStorageSync("currentCity", currentCity.value);
		uni.setStorageSync("currentDistrict", currentDistrict.value);
		loadData();
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

	function goSearch(): void {
		loadData(keyword.value);
	}
	function goMatch(id: number): void {
		uni.navigateTo({ url: "/subpkg/match/detail?id=" + id });
	}
	function goVenue(id: number): void {
		uni.navigateTo({ url: "/subpkg/venue/detail?id=" + id });
	}
	function goVenues(): void {
		uni.switchTab({ url: "/pages/venue/list" });
	}
	function filterBySport(sport: Sport): void {
		if (activeSport.value === sport.id) {
			activeSport.value = null;
			keyword.value = "";
		} else {
			activeSport.value = sport.id;
			keyword.value = sport.name;
		}
		loadData();
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
				uni.setStorageSync("currentProvince", currentProvince.value);
				uni.setStorageSync("currentCity", currentCity.value);
				uni.setStorageSync("currentDistrict", currentDistrict.value);
				loadData();
			},
			fail: () => {
				initLocation();
			},
		});
	}

	function initLocation(): void {
		const cachedCity = uni.getStorageSync("currentCity") as string;
		const cachedDist = uni.getStorageSync("currentDistrict") as string;
		if (cachedCity) {
			currentCity.value = cachedCity;
			currentDistrict.value = cachedDist || "";
			return;
		}
		uni.getLocation({
			type: "gcj02",
			success: () => {
				currentCity.value = "北京";
				uni.setStorageSync("currentCity", "北京");
			},
			fail: () => {
				currentCity.value = "";
				uni.setStorageSync("currentCity", "");
			},
		});
	}

	async function loadData(keywordParam?: string): Promise<void> {
		const params: Record<string, any> = { pageSize: 8 };
		if (currentCity.value) {
			params.city = currentCity.value;
		}
		if (currentDistrict.value) {
			params.district = currentDistrict.value;
		}
		if (keywordParam) {
			params.keyword = keywordParam;
		}
		if (activeSport.value) {
			params.sportId = activeSport.value;
		}

		try {
			const [featuredRes, latestRes, hotRes, sportRes] = await Promise.all([
				matchApi.list({ ...params, isFeatured: 1, status: 1 }),
				matchApi.list({ ...params, status: 1, orderBy: "created_at" }),
				venueApi.list({ ...params, isHot: 1, pageSize: 6 }),
				sportApi.getAll(),
			]);

			featuredMatches.value = featuredRes.data.list;
			latestMatches.value = latestRes.data.list;
			hotVenues.value = hotRes.data.list;
			sports.value = sportRes.data as Sport[];
		} catch (_) {
			featuredMatches.value = generateMockMatches(true);
			latestMatches.value = generateMockMatches(false);
			hotVenues.value = generateMockVenues();
			sports.value = MOCK_SPORTS;
		}

		if (activeSport.value) {
			featuredMatches.value = featuredMatches.value.filter((m) => m.sportId === activeSport.value);
			latestMatches.value = latestMatches.value.filter((m) => m.sportId === activeSport.value);
		}
	}

	onMounted(() => {
		initLocation();
		loadData();
	});

	let lastToken = uni.getStorageSync("token") || "";
	onShow(() => {
		const currentToken = uni.getStorageSync("token") || "";
		if (currentToken !== lastToken) {
			lastToken = currentToken;
			initLocation();
			loadData();
		}
	});
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f0f2f5;
	}
	.hero-section {
		background: linear-gradient(160deg, #5b9cf5 0%, #409eff 40%, #2c6fce 100%);
		padding: 28px 20px 26px;
		margin: 12px 14px 0;
		color: #fff;
		border-radius: 20px;
		overflow: hidden;
		position: relative;
		box-shadow: 0 6px 24px rgba(64, 158, 255, 0.25);
	}
	.hero-section::after {
		content: "";
		position: absolute;
		top: -50px;
		right: -50px;
		width: 180px;
		height: 180px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 50%;
	}
	.hero-section::before {
		content: "";
		position: absolute;
		bottom: -30px;
		left: 20px;
		width: 100px;
		height: 100px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 50%;
	}
	.hero-title {
		font-size: 24px;
		font-weight: 700;
		letter-spacing: 1px;
	}
	.hero-subtitle {
		font-size: 14px;
		opacity: 0.75;
		margin-top: 4px;
		margin-bottom: 16px;
		letter-spacing: 0.5px;
	}
	.city-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 14px 0;
	}
	.location-tag {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.16);
		border-radius: 20px;
		padding: 7px 14px;
		backdrop-filter: blur(10px);
	}
	.location-icon {
		margin-right: 4px;
		font-size: 14px;
	}
	.location-text {
		font-size: 13px;
	}
	.city-picker {
		flex: 1;
	}
	.city-pick-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.16);
		border-radius: 20px;
		padding: 7px 14px;
		font-size: 13px;
	}
	.pick-arrow {
		font-size: 12px;
		opacity: 0.5;
	}
	.search-bar {
		display: flex;
		background: #fff;
		border-radius: 24px;
		padding: 3px;
		margin-bottom: 14px;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
	}
	.search-input {
		flex: 1;
		height: 40px;
		padding: 0 16px;
		font-size: 14px;
		color: #333;
		background: transparent;
	}
	.search-btn {
		background: linear-gradient(135deg, #409eff, #337ecc);
		color: #fff;
		padding: 0 22px;
		border-radius: 22px;
		font-size: 14px;
		line-height: 40px;
		height: 40px;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
	}
	.sport-tags {
		white-space: nowrap;
		padding-bottom: 4px;
	}
	.sport-tag {
		display: inline-block;
		padding: 6px 18px;
		border-radius: 18px;
		background: rgba(255, 255, 255, 0.18);
		margin-right: 10px;
		font-size: 13px;
		color: #fff;
		transition: all 0.2s;
	}
	.sport-tag.active {
		background: rgba(255, 255, 255, 0.95);
		color: #409eff;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.section {
		padding: 18px 16px;
	}
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.section-title {
		font-size: 18px;
		font-weight: 700;
		color: #1a1a1a;
	}
	.section-more {
		font-size: 13px;
		color: #409eff;
	}
	.match-scroll {
		white-space: nowrap;
	}
	.match-card {
		display: inline-block;
		width: 220px;
		background: #fff;
		border-radius: 12px;
		overflow: hidden;
		margin-right: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	.match-cover {
		width: 220px;
		height: 130px;
	}
	.match-info {
		padding: 10px 12px;
	}
	.match-title {
		font-size: 14px;
		font-weight: 600;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #333;
	}
	.match-meta {
		font-size: 12px;
		color: #888;
		display: block;
		margin: 3px 0;
	}
	.match-footer {
		display: flex;
		justify-content: space-between;
		margin-top: 3px;
		font-size: 12px;
	}
	.match-price {
		color: #f56c6c;
		font-weight: 600;
	}
	.match-count {
		color: #888;
	}
	.match-time {
		color: #409eff;
		font-size: 11px;
	}
	.match-list {
		background: #fff;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	}
	.match-item {
		display: flex;
		padding: 12px 10px;
		border-bottom: 1px solid #f0f2f5;
		align-items: center;
	}
	.match-thumb {
		width: 70px;
		height: 55px;
		border-radius: 8px;
		margin-right: 10px;
		flex-shrink: 0;
	}
	.match-body {
		flex: 1;
		min-width: 0;
	}
	.match-right {
		text-align: right;
		flex-shrink: 0;
		margin-left: 8px;
	}
	.match-status {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		background: #f0f0f0;
		color: #999;
		display: inline-block;
		margin-top: 3px;
	}
	.match-status.open {
		background: #ecf5ff;
		color: #409eff;
	}
	.venue-scroll {
		white-space: nowrap;
	}
	.venue-card {
		display: inline-block;
		width: 140px;
		text-align: center;
		margin-right: 12px;
	}
	.venue-cover {
		width: 140px;
		height: 90px;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
	.venue-name {
		font-size: 13px;
		font-weight: 600;
		display: block;
		margin-top: 6px;
		color: #333;
	}
	.venue-addr {
		font-size: 11px;
		color: #999;
	}
</style>
