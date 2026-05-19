<template>
	<view class="page">
		<view
			class="profile-header"
			v-if="userStore.token"
			@tap="goProfileEdit"
		>
			<image
				:src="(userStore.user && userStore.user.avatar) || '/static/default-avatar.png'"
				class="avatar"
				mode="aspectFill"
			/>
			<view class="profile-info">
				<text class="nickname">{{ (userStore.user && userStore.user.nickname) || "未设置昵称" }}</text>
				<text class="bio">{{ (userStore.user && userStore.user.bio) || "这个人很懒，什么都没写..." }}</text>
				<view class="meta">
					<text v-if="userStore.user && userStore.user.city">{{ userStore.user.city }}</text>
					<text v-if="userStore.user">信用分: {{ userStore.user.creditScore }}</text>
				</view>
			</view>
			<text class="edit-tip">编辑 ></text>
		</view>

		<view class="menu-section">
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/matches')"
			>
				<text class="menu-icon">🏀</text>
				<text class="menu-text">我参与的场局</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/orders')"
			>
				<text class="menu-icon">💰</text>
				<text class="menu-text">我的订单</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/credit')"
			>
				<text class="menu-icon">⭐</text>
				<text class="menu-text">信用记录</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/notifications')"
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
				@tap="goPage('/subpkg/match/create')"
			>
				<text class="menu-icon">➕</text>
				<text class="menu-text">创建场局</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>

		<view
			class="menu-section"
			v-if="userStore.token"
		>
			<view
				class="menu-item logout-item"
				@tap="handleLogout"
			>
				<text
					class="menu-text"
					style="color: #f56c6c; text-align: center; flex: none"
					>退出登录</text
				>
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

<script setup lang="ts">
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { useUserStore } from "@/store/user";
	import { notificationApi } from "@/api";

	const userStore = useUserStore();
	const unreadCount = ref(0);

	function goPage(url: string): void {
		if (!userStore.token) {
			uni.navigateTo({ url: "/subpkg/login/index" });
			return;
		}
		uni.navigateTo({ url });
	}

	function goLogin(): void {
		uni.navigateTo({ url: "/subpkg/login/index" });
	}

	function goProfileEdit(): void {
		uni.navigateTo({ url: "/subpkg/user/edit" });
	}

	function handleLogout(): void {
		uni.showModal({
			title: "提示",
			content: "确定要退出登录吗？",
			success: (res: any) => {
				if (res.confirm) {
					userStore.logout();
					unreadCount.value = 0;
				}
			},
		});
	}

	onShow(async () => {
		const storedToken = uni.getStorageSync("token") as string;
		if (!storedToken && userStore.token) {
			userStore.logout();
			unreadCount.value = 0;
			return;
		}
		if (storedToken && !userStore.token) {
			userStore.setToken(storedToken);
		}
		if (userStore.token) {
			await userStore.fetchProfile();
			try {
				const res = await notificationApi.unreadCount();
				unreadCount.value = res.data.count;
			} catch (_) {
				/* ignore */
			}
		}
	});
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f5f5f5;
	}
	.profile-header {
		display: flex;
		padding: 20px 16px;
		background: #fff;
		align-items: center;
	}
	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin-right: 12px;
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
		font-size: 12px;
		color: #999;
		display: block;
		margin: 2px 0;
	}
	.meta {
		font-size: 11px;
		color: #bbb;
		display: flex;
		gap: 10px;
	}
	.edit-tip {
		font-size: 12px;
		color: #bbb;
		flex-shrink: 0;
	}
	.menu-section {
		background: #fff;
		border-radius: 8px;
		margin: 10px 12px;
		overflow: hidden;
	}
	.menu-item {
		display: flex;
		align-items: center;
		padding: 14px 14px;
		border-bottom: 1px solid #f5f5f5;
	}
	.menu-item:last-child {
		border-bottom: none;
	}
	.menu-icon {
		font-size: 18px;
		margin-right: 10px;
	}
	.menu-text {
		flex: 1;
		font-size: 15px;
		color: #333;
	}
	.menu-arrow {
		font-size: 14px;
		color: #ccc;
	}
	.menu-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.badge {
		background: #f56c6c;
		color: #fff;
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 8px;
		min-width: 16px;
		text-align: center;
	}
	.login-tip {
		padding: 30px 16px;
		text-align: center;
	}
	.login-btn {
		background: #409eff;
		color: #fff;
		border-radius: 8px;
		height: 44px;
		line-height: 44px;
		font-size: 15px;
	}
</style>
