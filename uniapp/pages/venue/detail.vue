<template>
	<view class="page">
		<view
			class="venue-header"
			v-if="venue"
		>
			<image
				:src="venue.coverImage || '/static/placeholder.jpg'"
				class="cover-image"
				mode="aspectFill"
			/>
			<view class="venue-basic">
				<text class="venue-name">{{ venue.name }}</text>
				<text class="venue-rating">⭐ {{ venue.rating }}</text>
			</view>
		</view>

		<view
			class="info-card"
			v-if="venue"
		>
			<view class="info-row">
				<text class="info-label">地址</text>
				<text class="info-value">{{ venue.address }}</text>
			</view>
			<view
				class="info-row"
				v-if="venue.phone"
			>
				<text class="info-label">电话</text>
				<text class="info-value link">{{ venue.phone }}</text>
			</view>
			<view
				class="info-row"
				v-if="venue.businessHours"
			>
				<text class="info-label">营业时间</text>
				<text class="info-value">{{ venue.businessHours }}</text>
			</view>
		</view>

		<view
			class="section"
			v-if="venue && venue.description"
		>
			<view class="section-title">场馆介绍</view>
			<text class="desc-text">{{ venue.description }}</text>
		</view>

		<view
			class="section"
			v-if="facilities.length"
		>
			<view class="section-title">设施服务</view>
			<view class="facility-list">
				<text
					v-for="f in facilities"
					:key="f"
					class="facility-tag"
					>{{ f }}</text
				>
			</view>
		</view>

		<view class="section">
			<view class="section-title">近期球局</view>
			<view class="match-list">
				<view
					v-for="match in matches"
					:key="match.id"
					class="match-item"
					@tap="goMatch(match.id)"
				>
					<view class="match-body">
						<text class="match-title">{{ match.title }}</text>
						<text class="match-meta">{{ match.matchDate }} {{ match.startTime }}</text>
					</view>
					<view class="match-right">
						<text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}</text>
						<text
							class="match-status"
							:class="match.status === 1 ? 'open' : ''"
						>
							{{ match.status === 1 ? "报名中" : "已满员" }}
						</text>
					</view>
				</view>
			</view>
			<view
				class="empty"
				v-if="!matches.length"
				>暂无球局</view
			>
		</view>
	</view>
</template>

<script setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { venueApi, matchApi } from "@/api";

	const venue = ref(null);
	const facilities = ref([]);
	const matches = ref([]);

	function goMatch(id) {
		uni.navigateTo({ url: `/pages/match/detail?id=${id}` });
	}

	async function fetchDetail() {
		const pages = getCurrentPages();
		const options = pages[pages.length - 1].options;
		const id = Number(options.id);
		if (!id) return;
		try {
			const [venueRes, matchRes] = await Promise.all([venueApi.detail(id), matchApi.list({ venueId: id, pageSize: 10, status: 1 })]);
			venue.value = venueRes.data;
			facilities.value = venueRes.data.facilities || [];
			matches.value = matchRes.data.list;
		} catch (e) {
			/* ignore */
		}
	}

	onLoad(() => {
		fetchDetail();
	});
</script>

<style scoped>
	.page {
		padding-bottom: 20px;
	}
	.cover-image {
		width: 100%;
		height: 200px;
	}
	.venue-basic {
		padding: 16px;
		background: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.venue-name {
		font-size: 18px;
		font-weight: 700;
	}
	.venue-rating {
		font-size: 14px;
		color: #e6a23c;
	}

	.info-card {
		margin: 12px 16px;
		background: #fff;
		border-radius: 10px;
		padding: 16px;
	}
	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	.info-row:last-child {
		border-bottom: none;
	}
	.info-label {
		font-size: 13px;
		color: #999;
	}
	.info-value {
		font-size: 14px;
		flex: 1;
		text-align: right;
	}
	.info-value.link {
		color: #409eff;
	}

	.section {
		margin: 12px 16px;
		background: #fff;
		border-radius: 10px;
		padding: 16px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.desc-text {
		font-size: 14px;
		color: #666;
		line-height: 1.6;
	}

	.facility-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.facility-tag {
		padding: 4px 12px;
		background: #f0f7ff;
		color: #409eff;
		border-radius: 12px;
		font-size: 12px;
	}

	.match-list {
		display: flex;
		flex-direction: column;
	}
	.match-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	.match-item:last-child {
		border-bottom: none;
	}
	.match-title {
		font-size: 14px;
		font-weight: 500;
		display: block;
	}
	.match-meta {
		font-size: 12px;
		color: #999;
	}
	.match-count {
		font-size: 16px;
		font-weight: 700;
		color: #409eff;
	}
	.match-status {
		font-size: 12px;
		color: #999;
	}
	.match-status.open {
		color: #67c23a;
	}
	.empty {
		text-align: center;
		padding: 20px;
		color: #999;
		font-size: 13px;
	}
</style>
