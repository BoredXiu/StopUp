<template>
	<view class="page">
		<view
			class="venue-header"
			v-if="venue"
		>
			<image
				:src="venue.coverImage || getVenueImage(venue.id)"
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
			<view class="section-title">近期场局</view>
			<view class="match-list">
				<view
					v-for="m in matches"
					:key="m.id"
					class="match-item"
					@tap="goMatch(m.id)"
				>
					<view class="match-body">
						<text class="match-title">{{ m.title }}</text>
						<text class="match-meta">{{ m.matchDate }} {{ m.startTime }}</text>
					</view>
					<view class="match-right">
						<text class="match-count">{{ m.currentPlayers }}/{{ m.maxPlayers }}</text>
						<text
							class="match-status"
							:class="m.status === 1 ? 'open' : ''"
						>
							{{ m.status === 1 ? "报名中" : "已满员" }}
						</text>
					</view>
				</view>
			</view>
			<view
				class="empty"
				v-if="!matches.length"
				>暂无场局</view
			>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { venueApi, matchApi } from "@/api";
	import type { Venue, Match } from "@/types";

	const VENUE_PICS = [
		"https://picsum.photos/seed/ven1/400/300",
		"https://picsum.photos/seed/ven2/400/300",
		"https://picsum.photos/seed/ven3/400/300",
		"https://picsum.photos/seed/ven4/400/300",
		"https://picsum.photos/seed/ven5/400/300",
		"https://picsum.photos/seed/ven6/400/300",
		"https://picsum.photos/seed/ven7/400/300",
		"https://picsum.photos/seed/ven8/400/300",
		"https://picsum.photos/seed/ven9/400/300",
		"https://picsum.photos/seed/ven10/400/300",
	];

	function getVenueImage(seed: number): string {
		return VENUE_PICS[seed % VENUE_PICS.length];
	}

	const venue = ref<Venue | null>(null);
	const facilities = ref<string[]>([]);
	const matches = ref<Match[]>([]);

	function goMatch(id: number): void {
		uni.navigateTo({ url: `/subpkg/match/detail?id=${id}` });
	}

	async function fetchDetail(): Promise<void> {
		const pages = getCurrentPages();
		const options = pages[pages.length - 1].options as Record<string, string>;
		const id = Number(options.id);
		if (!id) return;
		try {
			const [venueRes, matchRes] = await Promise.all([venueApi.detail(id), matchApi.list({ venueId: id, pageSize: 10, status: 1 })]);
			venue.value = venueRes.data;
			facilities.value = venueRes.data.facilities || [];
			matches.value = matchRes.data.list;
		} catch (_) {
			/* ignore */
		}
	}

	onLoad(() => {
		fetchDetail();
	});
</script>

<style scoped>
	.page {
		background: #f5f5f5;
		min-height: 100vh;
	}
	.venue-header {
		position: relative;
	}
	.cover-image {
		width: 100%;
		height: 200px;
	}
	.venue-basic {
		padding: 12px 16px;
		background: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.venue-name {
		font-size: 18px;
		font-weight: 700;
		color: #333;
	}
	.venue-rating {
		font-size: 14px;
		color: #f0ad4e;
	}
	.info-card {
		background: #fff;
		margin: 10px 0;
		padding: 0 16px;
	}
	.info-row {
		display: flex;
		padding: 12px 0;
		border-bottom: 1px solid #f5f5f5;
		align-items: center;
	}
	.info-label {
		width: 60px;
		font-size: 13px;
		color: #999;
		flex-shrink: 0;
	}
	.info-value {
		flex: 1;
		font-size: 14px;
		color: #333;
	}
	.info-value.link {
		color: #409eff;
	}
	.section {
		background: #fff;
		margin: 10px 0;
		padding: 14px 16px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 700;
		margin-bottom: 10px;
		color: #333;
	}
	.desc-text {
		font-size: 14px;
		color: #666;
		line-height: 1.6;
	}
	.facility-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.facility-tag {
		padding: 4px 10px;
		background: #f5f5f5;
		border-radius: 12px;
		font-size: 12px;
		color: #666;
	}
	.match-list {
		display: flex;
		flex-direction: column;
	}
	.match-item {
		display: flex;
		padding: 10px 0;
		border-bottom: 1px solid #f5f5f5;
		align-items: center;
	}
	.match-body {
		flex: 1;
	}
	.match-title {
		font-size: 14px;
		font-weight: 600;
		color: #333;
		display: block;
	}
	.match-meta {
		font-size: 12px;
		color: #888;
		display: block;
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
	.empty {
		text-align: center;
		padding: 20px 0;
		color: #999;
		font-size: 13px;
	}
</style>
