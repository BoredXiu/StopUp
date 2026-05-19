<template>
	<div class="search-page container page-container">
		<div class="search-header">
			<h1>搜索球局</h1>
			<el-input
				v-model="keyword"
				size="large"
				placeholder="搜索球局标题、描述..."
				:prefix-icon="Search"
				clearable
				@input="handleSearch"
			/>
		</div>

		<div class="search-filters">
			<el-select
				v-model="sportId"
				placeholder="运动类型"
				clearable
				@change="fetchMatches"
				style="width: 140px"
			>
				<el-option
					v-for="s in sports"
					:key="s.id"
					:label="s.name"
					:value="s.id"
				/>
			</el-select>
			<CascadingCitySelect
				v-model="regionValue"
				storage-key="search_city"
				@update:model-value="fetchMatches"
				:compact="false"
			/>
			<el-date-picker
				v-model="date"
				type="date"
				placeholder="选择日期"
				clearable
				@change="fetchMatches"
				style="width: 160px"
			/>
		</div>

		<div
			class="match-grid"
			v-loading="loading"
		>
			<MatchCard
				v-for="match in matches"
				:key="match.id"
				:match="match"
			/>
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
				@current-change="fetchMatches"
			/>
		</div>

		<el-empty
			v-if="!loading && matches.length === 0"
			description="未找到相关球局"
		/>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { useRoute } from "vue-router";
	import { Search } from "@element-plus/icons-vue";
	import { matchApi, sportApi } from "@/api";
	import type { Match, Sport } from "@/types";
	import MatchCard from "@/components/MatchCard.vue";
	import CascadingCitySelect from "@/components/CascadingCitySelect.vue";

	const route = useRoute();
	const keyword = ref((route.query.keyword as string) || "");
	const sportId = ref<number | undefined>(route.query.sportId ? Number(route.query.sportId) : undefined);
	const regionValue = ref((route.query.region as string) || "");
	const date = ref("");
	const sports = ref<Sport[]>([]);
	const matches = ref<Match[]>([]);
	const loading = ref(false);
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
			fetchMatches();
		}, 300);
	}

	async function fetchMatches() {
		loading.value = true;
		try {
			const res = await matchApi.list({
				page: page.value,
				pageSize,
				keyword: keyword.value || undefined,
				sportId: sportId.value,
				city: extractCity(regionValue.value) || undefined,
				date: date.value || undefined,
				status: 1,
			});
			matches.value = res.data.list;
			total.value = res.data.pagination.total;
		} finally {
			loading.value = false;
		}
	}

	onMounted(async () => {
		const res = await sportApi.getAll();
		sports.value = res.data;
		fetchMatches();
	});
</script>

<style scoped>
	.search-header {
		margin-bottom: 20px;
	}
	.search-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 16px;
	}
	.search-filters {
		display: flex;
		gap: 12px;
		margin-bottom: 24px;
		flex-wrap: nowrap;
		overflow-x: auto;
		align-items: stretch;
	}
	.search-filters .el-button {
		height: 40px;
	}
	.match-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
	}
	.pagination-wrap {
		display: flex;
		justify-content: center;
		margin-top: 32px;
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
</style>
