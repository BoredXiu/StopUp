<template>
	<view class="page">
		<view class="notify-list">
			<view
				v-for="item in notifications"
				:key="item.id"
				class="notify-item"
				:class="{ unread: item.isRead === 0 }"
				@tap="handleClick(item)"
			>
				<view class="notify-icon">
					<text
						v-if="item.type === 'match_join'"
						class="icon-join"
						>👥</text
					>
					<text
						v-else-if="item.type === 'match_cancel'"
						class="icon-cancel"
						>❌</text
					>
					<text
						v-else-if="item.type === 'payment'"
						class="icon-pay"
						>💰</text
					>
					<text
						v-else
						class="icon-default"
						>🔔</text
					>
				</view>
				<view class="notify-content">
					<text class="notify-title">{{ item.title }}</text>
					<text class="notify-text">{{ item.content }}</text>
					<text class="notify-time">{{ item.createdAt }}</text>
				</view>
				<view
					v-if="item.isRead === 0"
					class="unread-dot"
				></view>
			</view>
		</view>

		<view
			class="empty"
			v-if="!loading && notifications.length === 0"
			>暂无通知</view
		>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { notificationApi } from "@/api";
	import type { Notification } from "@/types";

	const notifications = ref<Notification[]>([]);
	const loading = ref(false);

	async function fetchNotifications(): Promise<void> {
		loading.value = true;
		try {
			const res = await notificationApi.list({ pageSize: 50 });
			notifications.value = res.data.list;
		} finally {
			loading.value = false;
		}
	}

	async function handleClick(item: Notification): Promise<void> {
		if (item.isRead === 0) {
			await notificationApi.markRead(item.id);
			item.isRead = 1;
		}
		if (item.relatedType === "match" && item.relatedId) {
			uni.navigateTo({ url: `/subpkg/match/detail?id=${item.relatedId}` });
		}
	}

	onShow(fetchNotifications);
</script>

<style scoped>
	.page {
		padding: 0;
	}
	.notify-list {
		display: flex;
		flex-direction: column;
	}
	.notify-item {
		display: flex;
		padding: 14px 16px;
		background: #fff;
		border-bottom: 1px solid #f5f5f5;
		position: relative;
	}
	.notify-item.unread {
		background: #ecf5ff;
	}
	.notify-icon {
		margin-right: 12px;
		font-size: 22px;
	}
	.notify-content {
		flex: 1;
	}
	.notify-title {
		font-size: 14px;
		font-weight: 600;
		display: block;
	}
	.notify-text {
		font-size: 13px;
		color: #666;
		display: block;
		margin: 4px 0;
	}
	.notify-time {
		font-size: 11px;
		color: #999;
	}
	.unread-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #409eff;
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
	}
</style>
