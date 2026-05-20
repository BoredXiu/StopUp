<template>
	<view class="page">
		<!-- 余额卡片 -->
		<view class="balance-card">
			<view
				class="balance-left"
				@tap="goBill"
			>
				<text class="balance-label">账户余额（元）</text>
				<view class="balance-row">
					<text class="balance-amount">{{ balanceText }}</text>
					<text class="balance-arrow">→</text>
				</view>
			</view>
			<view
				class="recharge-btn-inline"
				@tap="openRecharge"
			>
				<text class="recharge-btn-text">充值</text>
			</view>
		</view>

		<!-- 快捷充值 -->
		<view
			class="section"
			v-if="showRecharge"
		>
			<text class="section-title">选择充值金额</text>
			<view class="quick-amounts">
				<view
					v-for="item in quickAmounts"
					:key="item"
					class="amount-chip"
					:class="{ active: selectedAmount === item }"
					@tap="selectQuickAmount(item)"
				>
					<text class="amount-chip-value">{{ item }}</text>
					<text class="amount-chip-unit">元</text>
				</view>
			</view>

			<!-- 自定义金额 -->
			<view class="custom-amount">
				<text class="input-prefix">¥</text>
				<input
					class="amount-input"
					v-model="customAmount"
					type="digit"
					placeholder="输入自定义金额"
					placeholder-class="input-placeholder"
					@input="onCustomInput"
				/>
			</view>

			<!-- 支付方式 -->
			<view
				class="section-title"
				style="margin-top: 16px"
				>支付方式</view
			>
			<view class="payment-methods">
				<view
					class="pay-method"
					:class="{ active: paymentMethod === 'wechat' }"
					@tap="paymentMethod = 'wechat'"
				>
					<view class="pay-icon-circle pay-icon-wechat">
						<text class="pay-icon-text">微</text>
					</view>
					<text class="pay-name">微信支付</text>
					<view
						class="pay-radio"
						:class="{ checked: paymentMethod === 'wechat' }"
					></view>
				</view>
				<view
					class="pay-method"
					:class="{ active: paymentMethod === 'alipay' }"
					@tap="paymentMethod = 'alipay'"
				>
					<view class="pay-icon-circle pay-icon-alipay">
						<text class="pay-icon-text">支</text>
					</view>
					<text class="pay-name">支付宝</text>
					<view
						class="pay-radio"
						:class="{ checked: paymentMethod === 'alipay' }"
					></view>
				</view>
			</view>

			<!-- 确认充值 -->
			<view class="recharge-btn-wrapper">
				<button
					class="recharge-btn"
					:disabled="!canRecharge || submitting"
					@tap="confirmRecharge"
				>
					{{ submitting ? "处理中..." : "确认充值 ¥" + rechargeAmountText }}
				</button>
			</view>
		</view>

		<!-- 交易记录 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">交易记录</text>
				<text
					class="section-more"
					@tap="goBill"
					>全部 →</text
				>
			</view>
			<view
				class="transaction-list"
				v-if="transactions.length > 0"
			>
				<view
					v-for="tx in transactions"
					:key="tx.id"
					class="tx-item"
				>
					<view class="tx-left">
						<text class="tx-type">充值</text>
						<text class="tx-method">{{ tx.payment_method === "wechat" ? "微信支付" : "支付宝" }}</text>
						<text class="tx-time">{{ formatTime(tx.created_at) }}</text>
					</view>
					<view class="tx-right">
						<text class="tx-amount positive">+{{ Number(tx.amount).toFixed(2) }}</text>
						<text
							class="tx-status"
							:class="tx.status === 1 ? 'success' : 'pending'"
							>{{ tx.status === 1 ? "成功" : "处理中" }}</text
						>
					</view>
				</view>
			</view>
			<view
				class="empty-tx"
				v-else
			>
				<text class="empty-text">暂无交易记录</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { walletApi } from "@/api";

	const balance = ref(0);
	const showRecharge = ref(false);
	const quickAmounts = [10, 20, 50, 100, 200, 500];
	const selectedAmount = ref(0);
	const customAmount = ref("");
	const paymentMethod = ref("wechat");
	const submitting = ref(false);
	const transactions = ref<any[]>([]);

	const balanceText = computed(() => Number(balance.value).toFixed(2));

	const effectiveAmount = computed(() => {
		if (selectedAmount.value > 0) return selectedAmount.value;
		const val = parseFloat(customAmount.value);
		return isNaN(val) ? 0 : val;
	});

	const rechargeAmountText = computed(() => effectiveAmount.value.toFixed(2));

	const canRecharge = computed(() => effectiveAmount.value > 0 && !submitting.value);

	function selectQuickAmount(amount: number) {
		selectedAmount.value = amount;
		customAmount.value = "";
	}

	function onCustomInput() {
		if (customAmount.value) {
			selectedAmount.value = 0;
		}
	}

	function openRecharge() {
		showRecharge.value = !showRecharge.value;
	}

	function goBill() {
		uni.navigateTo({ url: "/subpkg/user/bill" });
	}

	async function fetchBalance() {
		try {
			const res: any = await walletApi.getBalance();
			balance.value = res.data.balance;
		} catch {
			/* handled by api layer */
		}
	}

	async function fetchTransactions() {
		try {
			const res: any = await walletApi.getTransactions({ pageSize: 5 });
			transactions.value = res.data.list || [];
		} catch {
			/* handled by api layer */
		}
	}

	async function confirmRecharge() {
		if (!canRecharge.value) return;

		const amount = effectiveAmount.value;
		const payMethod = paymentMethod.value;

		uni.showModal({
			title: "确认充值",
			content: `将使用${payMethod === "wechat" ? "微信支付" : "支付宝"}充值 ¥${amount.toFixed(2)}`,
			confirmText: "确认支付",
			cancelText: "取消",
			success: async (modalRes) => {
				if (!modalRes.confirm) return;

				submitting.value = true;
				try {
					// 1. 创建充值订单，获取预支付参数
					const orderRes: any = await walletApi.recharge(amount);
					const { orderNo, prepayParams } = orderRes.data;

					// 2. 调起微信支付
					if (prepayParams && prepayParams.package) {
						try {
							await requestPayment(prepayParams);
						} catch (payErr: any) {
							if (payErr?.errMsg?.includes("cancel")) {
								uni.showToast({ title: "已取消支付", icon: "none" });
								return;
							}
							throw payErr;
						}
					}

					// 3. 确认支付结果
					const confirmRes: any = await walletApi.confirmRecharge(orderNo);
					balance.value = confirmRes.data.balanceAfter;
					uni.showToast({ title: "充值成功", icon: "success" });

					// 重置
					showRecharge.value = false;
					selectedAmount.value = 0;
					customAmount.value = "";
					await fetchTransactions();
				} catch {
					// handled by api layer
				} finally {
					submitting.value = false;
				}
			},
		});
	}

	function requestPayment(params: Record<string, any>): Promise<void> {
		// #ifdef MP-WEIXIN
		// 开发模式跳过真实支付
		if (params._devMode) {
			return new Promise<void>((resolve) => {
				setTimeout(() => resolve(), 500);
			});
		}
		return new Promise((resolve, reject) => {
			// @ts-ignore
			wx.requestPayment({
				timeStamp: params.timeStamp,
				nonceStr: params.nonceStr,
				package: params.package,
				signType: params.signType || "MD5",
				paySign: params.paySign,
				success: () => resolve(),
				fail: reject,
			});
		});
		// #endif
		// #ifndef MP-WEIXIN
		return new Promise<void>((resolve) => {
			setTimeout(() => resolve(), 500);
		});
		// #endif
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

	/* 余额卡片 - inline layout */
	.balance-card {
		margin: 16px 14px;
		padding: 20px;
		background: linear-gradient(135deg, #2979ff, #1565c0);
		border-radius: 16px;
		color: #fff;
		box-shadow: 0 4px 20px rgba(21, 101, 192, 0.3);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.balance-left {
		flex: 1;
	}
	.balance-label {
		font-size: 13px;
		opacity: 0.8;
		display: block;
	}
	.balance-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}
	.balance-amount {
		font-size: 36px;
		font-weight: 700;
		font-family: -apple-system, "Helvetica Neue", sans-serif;
		letter-spacing: 1px;
	}
	.balance-arrow {
		font-size: 16px;
		opacity: 0.6;
	}
	.recharge-btn-inline {
		padding: 10px 20px;
		background: rgba(255, 255, 255, 0.22);
		border-radius: 20px;
		flex-shrink: 0;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	.recharge-btn-text {
		font-size: 14px;
		font-weight: 600;
		color: #fff;
	}

	/* 充值区域 */
	.section {
		background: #fff;
		margin: 0 14px 12px;
		border-radius: 12px;
		padding: 16px;
	}
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 12px;
	}
	.section-header .section-title {
		margin-bottom: 0;
	}
	.section-more {
		font-size: 13px;
		color: #409eff;
	}

	/* 快捷金额 */
	.quick-amounts {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.amount-chip {
		flex: 0 0 calc(33.33% - 7px);
		padding: 12px 0;
		text-align: center;
		border: 1.5px solid #e5e5e5;
		border-radius: 10px;
		background: #fafafa;
	}
	.amount-chip.active {
		border-color: #2979ff;
		background: #ecf3ff;
	}
	.amount-chip-value {
		font-size: 20px;
		font-weight: 700;
		color: #333;
		display: block;
	}
	.amount-chip.active .amount-chip-value {
		color: #2979ff;
	}
	.amount-chip-unit {
		font-size: 11px;
		color: #999;
	}

	/* 自定义金额 */
	.custom-amount {
		display: flex;
		align-items: center;
		margin-top: 12px;
		padding: 12px 14px;
		background: #f5f7fa;
		border-radius: 10px;
	}
	.input-prefix {
		font-size: 20px;
		font-weight: 700;
		color: #333;
		margin-right: 8px;
	}
	.amount-input {
		flex: 1;
		font-size: 18px;
		font-weight: 600;
		color: #333;
	}
	.input-placeholder {
		font-size: 14px;
		color: #bbb;
		font-weight: 400;
	}

	/* 支付方式 - 官方图标 */
	.payment-methods {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pay-method {
		display: flex;
		align-items: center;
		padding: 14px;
		border: 1.5px solid #e5e5e5;
		border-radius: 10px;
		background: #fafafa;
	}
	.pay-method.active {
		border-color: #2979ff;
		background: #ecf3ff;
	}
	.pay-icon-circle {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 10px;
		flex-shrink: 0;
	}
	.pay-icon-wechat {
		background: linear-gradient(135deg, #09bb07, #07c160);
	}
	.pay-icon-alipay {
		background: linear-gradient(135deg, #1677ff, #0066db);
	}
	.pay-icon-text {
		font-size: 13px;
		font-weight: 700;
		color: #fff;
	}
	.pay-name {
		flex: 1;
		font-size: 15px;
		color: #333;
	}
	.pay-radio {
		width: 20px;
		height: 20px;
		border: 2px solid #ccc;
		border-radius: 50%;
	}
	.pay-radio.checked {
		border-color: #2979ff;
		background: #2979ff;
		position: relative;
	}
	.pay-radio.checked::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: #fff;
		border-radius: 50%;
	}

	/* 充值按钮 */
	.recharge-btn-wrapper {
		margin-top: 20px;
	}
	.recharge-btn {
		width: 100%;
		height: 48px;
		line-height: 48px;
		background: linear-gradient(135deg, #2979ff, #1565c0);
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		border-radius: 12px;
		border: none;
	}
	.recharge-btn[disabled] {
		opacity: 0.5;
	}

	/* 交易记录 */
	.transaction-list {
		display: flex;
		flex-direction: column;
	}
	.tx-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid #f5f5f5;
	}
	.tx-item:last-child {
		border-bottom: none;
	}
	.tx-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.tx-type {
		font-size: 15px;
		font-weight: 500;
		color: #333;
	}
	.tx-method {
		font-size: 12px;
		color: #999;
	}
	.tx-time {
		font-size: 11px;
		color: #bbb;
	}
	.tx-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	.tx-amount {
		font-size: 16px;
		font-weight: 600;
	}
	.tx-amount.positive {
		color: #67c23a;
	}
	.tx-status {
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 4px;
	}
	.tx-status.success {
		background: #f0f9eb;
		color: #67c23a;
	}
	.tx-status.pending {
		background: #fdf6ec;
		color: #e6a23c;
	}
	.empty-tx {
		padding: 32px 0;
		text-align: center;
	}
	.empty-text {
		font-size: 13px;
		color: #999;
	}
</style>
