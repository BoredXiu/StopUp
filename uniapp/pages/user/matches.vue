<template>
	<view class="page">
		<view class="tabs">
			<view
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: activeTab === tab.value }"
				@tap="switchTab(tab.value)"
			>
				{{ tab.label }}
			</view>
		</view>

		<view class="match-list">
			<view
				v-for="match in matches"
				:key="match.id"
				class="match-item"
				@tap="goDetail(match.id)"
			>
				<image
					:src="match.coverImage || '/static/placeholder.jpg'"
					class="match-thumb"
					mode="aspectFill"
				/>
				<view class="match-body">
					<text class="match-title">{{ match.title }}</text>
					<text class="match-meta">{{ match.sportName }} · {{ match.matchDate }}</text>
					<text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}人</text>
				</view>
				<view class="match-right">
					<text
						class="match-status"
						:class="{ 'status-pending': match.status === 0, 'status-active': match.status === 1, 'status-ended': match.status === 2 }"
					>
						{{ getStatusText(match.status) }}
					</text>
				</view>
			</view>
		</view>

		<view
			class="empty"
			v-if="!loading && matches.length === 0"
		>
			暂无球局
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onShow } from '@dcloudio/uni-app';
	import { matchApi } from '@/api';

	const tabs = [
		{ label: '全部', value: '' },
		{ label: '报名中', value: '1' },
		{ label: '已满员', value: '2' },
		{ label: '已开始', value: '3' },
		{ label: '已结束', value: '4' },
		{ label: '已取消', value: '5' }
	];
	const activeTab = ref('');
	const matches = ref([]);
	const loading = ref(false);

	function getStatusText(s) {
		const map = { 1: '报名中', 2: '已满员', 3: '已开始', 4: '已结束', 5: '已取消' };
		return map[s] || '未知';
	}
	function getStatusClass(s) {
		const map = { 1: 'open', 2: 'full', 3: 'started', 4: 'ended', 5: 'cancelled' };
		return map[s] || '';
	}
	function goDetail(id) {
		uni.navigateTo({ url: `/pages/match/detail?id=${id}` });
	}

	async function switchTab(value) {
		activeTab.value = value;
		await fetchMatches();
	}

	async function fetchMatches() {
		loading.value = true;
		try {
			const res = await matchApi.myMatches({
				pageSize: 50,
				status: activeTab.value ? Number(activeTab.value) : undefined
			});
			matches.value = res.data.list;
		} finally {
			loading.value = false;
		}
	}

	onShow(fetchMatches);
</script>

<style scoped>
	.page {
		padding: 0;
	}
	.tabs {
		display: flex;
		background: #fff;
		padding: 8px 0;
		white-space: nowrap;
		overflow-x: auto;
	}
	.tab-item {
		padding: 6px 14px;
		font-size: 13px;
		color: #666;
		flex-shrink: 0;
	}
	.tab-item.active {
		color: #409eff;
		font-weight: 600;
	}

	.match-list {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.match-item {
		display: flex;
		background: #fff;
		border-radius: 10px;
		padding: 12px;
		align-items: center;
	}
	.match-thumb {
		width: 70px;
		height: 55px;
		border-radius: 6px;
		flex-shrink: 0;
	}
	.match-body {
		flex: 1;
		margin-left: 10px;
	}
	.match-title {
		font-size: 14px;
		font-weight: 600;
		display: block;
	}
	.match-meta {
		font-size: 12px;
		color: #999;
		display: block;
		margin: 2px 0;
	}
	.match-count {
		font-size: 12px;
		color: #409eff;
	}
	.match-status {
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 8px;
		background: #f0f0f0;
		color: #666;
	}
	.match-status.open {
		background: #e1f3d8;
		color: #67c23a;
	}
	.match-status.cancelled {
		background: #fde2e2;
		color: #f56c6c;
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
	}
</style>
