<template>
	<header class="app-header">
		<div class="container header-inner">
			<router-link
				to="/"
				class="logo"
			>
				<span class="logo-icon">🏀</span>
				<span class="logo-text">拼个场</span>
			</router-link>

			<nav class="nav-links">
				<router-link
					to="/"
					class="nav-item"
					:class="{ active: $route.path === '/' }"
					>首页</router-link
				>
				<router-link
					to="/venues"
					class="nav-item"
					active-class="active"
					>场馆</router-link
				>
			</nav>

			<div class="header-actions">
				<template v-if="userStore.isLoggedIn">
					<el-badge
						:value="notificationStore.unreadCount"
						:hidden="notificationStore.unreadCount === 0"
						class="notification-badge"
					>
						<el-button
							link
							@click="$router.push('/user/notifications')"
						>
							<el-icon :size="20"><Bell /></el-icon>
						</el-button>
					</el-badge>
					<el-button
						type="primary"
						size="small"
						@click="$router.push('/user/create-match')"
					>
						创建球局
					</el-button>
					<el-dropdown
						trigger="click"
						@command="handleCommand"
					>
						<span class="user-avatar">
							<el-avatar
								:size="32"
								:src="userStore.user?.avatar"
							>
								{{ userStore.user?.nickname?.charAt(0) }}
							</el-avatar>
							<span class="user-name">{{ userStore.user?.nickname }}</span>
						</span>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="profile">个人中心</el-dropdown-item>
								<el-dropdown-item
									divided
									command="logout"
									>退出登录</el-dropdown-item
								>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>
				<template v-else>
					<el-button
						size="small"
						@click="$router.push('/login')"
						>登录</el-button
					>
				</template>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
	import { Bell } from "@element-plus/icons-vue";
	import { useUserStore } from "@/store/user";
	import { useNotificationStore } from "@/store/notification";
	import { useRouter } from "vue-router";

	const router = useRouter();
	const userStore = useUserStore();
	const notificationStore = useNotificationStore();

	if (userStore.isLoggedIn) {
		notificationStore.fetchUnreadCount();
	}

	function handleCommand(command: string) {
		switch (command) {
			case "profile":
				router.push("/user/profile");
				break;
			case "logout":
				userStore.logout();
				router.push("/");
				break;
		}
	}
</script>

<style scoped>
	.app-header {
		height: 60px;
		background: #fff;
		border-bottom: 1px solid var(--border-color);
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	}
	.header-inner {
		display: flex;
		align-items: center;
		height: 100%;
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-right: 40px;
	}
	.logo-icon {
		font-size: 24px;
	}
	.logo-text {
		font-size: 20px;
		font-weight: 700;
		color: var(--text-primary);
	}
	.nav-links {
		display: flex;
		gap: 8px;
		flex: 1;
	}
	.nav-item {
		padding: 6px 16px;
		border-radius: 6px;
		font-size: 14px;
		color: var(--text-regular);
		transition: all 0.2s;
	}
	.nav-item:hover,
	.nav-item.active {
		color: var(--primary-color);
		background: #ecf5ff;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.notification-badge {
		margin-right: 4px;
	}
	.user-avatar {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}
	.user-name {
		font-size: 14px;
		color: var(--text-regular);
	}
</style>
