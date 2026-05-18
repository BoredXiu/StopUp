<template>
	<view class="page">
		<view
			class="profile-header"
			v-if="userStore.user"
		>
			<image
				:src="userStore.user.avatar || '/static/default-avatar.png'"
				class="avatar"
				mode="aspectFill"
			/>
			<view class="profile-info">
				<text class="nickname">{{ userStore.user.nickname }}</text>
				<text class="bio">{{ userStore.user.bio || "这个人很懒，什么都没写..." }}</text>
				<view class="meta">
					<text v-if="userStore.user.city">{{ userStore.user.city }}</text>
					<text>信用分: {{ userStore.user.creditScore }}</text>
				</view>
			</view>
		</view>

		<view class="menu-section">
			<view
				class="menu-item"
				@tap="goPage('/pages/user/matches')"
			>
				<text class="menu-icon">🏀</text>
				<text class="menu-text">我的球局</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/pages/user/orders')"
			>
				<text class="menu-icon">💰</text>
				<text class="menu-text">我的订单</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/pages/user/credit')"
			>
				<text class="menu-icon">⭐</text>
				<text class="menu-text">信用记录</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/pages/user/notifications')"
			>
				<text class="menu-icon">🔔</text>
				<text class="menu-text">消息通知</text>
				<view class="menu-right">
					<text
						v-if="unreadCount"
						class="badge"
						>{{ unreadCount }}</text
					>
					<text class="menu-arrow">→</text>
				</view>
			</view>
		</view>

		<view class="menu-section">
			<view
				class="menu-item"
				@tap="goPage('/pages/match/create')"
			>
				<text class="menu-icon">➕</text>
				<text class="menu-text">创建球局</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>

		<view
			class="login-tip"
			v-if="!userStore.token"
		>
			<button
				class="login-btn"
				@tap="goLogin"
			>
				登录 / 注册
			</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { useUserStore } from "@/store/user";
	import { notificationApi } from "@/api";

	const userStore = useUserStore();
	const unreadCount = ref(0);

	function goPage(url) {
		if (!userStore.token) {
			uni.navigateTo({ url: "/pages/login/index" });
			return;
		}
		uni.navigateTo({ url });
	}

	function goLogin() {
		uni.navigateTo({ url: "/pages/login/index" });
	}

	onShow(async () => {
		if (userStore.token) {
			await userStore.fetchProfile();
			try {
				const res = await notificationApi.unreadCount();
				unreadCount.value = res.data.count;
			} catch (e) {
				/* ignore */
			}
		}
	});
</script>

<style scoped>
	.page {
		padding: 16px;
	}
	.profile-header {
		display: flex;
		align-items: center;
		gap: 16px;
		background: #fff;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 16px;
	}
	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
	}
	.profile-info {
		flex: 1;
	}
	.nickname {
		font-size: 18px;
		font-weight: 700;
		display: block;
	}
	.bio {
		font-size: 13px;
		color: #999;
		display: block;
		margin: 4px 0;
	}
	.meta {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: #999;
	}

	.menu-section {
		background: #fff;
		border-radius: 12px;
		margin-bottom: 12px;
		overflow: hidden;
	}
	.menu-item {
		display: flex;
		align-items: center;
		padding: 16px;
		border-bottom: 1px solid #f5f5f5;
	}
	.menu-item:last-child {
		border-bottom: none;
	}
	.menu-icon {
		font-size: 20px;
		margin-right: 12px;
	}
	.menu-text {
		flex: 1;
		font-size: 15px;
	}
	.menu-arrow {
		color: #ccc;
	}
	.menu-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.badge {
		min-width: 20px;
		height: 20px;
		line-height: 20px;
		text-align: center;
		background: #f56c6c;
		color: #fff;
		border-radius: 10px;
		font-size: 11px;
		padding: 0 6px;
	}

	.login-tip {
		margin-top: 40px;
		text-align: center;
	}
	.login-btn {
		width: 200px;
		height: 44px;
		line-height: 44px;
		background: #409eff;
		color: #fff;
		border-radius: 22px;
		font-size: 16px;
		border: none;
	}
</style>
