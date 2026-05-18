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
					<text class="order-no">{{ order.orderNo }}</text>
					<text
						class="order-status"
						:class="{ 'status-pending': order.status === 0, 'status-active': order.status === 1, 'status-ended': order.status === 2 }"
					>
						{{ getStatusText(order.status) }}
					</text>
				</view>
				<view class="order-body">
					<view class="order-info">
						<text class="order-title">{{ order.matchTitle }}</text>
						<text class="order-meta">{{ order.sportName }} · {{ order.matchDate }}</text>
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
		>
			暂无订单
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onShow } from '@dcloudio/uni-app';
	import { orderApi } from '@/api';

	const tabs = [
		{ label: '全部', value: '' },
		{ label: '待支付', value: '1' },
		{ label: '已支付', value: '2' },
		{ label: '已取消', value: '3' },
		{ label: '已完成', value: '4' },
		{ label: '已退款', value: '5' }
	];
	const activeTab = ref('');
	const orders = ref([]);
	const loading = ref(false);

	function getStatusText(s) {
		const map = { 1: '待支付', 2: '已支付', 3: '已取消', 4: '已完成', 5: '已退款' };
		return map[s] || '未知';
	}
	function getStatusClass(s) {
		const map = { 1: 'pending', 2: 'paid', 3: 'cancelled', 4: 'done', 5: 'refunded' };
		return map[s] || '';
	}

	async function switchTab(value) {
		activeTab.value = value;
		await fetchOrders();
	}

	async function fetchOrders() {
		loading.value = true;
		try {
			const res = await orderApi.myOrders({
				pageSize: 50,
				status: activeTab.value ? Number(activeTab.value) : undefined
			});
			orders.value = res.data.list;
		} finally {
			loading.value = false;
		}
	}

	async function handlePay(order) {
		const res = await uni.showModal({ title: '确认支付', content: `确认支付 ¥${order.amount}？` });
		if (!res.confirm) return;
		try {
			await orderApi.pay(order.id);
			uni.showToast({ title: '支付成功', icon: 'success' });
			fetchOrders();
		} catch {
			/* ignore */
		}
	}

	async function handleRefund(order) {
		const res = await uni.showModal({ title: '确认退款', content: '确认申请退款？' });
		if (!res.confirm) return;
		try {
			await orderApi.refund(order.id, '用户申请退款');
			uni.showToast({ title: '退款成功', icon: 'success' });
			fetchOrders();
		} catch {
			/* ignore */
		}
	}

	onShow(fetchOrders);
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

	.order-list {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.order-card {
		background: #fff;
		border-radius: 10px;
		padding: 14px;
	}
	.order-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.order-no {
		font-size: 12px;
		color: #999;
	}
	.order-status {
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 8px;
	}
	.order-status.pending {
		background: #faecd8;
		color: #e6a23c;
	}
	.order-status.paid {
		background: #e1f3d8;
		color: #67c23a;
	}
	.order-status.cancelled {
		background: #f0f0f0;
		color: #999;
	}
	.order-status.refunded {
		background: #fde2e2;
		color: #f56c6c;
	}

	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.order-title {
		font-size: 14px;
		font-weight: 600;
		display: block;
	}
	.order-meta {
		font-size: 12px;
		color: #999;
	}
	.order-amount {
		font-size: 18px;
		font-weight: 700;
		color: #f56c6c;
	}

	.order-footer {
		display: flex;
		justify-content: flex-end;
	}
	.pay-btn {
		height: 32px;
		line-height: 32px;
		padding: 0 20px;
		background: #409eff;
		color: #fff;
		border-radius: 16px;
		font-size: 13px;
		border: none;
	}
	.refund-btn {
		height: 32px;
		line-height: 32px;
		padding: 0 20px;
		background: #e6a23c;
		color: #fff;
		border-radius: 16px;
		font-size: 13px;
		border: none;
	}
	.empty {
		text-align: center;
		padding: 60px 0;
		color: #999;
	}
</style>
