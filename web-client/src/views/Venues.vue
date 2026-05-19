<template>
	<div class="venues-page container page-container">
		<div class="page-title">
			<h1>场馆列表</h1>
			<p>发现优质运动场馆</p>
		</div>

		<div class="filter-bar">
			<el-input
				v-model="keyword"
				placeholder="搜索场馆名称或地址"
				:prefix-icon="Search"
				clearable
				@input="handleSearch"
				style="width: 300px"
			/>
			<CascadingCitySelect
				v-model="regionValue"
				storage-key="venue_city"
				@update:model-value="fetchVenues"
			/>
		</div>

		<div
			class="venue-grid"
			v-loading="loading"
		>
			<div
				v-for="venue in venues"
				:key="venue.id"
				class="venue-card"
				@click="$router.push(`/venues/${venue.id}`)"
			>
				<div class="venue-cover">
					<img
						:src="venue.coverImage || getVenueImage(venue.id)"
						:alt="venue.name"
					/>
					<span class="venue-rating">⭐ {{ venue.rating }}</span>
				</div>
				<div class="venue-body">
					<h3>{{ venue.name }}</h3>
					<p class="venue-address">
						<el-icon><Location /></el-icon>
						{{ venue.address }}
					</p>
					<div class="venue-footer">
						<span class="venue-city">{{ venue.city }}{{ venue.district ? " · " + venue.district : "" }}</span>
						<span class="venue-count">{{ venue.matchCount }} 场球局</span>
					</div>
				</div>
			</div>
		</div>

		<div
			class="pagination-wrap"
			v-if="total > pageSize"
		>
			<el-pagination
				v-model:current-page="page"
				:page-size="pageSize"
				:total="total"
				layout="prev, pager, next"
				@current-change="fetchVenues"
			/>
		</div>

		<el-empty
			v-if="!loading && venues.length === 0"
			description="暂无场馆"
		/>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { Search } from "@element-plus/icons-vue";
	import { venueApi } from "@/api";
	import type { Venue } from "@/types";
	import CascadingCitySelect from "@/components/CascadingCitySelect.vue";

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

	const venues = ref<Venue[]>([]);
	const loading = ref(false);
	const keyword = ref("");
	const regionValue = ref("");
	const page = ref(1);
	const pageSize = 12;
	const total = ref(0);

	let searchTimer: ReturnType<typeof setTimeout>;

	function extractCity(region: string): string {
		if (!region) return "";
		const parts = region.split("-");
		if (parts.length >= 2 && parts[1] !== "不限") return parts[1];
		if (parts[0] && parts[0] !== "全国") return parts[0];
		return "";
	}

	function handleSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			page.value = 1;
			fetchVenues();
		}, 300);
	}

	async function fetchVenues() {
		loading.value = true;
		try {
			const res = await venueApi.list({
				page: page.value,
				pageSize,
				keyword: keyword.value || undefined,
				city: extractCity(regionValue.value) || undefined,
			});
			venues.value = res.data.list;
			total.value = res.data.pagination.total;
		} finally {
			loading.value = false;
		}
	}

	onMounted(fetchVenues);
</script>

<style scoped>
	.page-title {
		margin-bottom: 24px;
	}
	.page-title h1 {
		font-size: 24px;
		font-weight: 700;
	}
	.page-title p {
		font-size: 14px;
		color: var(--text-secondary);
		margin-top: 4px;
	}
	.filter-bar {
		display: flex;
		gap: 12px;
		margin-bottom: 24px;
		flex-wrap: nowrap;
		overflow-x: auto;
		align-items: stretch;
	}
	.filter-bar .el-button {
		height: 40px;
	}
	.venue-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
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
		height: 180px;
		position: relative;
		overflow: hidden;
	}
	.venue-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.venue-rating {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		padding: 2px 10px;
		border-radius: 12px;
		font-size: 13px;
	}
	.venue-body {
		padding: 16px;
	}
	.venue-body h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.venue-address {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
	}
	.venue-footer {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: var(--text-secondary);
	}
	.pagination-wrap {
		display: flex;
		justify-content: center;
		margin-top: 32px;
	}
	@media (max-width: 768px) {
		.venue-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 480px) {
		.venue-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
