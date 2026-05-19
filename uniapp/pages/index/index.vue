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
					<text class="location-text">{{ currentDistrict || currentCity || "点击定位" }}</text>
				</view>
				<picker
					class="city-picker"
					mode="multiSelector"
					:range="cityPickRange"
					:value="cityPickValue"
					@change="onCityPick"
					@columnchange="onCityColumnChange"
				>
					<view class="city-pick-trigger">
						<text>{{ currentDistrict || currentCity || "选择区域" }}</text>
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
							<text class="match-price">¥{{ match.perPersonFee || 0 }}/人</text>
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
						<text class="match-price">¥{{ match.perPersonFee || 0 }}</text>
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
	import { matchApi, venueApi, sportApi } from "@/api";
	import type { Sport, Match, Venue } from "@/types";

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
	const cityPickValue = ref([0, 0]);

	const CITY_DATA: { city: string; districts: string[] }[] = [
		{ city: "全国", districts: ["不限"] },
		{
			city: "北京",
			districts: [
				"不限",
				"东城区",
				"西城区",
				"朝阳区",
				"海淀区",
				"丰台区",
				"石景山区",
				"通州区",
				"大兴区",
				"顺义区",
				"房山区",
				"昌平区",
				"密云区",
				"延庆区",
				"平谷区",
				"怀柔区",
				"门头沟区",
			],
		},
		{
			city: "上海",
			districts: [
				"不限",
				"黄浦区",
				"徐汇区",
				"长宁区",
				"静安区",
				"普陀区",
				"虹口区",
				"杨浦区",
				"浦东新区",
				"闵行区",
				"宝山区",
				"嘉定区",
				"松江区",
				"青浦区",
				"奉贤区",
				"金山区",
				"崇明区",
			],
		},
		{ city: "广州", districts: ["不限", "越秀区", "海珠区", "荔湾区", "天河区", "白云区", "黄埔区", "番禺区", "花都区", "南沙区", "从化区", "增城区"] },
		{ city: "深圳", districts: ["不限", "福田区", "罗湖区", "南山区", "宝安区", "龙岗区", "龙华区", "光明区", "坪山区", "盐田区", "大鹏新区"] },
		{
			city: "杭州",
			districts: ["不限", "上城区", "拱墅区", "西湖区", "滨江区", "萧山区", "余杭区", "临平区", "钱塘区", "富阳区", "临安区", "桐庐县", "淳安县", "建德市"],
		},
		{
			city: "成都",
			districts: [
				"不限",
				"锦江区",
				"青羊区",
				"金牛区",
				"武侯区",
				"成华区",
				"龙泉驿区",
				"青白江区",
				"新都区",
				"温江区",
				"双流区",
				"郫都区",
				"新津区",
				"都江堰市",
				"彭州市",
				"邛崃市",
				"崇州市",
				"简阳市",
				"金堂县",
				"大邑县",
				"蒲江县",
			],
		},
		{
			city: "武汉",
			districts: ["不限", "江岸区", "江汉区", "硚口区", "汉阳区", "武昌区", "洪山区", "青山区", "东西湖区", "汉南区", "蔡甸区", "江夏区", "黄陂区", "新洲区"],
		},
		{ city: "南京", districts: ["不限", "玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区", "六合区", "溧水区", "高淳区"] },
		{
			city: "重庆",
			districts: [
				"不限",
				"渝中区",
				"江北区",
				"南岸区",
				"沙坪坝区",
				"九龙坡区",
				"大渡口区",
				"渝北区",
				"巴南区",
				"北碚区",
				"万州区",
				"涪陵区",
				"黔江区",
				"长寿区",
				"江津区",
				"合川区",
				"永川区",
				"璧山区",
				"铜梁区",
				"潼南区",
				"荣昌区",
			],
		},
		{
			city: "西安",
			districts: ["不限", "新城区", "碑林区", "莲湖区", "灞桥区", "未央区", "雁塔区", "阎良区", "临潼区", "长安区", "高陵区", "鄠邑区", "蓝田县", "周至县"],
		},
		{
			city: "天津",
			districts: [
				"不限",
				"和平区",
				"河东区",
				"河西区",
				"南开区",
				"河北区",
				"红桥区",
				"东丽区",
				"西青区",
				"津南区",
				"北辰区",
				"武清区",
				"宝坻区",
				"宁河区",
				"静海区",
				"蓟州区",
				"滨海新区",
			],
		},
		{ city: "苏州", districts: ["不限", "姑苏区", "吴中区", "相城区", "吴江区", "虎丘区", "常熟市", "张家港市", "昆山市", "太仓市"] },
		{ city: "长沙", districts: ["不限", "芙蓉区", "天心区", "岳麓区", "开福区", "雨花区", "望城区", "长沙县", "浏阳市", "宁乡市"] },
		{
			city: "郑州",
			districts: ["不限", "中原区", "二七区", "管城回族区", "金水区", "上街区", "惠济区", "巩义市", "荥阳市", "新密市", "新郑市", "登封市", "中牟县"],
		},
		{ city: "东莞", districts: ["不限", "莞城街道", "东城街道", "南城街道", "万江街道", "虎门镇", "长安镇", "厚街镇", "大朗镇", "塘厦镇", "常平镇"] },
		{ city: "青岛", districts: ["不限", "市南区", "市北区", "黄岛区", "崂山区", "李沧区", "城阳区", "即墨区", "胶州市", "平度市", "莱西市"] },
		{ city: "厦门", districts: ["不限", "思明区", "湖里区", "集美区", "海沧区", "同安区", "翔安区"] },
		{ city: "合肥", districts: ["不限", "瑶海区", "庐阳区", "蜀山区", "包河区", "肥东县", "肥西县", "长丰县", "庐江县", "巢湖市"] },
		{ city: "佛山", districts: ["不限", "禅城区", "南海区", "顺德区", "高明区", "三水区"] },
		{ city: "宁波", districts: ["不限", "海曙区", "江北区", "北仑区", "镇海区", "鄞州区", "奉化区", "余姚市", "慈溪市", "象山县", "宁海县"] },
	];

	const cityPickRange = computed(() => {
		const cityNames = CITY_DATA.map((c) => c.city);
		const districts = CITY_DATA[cityPickValue.value[0]]?.districts || ["不限"];
		return [cityNames, districts];
	});

	function onCityPick(e: any): void {
		const cityIdx = e.detail.value[0];
		const districtIdx = e.detail.value[1];
		const city = CITY_DATA[cityIdx]?.city || "";
		const district = CITY_DATA[cityIdx]?.districts?.[districtIdx] || "";
		if (city === "全国" || !city) {
			currentCity.value = "";
			currentDistrict.value = "";
		} else {
			currentCity.value = city;
			currentDistrict.value = district === "不限" ? "" : district;
		}
		cityPickValue.value = [cityIdx, districtIdx];
		uni.setStorageSync("currentCity", currentCity.value);
		uni.setStorageSync("currentDistrict", currentDistrict.value);
		loadData();
	}

	function onCityColumnChange(e: any): void {
		if (e.detail.column === 0) {
			cityPickValue.value = [e.detail.value, 0];
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
				for (const c of CITY_DATA) {
					if (c.city === "全国") continue;
					if (addr.includes(c.city)) {
						currentCity.value = c.city;
						currentDistrict.value = "";
						const ci = CITY_DATA.indexOf(c);
						cityPickValue.value = [ci, 0];
						for (const d of c.districts) {
							if (d !== "不限" && addr.includes(d)) {
								currentDistrict.value = d;
								const di = c.districts.indexOf(d);
								cityPickValue.value = [ci, di];
								break;
							}
						}
						break;
					}
				}
				if (!currentCity.value) {
					currentCity.value = addr.slice(0, 10) || "已选择";
					currentDistrict.value = "";
					cityPickValue.value = [0, 0];
				}
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
