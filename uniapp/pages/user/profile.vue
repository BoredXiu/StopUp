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
		</view>

		<view class="tab-bar" v-if="userStore.token">
			<view
				v-for="tab in tabs"
				:key="tab.key"
				class="tab-item"
				:class="{ active: activeTab === tab.key }"
				@tap="switchTab(tab.key)"
			>
				<text class="tab-label">{{ tab.label }}</text>
				<text
					v-if="tab.badge !== undefined && tab.badge > 0"
					class="tab-badge"
				>{{ tab.badge }}</text>
			</view>
		</view>

		<view class="tab-content" v-if="userStore.token">
			<view class="match-list" v-show="activeTab === 'matches'">
				<view
					v-for="match in matches"
					:key="match.id"
					class="match-item"
					@tap="goMatchDetail(match.id)"
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
							{{ matchStatusMap[match.status] || "未知" }}
						</text>
					</view>
				</view>
				<view
					class="empty"
					v-if="!matchLoading && matches.length === 0"
				>暂无场局</view>
			</view>

			<view class="order-section" v-show="activeTab === 'orders'">
				<view class="order-tabs">
					<view
						v-for="ot in orderTabs"
						:key="ot.value"
						class="order-tab-item"
						:class="{ active: orderTab === ot.value }"
						@tap="switchOrderTab(ot.value)"
					>{{ ot.label }}</view>
				</view>
				<view class="order-list">
					<view
						v-for="order in orders"
						:key="order.id"
						class="order-card"
					>
						<view class="order-header">
							<text class="order-no">{{ order.orderNo }}</text>
							<text
								class="order-status"
								:class="getOrderStatusClass(order.status)"
							>{{ getOrderStatusText(order.status) }}</text>
						</view>
						<view class="order-body">
							<view class="order-info">
								<text class="order-title">{{ order.matchTitle }}</text>
								<text class="order-meta">{{ order.sportName }} · {{ order.matchDate }}</text>
							</view>
							<text class="order-amount">¥{{ order.amount }}</text>
						</view>
						<view class="order-footer" v-if="order.status === 1">
							<button class="pay-btn" @tap="handlePay(order)">立即支付</button>
						</view>
						<view class="order-footer" v-if="order.status === 2">
							<button class="refund-btn" @tap="handleRefund(order)">申请退款</button>
						</view>
					</view>
				</view>
				<view
					class="empty"
					v-if="!orderLoading && orders.length === 0"
				>暂无订单</view>
			</view>

			<view class="credit-section" v-show="activeTab === 'credit'">
				<view class="credit-card">
					<text class="credit-label">当前信用分</text>
					<text
						class="credit-value"
						:class="creditScoreClass"
					>{{ (userStore.user && userStore.user.creditScore) || 0 }}</text>
					<text class="credit-desc">{{ creditScoreDesc }}</text>
				</view>
				<view class="rules-card">
					<text class="rules-title">信用规则</text>
					<text class="rule-item">✅ 参加场局 +2分</text>
					<text class="rule-item">✅ 完成场局 +5分</text>
					<text class="rule-item">❌ 放鸽子 -20分</text>
					<text class="rule-item">⚠️ 信用分低于60分将无法报名</text>
				</view>
				<view class="log-section">
					<text class="section-title">信用记录</text>
					<view class="log-list">
						<view
							v-for="log in creditLogs"
							:key="log.id"
							class="log-item"
						>
							<view class="log-info">
								<text class="log-reason">{{ getCreditReasonText(log.reason) }}</text>
								<text class="log-time">{{ formatDateTime(log.createdAt) }}</text>
							</view>
							<text
								class="log-amount"
								:class="log.changeAmount > 0 ? 'positive' : 'negative'"
							>{{ log.changeAmount > 0 ? "+" : "" }}{{ log.changeAmount }}</text>
						</view>
					</view>
					<view
						class="empty"
						v-if="!creditLogs.length"
					>暂无记录</view>
				</view>
			</view>
		</view>

		<view class="menu-section" v-if="userStore.token">
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
					>{{ unreadCount }}</text>
					<text class="menu-arrow">→</text>
				</view>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/report')"
			>
				<text class="menu-icon">🚨</text>
				<text class="menu-text">举报</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/user/feedback')"
			>
				<text class="menu-icon">💬</text>
				<text class="menu-text">意见反馈</text>
				<text class="menu-arrow">→</text>
			</view>
			<view
				class="menu-item"
				@tap="goPage('/subpkg/match/create')"
			>
				<text class="menu-icon">➕</text>
				<text class="menu-text">创建场局</text>
				<text class="menu-arrow">→</text>
			</view>
		</view>

		<view class="menu-section" v-if="userStore.token">
			<view class="menu-item logout-item" @tap="handleLogout">
				<text
					class="menu-text"
					style="color: #f56c6c; text-align: center; flex: none"
				>退出登录</text>
			</view>
		</view>

		<view class="login-tip" v-if="!userStore.token">
			<button class="login-btn" @tap="goLogin">
				登录 / 注册
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";
import { matchApi, orderApi, userApi, notificationApi } from "@/api";
import { formatDateTime } from "@/utils/format";
import type { Match, Order, CreditLog } from "@/types";

