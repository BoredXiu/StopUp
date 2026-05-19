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

		<view class="order-list">
			<view
				v-for="order in orders"
				:key="order.id"
				class="order-card"
			>
				<view class="order-header">
					<text class="order-no">订单号: {{ order.orderNo }}</text>
					<text
						class="order-status"
						:class="getStatusClass(order.status)"
					>
						{{ getStatusText(order.status) }}
					</text>
				</view>
				<view class="order-body">
					<view class="order-info">
						<text class="order-title">{{ order.matchTitle }}</text>
						<text class="order-meta">{{ order.sportName }} · {{ order.matchDate }} {{ order.startTime }}</text>
						<text
							class="order-meta"
							v-if="order.venueName"
							>📍 {{ order.venueName }}</text
						>
						<text class="order-time">下单时间: {{ order.createdAt }}</text>
						<text
							class="order-time"
							v-if="order.status === 2 && order.paidAt"
							>支付时间: {{ order.paidAt }}</text
						>
					</view>
					<text class="order-amount">¥{{ order.amount }}</text>
				</view>
				<view
					class="order-footer"
					v-if="order.status === 1"
				>
					<button
						class="pay-btn"
						@tap="handlePay(order)"
					>
						立即支付
					</button>
				</view>
				<view
					class="order-footer"
					v-if="order.status === 2"
				>
					<button
						class="refund-btn"
						@tap="handleRefund(order)"
					>
						申请退款
					</button>
				</view>
			</view>
		</view>

		<view
			class="empty"
			v-if="!loading && orders.length === 0"
			>暂无订单</view
		>
	</view>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { orderApi } from "@/api";
	import type { Order } from "@/types";

	const tabs = [
		{ label: "全部", value: "" },
		{ label: "待支付", value: "1" },
		{ label: "已支付", value: "2" },
		{ label: "已取消", value: "3" },
		{ label: "已完成", value: "4" },
		{ label: "已退款", value: "5" },
	];
	const activeTab = ref("");
	const orders = ref<Order[]>([]);
	const loading = ref(false);

	function getStatusText(s: number): string {
		const map: Record<number, string> = { 1: "待支付", 2: "已支付", 3: "已取消", 4: "已完成", 5: "已退款" };
		return map[s] || "未知";
	}
	function getStatusClass(s: number): string {
		const map: Record<number, string> = { 1: "status-pending", 2: "status-active", 3: "status-cancelled", 4: "status-ended", 5: "status-refunded" };
		return map[s] || "";
	}

	async function switchTab(value: string): Promise<void> {
		activeTab.value = value;
		await fetchOrders();
	}

	async function fetchOrders(): Promise<void> {
		loading.value = true;
		try {
			const res = await orderApi.myOrders({
				pageSize: 50,
				status: activeTab.value ? Number(activeTab.value) : undefined,
			});
			orders.value = (res.data.list || []).map(mapOrder);
		} catch (err: any) {
			const msg = err?.message || "";
			if (msg && msg !== "cancel") {
				uni.showToast({ title: msg, icon: "none" });
			}
		} finally {
			loading.value = false;
		}
	}

	function mapOrder(raw: any): Order {
		return {
			...raw,
			matchTitle: raw.match_title || raw.matchTitle || "",
			sportName: raw.sport_name || raw.sportName || "",
			venueName: raw.venue_name || raw.venueName || "",
			matchDate: raw.match_date || raw.matchDate || "",
			startTime: raw.start_time || raw.startTime || "",
			endTime: raw.end_time || raw.endTime || "",
			orderNo: raw.order_no || raw.orderNo || "",
			paidAt: raw.paid_at || raw.paidAt || null,
			refundedAt: raw.refunded_at || raw.refundedAt || null,
			createdAt: raw.created_at || raw.createdAt || "",
		};
	}

	async function handlePay(order: Order): Promise<void> {
		const res = await uni.showModal({ title: "确认支付", content: `确认支付 ¥${order.amount}？` });
		if (!res.confirm) return;
		try {
			await orderApi.pay(order.id);
			uni.showToast({ title: "支付成功", icon: "success" });
			fetchOrders();
		} catch (_) {
			/* ignore */
		}
	}

	async function handleRefund(order: Order): Promise<void> {
		const res = await uni.showModal({ title: "确认退款？", content: "退款后无法恢复" });
		if (!res.confirm) return;
		try {
			await orderApi.refund(order.id);
			uni.showToast({ title: "退款申请已提交", icon: "success" });
			fetchOrders();
		} catch (_) {
			/* ignore */
		}
	}

	onShow(fetchOrders);
</script>

<style scoped>
	.page {
		background: #f5f5f5;
		min-height: 100vh;
	}
	.tabs {
		display: flex;
		background: #fff;
		padding: 8px 0;
		overflow-x: auto;
		white-space: nowrap;
	}
	.tab-item {
		padding: 6px 16px;
		font-size: 13px;
		color: #666;
		flex-shrink: 0;
	}
	.tab-item.active {
		color: #409eff;
		font-weight: 600;
	}
	.order-list {
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.order-card {
		background: #fff;
		border-radius: 10px;
		padding: 12px;
	}
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.order-no {
		font-size: 12px;
		color: #999;
	}
	.order-status {
		font-size: 12px;
		padding: 2px 6px;
		border-radius: 4px;
	}
	.status-pending {
		color: #e6a23c;
		background: #fdf6ec;
	}
	.status-active {
		color: #409eff;
		background: #ecf5ff;
	}
	.status-cancelled {
		color: #999;
		background: #f5f5f5;
	}
	.status-ended {
		color: #67c23a;
		background: #f0f9eb;
	}
	.status-refunded {
		color: #909399;
		background: #f5f5f5;
	}
	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
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
	.order-time {
		font-size: 11px;
		color: #aaa;
		display: block;
		margin-top: 2px;
	}
	.order-amount {
		font-size: 16px;
		font-weight: 700;
		color: #f56c6c;
	}
	.order-footer {
		margin-top: 8px;
		text-align: right;
	}
	.pay-btn {
		background: #409eff;
		color: #fff;
		font-size: 12px;
		padding: 6px 16px;
		border-radius: 6px;
		display: inline-block;
	}
	.refund-btn {
		background: #f56c6c;
		color: #fff;
		font-size: 12px;
		padding: 6px 16px;
		border-radius: 6px;
		display: inline-block;
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
	}
</style>
