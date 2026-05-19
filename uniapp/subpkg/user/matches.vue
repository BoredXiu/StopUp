<template>
	<view class="page">
		<view class="match-list">
			<view
				v-for="match in matches"
				:key="match.id"
				class="match-item"
				@tap="goDetail(match.id)"
			>
				<view class="match-body">
					<text class="match-title">{{ match.title }}</text>
					<text class="match-meta">{{ match.sportName }} · {{ match.matchDate }} {{ match.startTime }}</text>
				</view>
				<view class="match-right">
					<text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}</text>
					<text
						class="match-status"
						:class="match.status === 1 ? 'open' : match.status === 5 ? 'cancelled' : ''"
					>
						{{ statusMap[match.status] || "未知" }}
					</text>
				</view>
			</view>
		</view>
		<view
			class="empty"
			v-if="!loading && matches.length === 0"
			>暂无场局</view
		>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { matchApi } from "@/api";
	import type { Match } from "@/types";

	const matches = ref<Match[]>([]);
	const loading = ref(false);
	const statusMap: Record<number, string> = { 1: "报名中", 2: "已满员", 3: "已开始", 4: "已结束", 5: "已取消" };

	function goDetail(id: number): void {
		uni.navigateTo({ url: `/subpkg/match/detail?id=${id}` });
	}

	async function fetchMatches(): Promise<void> {
		loading.value = true;
		try {
			const res = await matchApi.myMatches({ pageSize: 50 });
			matches.value = res.data.list;
		} finally {
			loading.value = false;
		}
	}

	onShow(fetchMatches);
</script>

<style scoped>
	.page {
		background: #f5f5f5;
		min-height: 100vh;
	}
	.match-list {
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.match-item {
		display: flex;
		background: #fff;
		border-radius: 10px;
		padding: 12px;
		align-items: center;
	}
	.match-body {
		flex: 1;
	}
	.match-title {
		font-size: 15px;
		font-weight: 600;
		display: block;
		color: #333;
	}
	.match-meta {
		font-size: 12px;
		color: #888;
		display: block;
		margin-top: 2px;
	}
	.match-right {
		text-align: right;
	}
	.match-count {
		font-size: 13px;
		color: #666;
		display: block;
	}
	.match-status {
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 4px;
		background: #f0f0f0;
		color: #999;
		display: block;
		margin-top: 2px;
	}
	.match-status.open {
		background: #ecf5ff;
		color: #409eff;
	}
	.match-status.cancelled {
		background: #fef0f0;
		color: #f56c6c;
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
	}
</style>
