<template>
	<div class="home-page">
		<section class="hero-section">
			<div class="container">
				<h1 class="hero-title">找到你的运动搭子</h1>
				<p class="hero-subtitle">随时随地，拼一场球局</p>
				<div class="hero-bar">
					<el-button
						link
						class="city-locate-btn"
						@click="detectCity"
						:loading="cityDetecting"
					>
						<el-icon><Location /></el-icon>
						{{ currentCity || "点击定位" }}
					</el-button>
					<el-select
						v-model="currentCity"
						placeholder="选择城市"
						clearable
						@change="onCityChange"
						size="small"
						class="city-select"
					>
						<el-option
							v-for="c in cityOptions"
							:key="c"
							:label="c"
							:value="c === '全国' ? '' : c"
						/>
					</el-select>
					<el-input
						v-model="searchKeyword"
						placeholder="搜索球局、运动类型..."
						:prefix-icon="Search"
						@keyup.enter="goSearch"
						clearable
						class="hero-search-input"
					>
						<template #append>
							<el-button
								type="primary"
								@click="goSearch"
								class="hero-search-btn"
								>搜索</el-button
							>
						</template>
					</el-input>
				</div>
				<div class="sport-quick-tags">
					<span
						v-for="sport in sports"
						:key="sport.id"
						class="quick-tag"
						:class="{ active: activeSport === sport.id }"
						@click="filterBySport(sport.id)"
					>
						{{ sport.name }}
					</span>
				</div>
			</div>
		</section>

		<div class="container">
			<section
				class="section"
				v-if="featuredMatches.length > 0"
			>
				<div class="section-header">
					<h2>推荐球局</h2>
					<el-button
						link
						type="primary"
						@click="$router.push('/search')"
						>查看更多</el-button
					>
				</div>
				<div class="match-grid">
					<MatchCard
						v-for="match in featuredMatches"
						:key="match.id"
						:match="match"
					/>
				</div>
			</section>

			<section class="section">
				<div class="section-header">
					<h2>最新球局</h2>
					<div class="filter-tabs">
						<span
							v-for="sport in [{ id: 0, name: '全部' }, ...sports.slice(0, 6)]"
							:key="sport.id"
							class="filter-tab"
							:class="{ active: activeSport === sport.id }"
							@click="filterBySport(sport.id)"
						>
							{{ sport.name }}
						</span>
					</div>
				</div>
				<div class="match-grid">
					<MatchCard
						v-for="match in matches"
						:key="match.id"
						:match="match"
					/>
				</div>
				<div
					class="load-more"
					v-if="total > matches.length"
				>
					<el-button
						@click="loadMore"
						:loading="loading"
						>加载更多</el-button
					>
				</div>
			</section>

			<section
				class="section"
				v-if="hotVenues.length > 0"
			>
				<div class="section-header">
					<h2>热门场馆</h2>
					<el-button
						link
						type="primary"
						@click="$router.push('/venues')"
						>查看全部</el-button
					>
				</div>
				<div class="venue-grid">
					<div
						v-for="venue in hotVenues"
						:key="venue.id"
						class="venue-card"
						@click="$router.push(`/venues/${venue.id}`)"
					>
						<div class="venue-cover">
							<img
								:src="venue.coverImage || getVenueImage(venue.id)"
								:alt="venue.name"
							/>
						</div>
						<div class="venue-info">
							<h4>{{ venue.name }}</h4>
							<p class="venue-address text-ellipsis">{{ venue.address }}</p>
							<div class="venue-meta">
								<span>⭐ {{ venue.rating }}</span>
								<span>{{ venue.matchCount }}场球局</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import { ElMessage } from "element-plus";
	import { Search, Location } from "@element-plus/icons-vue";
	import { matchApi, venueApi, sportApi } from "@/api";
	import type { Match, Venue, Sport } from "@/types";
	import MatchCard from "@/components/MatchCard.vue";

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

	const router = useRouter();
	const searchKeyword = ref("");
	const activeSport = ref(0);
	const currentCity = ref("");
	const cityDetecting = ref(false);
	const sports = ref<Sport[]>([]);
	const matches = ref<Match[]>([]);
	const featuredMatches = ref<Match[]>([]);
	const hotVenues = ref<Venue[]>([]);
	const loading = ref(false);
	const page = ref(1);
	const total = ref(0);

	const cityOptions = [
		"全国",
		"北京",
		"上海",
		"广州",
		"深圳",
		"杭州",
		"成都",
		"武汉",
		"南京",
		"重庆",
		"西安",
		"天津",
		"苏州",
		"长沙",
		"郑州",
		"东莞",
		"青岛",
		"厦门",
		"合肥",
		"佛山",
		"宁波",
	];

	function goSearch() {
		const query: Record<string, string | undefined> = { keyword: searchKeyword.value || undefined, city: currentCity.value || undefined };
		if (activeSport.value > 0) query.sportId = String(activeSport.value);
		router.push({ name: "Search", query });
	}

	function filterBySport(sportId: number) {
		activeSport.value = sportId;
		page.value = 1;
		matches.value = [];
		fetchMatches();
	}

	function onCityChange() {
		page.value = 1;
		matches.value = [];
		fetchMatches();
	}

	async function detectCity() {
		if (!navigator.geolocation) {
			ElMessage.warning("浏览器不支持定位功能");
			return;
		}
		cityDetecting.value = true;
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
			});
			const { latitude, longitude } = position.coords;
			const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&accept-language=zh`);
			const data = await res.json();
			const addr = data.address || {};
			const province = addr.province || "";
			const cityPart = addr.city || addr.town || "";
			const district = addr.district || addr.county || "";
			const displayCity = district && cityPart ? `${cityPart}${district}` : cityPart || district || province || "";
			const match = displayCity.match(/(北京|上海|广州|深圳|杭州|成都|武汉|南京|重庆|西安|天津|苏州|长沙|郑州|东莞|青岛|厦门|合肥|佛山|宁波)(.+)?/);
			currentCity.value = match ? match[0] : displayCity || "北京";
			onCityChange();
		} catch {
			currentCity.value = "北京";
			onCityChange();
		} finally {
			cityDetecting.value = false;
		}
	}

	async function fetchMatches() {
		loading.value = true;
		try {
			const params: any = { page: page.value, pageSize: 12, status: 1 };
			if (activeSport.value > 0) params.sportId = activeSport.value;
			if (currentCity.value) params.city = currentCity.value;
			const res = await matchApi.list(params);
			if (page.value === 1) {
				matches.value = res.data.list;
			} else {
				matches.value.push(...res.data.list);
			}
			total.value = res.data.pagination.total;
		} finally {
			loading.value = false;
		}
	}

	function loadMore() {
		page.value++;
		fetchMatches();
	}

	onMounted(async () => {
		const [sportsRes, featuredRes, hotVenuesRes] = await Promise.all([
			sportApi.getAll(),
			matchApi.list({ pageSize: 4, isFeatured: 1, status: 1 }),
			venueApi.getHot(4),
		]);
		sports.value = sportsRes.data;
		featuredMatches.value = featuredRes.data.list;
		hotVenues.value = hotVenuesRes.data;
		fetchMatches();
	});
</script>

<style scoped>
	.hero-section {
		background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
		padding: 60px 0 40px;
		text-align: center;
		color: #fff;
	}
	.hero-title {
		font-size: 36px;
		font-weight: 700;
		margin-bottom: 8px;
	}
	.hero-subtitle {
		font-size: 16px;
		opacity: 0.9;
		margin-bottom: 16px;
	}
	.hero-bar {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: nowrap;
	}
	.hero-bar :deep(.el-select) {
		height: 40px;
	}
	.hero-bar :deep(.el-select .el-input__wrapper) {
		height: 40px;
	}
	.city-locate-btn {
		color: #fff;
		font-size: 14px;
		padding: 4px 16px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.15);
		flex-shrink: 0;
		height: 40px;
	}
	.city-locate-btn:hover {
		background: rgba(255, 255, 255, 0.25);
	}
	.city-select {
		width: 110px;
		flex-shrink: 0;
	}
	.hero-search-input {
		max-width: 360px;
		flex: 1;
		min-width: 0;
	}
	.hero-search-btn {
		height: 40px;
	}
	.sport-quick-tags {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	.quick-tag {
		padding: 4px 16px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.2);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.quick-tag:hover,
	.quick-tag.active {
		background: rgba(255, 255, 255, 0.35);
	}
	.section {
		margin-top: 40px;
	}
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}
	.section-header h2 {
		font-size: 20px;
		font-weight: 700;
	}
	.filter-tabs {
		display: flex;
		gap: 4px;
	}
	.filter-tab {
		padding: 4px 14px;
		border-radius: 16px;
		font-size: 13px;
		color: var(--text-regular);
		cursor: pointer;
		transition: all 0.2s;
	}
	.filter-tab:hover,
	.filter-tab.active {
		color: var(--primary-color);
		background: #ecf5ff;
	}
	.match-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}
	@media (max-width: 1024px) {
		.match-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (max-width: 768px) {
		.match-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 480px) {
		.match-grid {
			grid-template-columns: 1fr;
		}
	}
	.load-more {
		text-align: center;
		margin-top: 24px;
	}
	.venue-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}
	.venue-card {
		background: #fff;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s;
		border: 1px solid var(--border-color);
	}
	.venue-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}
	.venue-cover {
		height: 140px;
		overflow: hidden;
	}
	.venue-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.venue-info {
		padding: 12px 16px;
	}
	.venue-info h4 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.venue-address {
		font-size: 12px;
		color: var(--text-secondary);
		margin-bottom: 8px;
	}
	.venue-meta {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--text-secondary);
	}
</style>
