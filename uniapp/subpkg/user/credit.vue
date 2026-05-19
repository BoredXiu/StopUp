<template>
	<view class="page">
		<view class="credit-card">
			<text class="credit-label">当前信用分</text>
			<text
				class="credit-value"
				:class="scoreClass"
				>{{ (userStore.user && userStore.user.creditScore) || 0 }}</text
			>
			<text class="credit-desc">{{ scoreDesc }}</text>
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
					v-for="log in logs"
					:key="log.id"
					class="log-item"
				>
					<view class="log-info">
						<text class="log-reason">{{ getReasonText(log.reason) }}</text>
						<text class="log-time">{{ formatDateTime(log.createdAt) }}</text>
					</view>
					<text
						class="log-amount"
						:class="log.changeAmount > 0 ? 'positive' : 'negative'"
					>
						{{ log.changeAmount > 0 ? "+" : "" }}{{ log.changeAmount }}
					</text>
				</view>
			</view>
			<view
				class="empty"
				v-if="!logs.length"
				>暂无记录</view
			>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue";
	import { onShow } from "@dcloudio/uni-app";
	import { useUserStore } from "@/store/user";
	import { userApi } from "@/api";
	import { formatDateTime } from "@/utils/format";
	import type { CreditLog } from "@/types";

	const userStore = useUserStore();
	const logs = ref<CreditLog[]>([]);

	const scoreClass = computed(() => {
		const score = (userStore.user && userStore.user.creditScore) || 0;
		if (score >= 80) return "high";
		if (score >= 60) return "medium";
		return "low";
	});
	const scoreDesc = computed(() => {
		const score = (userStore.user && userStore.user.creditScore) || 0;
		if (score >= 90) return "信用优秀，继续保持！";
		if (score >= 80) return "信用良好";
		if (score >= 60) return "信用一般，请注意";
		return "信用较低，部分功能受限";
	});

	function getReasonText(reason: string): string {
		const map: Record<string, string> = {
			join_match: "参加场局",
			complete_match: "完成场局",
			no_show: "放鸽子",
			report_approved: "举报成立",
		};
		return map[reason] || reason;
	}

	onShow(async () => {
		await userStore.fetchProfile();
		try {
			const res = await userApi.getCreditLogs({ pageSize: 50 });
			logs.value = res.data.list;
		} catch (_) {
			/* ignore */
		}
	});
</script>

<style scoped>
	.page {
		padding: 16px;
	}
	.credit-card {
		background: linear-gradient(135deg, #409eff, #337ecc);
		border-radius: 12px;
		padding: 32px;
		text-align: center;
		color: #fff;
		margin-bottom: 16px;
	}
	.credit-label {
		font-size: 14px;
		opacity: 0.85;
	}
	.credit-value {
		font-size: 56px;
		font-weight: 700;
		display: block;
		margin: 8px 0;
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
		margin-bottom: 16px;
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
		padding: 30px 0;
		color: #999;
	}
</style>