const userStore = useUserStore();
const unreadCount = ref(0);

const activeTab = ref("matches");
const tabs = [
	{ key: "matches", label: "参与场局", badge: undefined as number | undefined },
	{ key: "orders", label: "我的订单", badge: undefined as number | undefined },
	{ key: "credit", label: "信用记录", badge: undefined as number | undefined },
];

const matches = ref<Match[]>([]);
const matchLoading = ref(false);
const matchStatusMap: Record<number, string> = { 1: "报名中", 2: "已满员", 3: "已开始", 4: "已结束", 5: "已取消" };

const orderTabs = [
	{ label: "全部", value: "" },
	{ label: "待支付", value: "1" },
	{ label: "已支付", value: "2" },
	{ label: "已取消", value: "3" },
	{ label: "已完成", value: "4" },
	{ label: "已退款", value: "5" },
];
const orderTab = ref("");
const orders = ref<Order[]>([]);
const orderLoading = ref(false);

const creditLogs = ref<CreditLog[]>([]);

const creditScoreClass = computed(() => {
	const score = (userStore.user && userStore.user.creditScore) || 0;
	if (score >= 80) return "high";
	if (score >= 60) return "medium";
	return "low";
});
const creditScoreDesc = computed(() => {
	const score = (userStore.user && userStore.user.creditScore) || 0;
	if (score >= 90) return "信用优秀，继续保持！";
	if (score >= 80) return "信用良好";
	if (score >= 60) return "信用一般，请注意";
	return "信用较低，部分功能受限";
});

function getOrderStatusText(s: number): string {
	const map: Record<number, string> = { 1: "待支付", 2: "已支付", 3: "已取消", 4: "已完成", 5: "已退款" };
	return map[s] || "未知";
}
function getOrderStatusClass(s: number): string {
	const map: Record<number, string> = { 1: "status-pending", 2: "status-active", 3: "status-cancelled", 4: "status-ended", 5: "status-refunded" };
	return map[s] || "";
}

function getCreditReasonText(reason: string): string {
	const map: Record<string, string> = {
		join_match: "参加场局",
		complete_match: "完成场局",
		no_show: "放鸽子",
		report_approved: "举报成立",
	};
	return map[reason] || reason;
}

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

function goMatchDetail(id: number): void {
	uni.navigateTo({ url: `/subpkg/match/detail?id=${id}` });
}

function switchTab(key: string): void {
	activeTab.value = key;
	if (key === "matches") fetchMatches();
	else if (key === "orders") fetchOrders();
	else if (key === "credit") fetchCredit();
}

function switchOrderTab(value: string): void {
	orderTab.value = value;
	fetchOrders();
}

async function fetchMatches(): Promise<void> {
	matchLoading.value = true;
	try {
		const res = await matchApi.myMatches({ pageSize: 50 });
		matches.value = res.data.list;
	} finally {
		matchLoading.value = false;
	}
}

async function fetchOrders(): Promise<void> {
	orderLoading.value = true;
	try {
		const params: Record<string, any> = { pageSize: 50 };
		if (orderTab.value) params.status = orderTab.value;
		const res = await orderApi.myOrders(params);
		orders.value = res.data.list;
	} finally {
		orderLoading.value = false;
	}
}

async function fetchCredit(): Promise<void> {
	await userStore.fetchProfile();
	try {
		const res = await userApi.getCreditLogs({ pageSize: 50 });
		creditLogs.value = res.data.list;
	} catch (_) {
		/* ignore */
	}
}

async function handlePay(order: Order): Promise<void> {
	try {
		await orderApi.pay(order.id);
		uni.showToast({ title: "支付成功", icon: "success" });
		fetchOrders();
	} catch {
		/* ignore */
	}
}

