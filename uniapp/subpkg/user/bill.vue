<template>
	<view class="page">
		<!-- 余额概要 -->
		<view class="summary-card">
			<text class="summary-label">账户余额（元）</text>
			<text class="summary-amount">{{ balanceText }}</text>
		</view>

		<!-- 账单列表 -->
		<view class="bill-section">
			<text class="section-title">收支记录</text>
			<view
				class="bill-list"
				v-if="transactions.length > 0"
			>
				<view
					v-for="tx in transactions"
					:key="tx.id"
					class="bill-item"
				>
					<view class="bill-left">
						<view class="bill-type-icon" :class="tx.type === 'recharge' ? 'icon-in' : 'icon-out'">
							<text>{{ tx.type === 'recharge' ? '+' : '-' }}</text>
						</view>
						<view class="bill-info">
							<text class="bill-title">{{ tx.type === 'recharge' ? '余额充值' : tx.type === 'refund' ? '退款' : '提现' }}</text>
							<text class="bill-method">{{ tx.payment_method === 'wechat' ? '微信支付' : tx.payment_method === 'alipay' ? '支付宝' : '' }}</text>
							<text class="bill-time">{{ formatTime(tx.created_at) }}</text>
						</view>
					</view>
					<view class="bill-right">
						<text
							class="bill-amount"
							:class="tx.amount > 0 ? 'positive' : 'negative'"
							>{{ tx.amount > 0 ? '+' : '' }}{{ Number(tx.amount).toFixed(2) }}</text
						>
						<text class="bill-balance">余额 {{ Number(tx.balance_after).toFixed(2) }}</text>
						<text
							class="bill-status"
							:class="tx.status === 1 ? 'success' : 'pending'"
							>{{ tx.status === 1 ? "成功" : "处理中" }}</text
						>
					</view>
				</view>
			</view>
			<view
				class="empty-bill"
				v-else
			>
				<text class="empty-text">暂无收支记录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { walletApi } from "@/api";

	const balance = ref(0);
	const transactions = ref<any[]>([]);

	const balanceText = computed(() => Number(balance.value).toFixed(2));

	async function fetchBalance() {
		try {
			const res: any = await walletApi.getBalance();
			balance.value = res.data.balance;
		} catch { /* handled by api layer */ }
	}

	async function fetchTransactions() {
		try {
			const res: any = await walletApi.getTransactions({ pageSize: 100 });
			transactions.value = res.data.list || [];
		} catch { /* handled by api layer */ }
	}

	function formatTime(timeStr: string) {
		if (!timeStr) return "";
		return timeStr.replace("T", " ").slice(0, 19);
	}

	onShow(() => {
		fetchBalance();
		fetchTransactions();
	});
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background: #f5f5f5;
		padding-bottom: 40px;
	}

	/* 余额概要 */
	.summary-card {
		margin: 16px 14px;
		padding: 24px;
		background: linear-gradient(135deg, #2979ff, #1565c0);
		border-radius: 16px;
		color: #fff;
		text-align: center;
	}
	.summary-label {
		font-size: 13px;
		opacity: 0.8;
		display: block;
		margin-bottom: 8px;
	}
	.summary-amount {
		font-size: 40px;
		font-weight: 700;
		font-family: -apple-system, "Helvetica Neue", sans-serif;
	}

	/* 账单列表 */
	.bill-section {
		background: #fff;
		margin: 0 14px 12px;
		border-radius: 12px;
		padding: 16px;
	}
	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 12px;
	}
	.bill-list {
		display: flex;
		flex-direction: column;
	}
	.bill-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	.bill-item:last-child {
		border-bottom: none;
	}
	.bill-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.bill-type-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.bill-type-icon.icon-in {
		background: #f0f9eb;
		color: #67c23a;
	}
	.bill-type-icon.icon-out {
		background: #fef0f0;
		color: #f56c6c;
	}
	.bill-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.bill-title {
		font-size: 15px;
		font-weight: 500;
		color: #333;
	}
	.bill-method {
		font-size: 12px;
		color: #999;
	}
	.bill-time {
		font-size: 11px;
		color: #bbb;
	}
	.bill-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	.bill-amount {
		font-size: 16px;
		font-weight: 600;
	}
	.bill-amount.positive {
		color: #67c23a;
	}
	.bill-amount.negative {
		color: #f56c6c;
	}
	.bill-balance {
		font-size: 11px;
		color: #bbb;
	}
	.bill-status {
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 4px;
	}
	.bill-status.success {
		background: #f0f9eb;
		color: #67c23a;
	}
	.bill-status.pending {
		background: #fdf6ec;
		color: #e6a23c;
	}
	.empty-bill {
		padding: 40px 0;
		text-align: center;
	}
	.empty-text {
		font-size: 13px;
		color: #999;
	}
</style>