async function handleRefund(order: Order): Promise<void> {
	uni.showModal({
		title: "退款申请",
		content: "确定要申请退款吗？",
		success: async (res: any) => {
			if (res.confirm) {
				try {
					await orderApi.refund(order.id);
					uni.showToast({ title: "退款成功", icon: "success" });
					fetchOrders();
				} catch {
					/* ignore */
				}
			}
		},
	});
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
		fetchMatches();
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
.tab-bar {
	display: flex;
	background: #fff;
	border-bottom: 1px solid #eee;
}
.tab-item {
	flex: 1;
	text-align: center;
	padding: 14px 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
}
.tab-label {
	font-size: 14px;
	color: #666;
}
.tab-item.active .tab-label {
	color: #409eff;
	font-weight: 600;
}
.tab-item.active::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 20%;
	right: 20%;
	height: 2px;
	background: #409eff;
	border-radius: 1px;
}
.tab-badge {
	background: #f56c6c;
	color: #fff;
	font-size: 10px;
	padding: 1px 5px;
	border-radius: 8px;
	min-width: 14px;
	text-align: center;
}
.tab-content {
	background: #f5f5f5;
	min-height: 200px;
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

.order-section {
	padding: 8px;
}
.order-tabs {
	display: flex;
	background: #fff;
	border-radius: 8px;
	padding: 4px;
	margin-bottom: 8px;
	overflow-x: auto;
}
.order-tab-item {
	flex-shrink: 0;
	padding: 6px 12px;
	font-size: 12px;
	color: #666;
	border-radius: 6px;
}
.order-tab-item.active {
	background: #409eff;
	color: #fff;
}
.order-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.order-card {
	background: #fff;
	border-radius: 10px;
	padding: 12px;
}
.order-header {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
}
.order-no {
	font-size: 12px;
	color: #999;
}
.order-status {
	font-size: 11px;
	padding: 2px 8px;
	border-radius: 4px;
	background: #f0f0f0;
}
.order-body {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}
.order-title {
	font-size: 14px;
	font-weight: 600;
	display: block;
	color: #333;
}
.order-meta {
	font-size: 12px;
	color: #888;
	display: block;
}
.order-amount {
	font-size: 16px;
	font-weight: 700;
	color: #f56c6c;
}
.order-footer {
	display: flex;
	justify-content: flex-end;
}
.pay-btn {
	background: #409eff;
	color: #fff;
	border-radius: 6px;
	font-size: 12px;
	padding: 6px 16px;
	height: auto;
	line-height: 1.4;
}
.refund-btn {
	background: #f5f5f5;
	color: #666;
	border-radius: 6px;
	font-size: 12px;
	padding: 6px 16px;
	height: auto;
	line-height: 1.4;
}

.credit-section {
	padding: 12px;
}
.credit-card {
	background: linear-gradient(135deg, #409eff, #337ecc);
	border-radius: 12px;
	padding: 28px;
	text-align: center;
	color: #fff;
	margin-bottom: 12px;
}
.credit-label {
	font-size: 14px;
	opacity: 0.85;
}
.credit-value {
	font-size: 48px;
	font-weight: 700;
	display: block;
	margin: 4px 0;
}
.credit-value.high {
	color: #67c23a;
}
.credit-value.medium {
	color: #ffd666;
}
.credit-value.low {
	color: #ffa39e;
}
.credit-desc {
	font-size: 13px;
	opacity: 0.85;
}
.rules-card {
	background: #fff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
}
.rules-title {
	font-size: 15px;
	font-weight: 700;
	display: block;
	margin-bottom: 10px;
	color: #333;
}
.rule-item {
	font-size: 13px;
	display: block;
	padding: 4px 0;
	color: #666;
}
.log-section {
	background: #fff;
	border-radius: 12px;
	padding: 14px 16px;
	margin-bottom: 12px;
}
.section-title {
	font-size: 15px;
	font-weight: 700;
	display: block;
	margin-bottom: 10px;
	color: #333;
}
.log-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
	border-bottom: 1px solid #f5f5f5;
}
.log-reason {
	font-size: 14px;
	display: block;
	color: #333;
}
.log-time {
	font-size: 11px;
	color: #999;
	display: block;
}
.log-amount {
	font-size: 16px;
	font-weight: 600;
}
.log-amount.positive {
	color: #67c23a;
}
.log-amount.negative {
	color: #f56c6c;
}
.empty {
	text-align: center;
	padding: 40px 0;
	color: #999;
	font-size: 13px;
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