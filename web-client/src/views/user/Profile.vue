<template>
	<div class="profile-page container page-container">
		<div class="profile-card">
			<div class="profile-header">
				<el-avatar
					:size="80"
					:src="userStore.user?.avatar"
				>
					{{ userStore.user?.nickname?.charAt(0) }}
				</el-avatar>
				<div class="profile-info">
					<h2>{{ userStore.user?.nickname }}</h2>
					<p class="profile-bio">{{ userStore.user?.bio || "这个人很懒，什么都没写..." }}</p>
					<div class="profile-meta">
						<span v-if="userStore.user?.city">{{ userStore.user.city }}</span>
						<span>信用分: {{ userStore.user?.creditScore }}</span>
					</div>
				</div>
				<el-button @click="showEditDialog = true">编辑资料</el-button>
				<el-button
					type="danger"
					plain
					@click="handleLogout"
					>退出登录</el-button
				>
			</div>
		</div>

		<div class="profile-tabs">
			<el-tabs
				v-model="activeTab"
				@tab-change="handleTabChange"
			>
				<el-tab-pane
					label="我参与的球局"
					name="matches"
				>
					<div v-loading="matchesLoading">
						<div
							class="match-grid"
							v-if="matches.length > 0"
						>
							<MatchCard
								v-for="match in matches"
								:key="match.id"
								:match="match"
							/>
						</div>
						<el-empty
							v-else
							description="暂无参与的球局"
						/>
						<div
							class="tab-pagination"
							v-if="matchesTotal > 10"
						>
							<el-pagination
								v-model:current-page="matchesPage"
								:page-size="10"
								:total="matchesTotal"
								layout="prev, pager, next"
								small
								@current-change="fetchMatches"
							/>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane
					label="订单记录"
					name="orders"
				>
					<div v-loading="ordersLoading">
						<div
							class="order-list"
							v-if="orders.length > 0"
						>
							<div
								v-for="order in orders"
								:key="order.id"
								class="order-card"
							>
								<div class="order-header">
									<span class="order-no">订单号: {{ order.orderNo }}</span>
									<el-tag
										:type="getOrderStatusType(order.status)"
										size="small"
									>
										{{ getOrderStatusText(order.status) }}
									</el-tag>
								</div>
								<div class="order-body">
									<div class="order-info">
										<h4>{{ order.matchTitle }}</h4>
										<p>{{ order.sportName }} · {{ formatDate(order.matchDate) }}</p>
									</div>
									<div class="order-amount">¥{{ order.amount }}</div>
								</div>
								<div class="order-footer">
									<span class="order-time">{{ formatDateTime(order.createdAt) }}</span>
									<div class="order-actions">
										<el-button
											v-if="order.status === 1"
											type="primary"
											size="small"
											@click="handlePay(order)"
										>
											立即支付
										</el-button>
										<el-button
											v-if="order.status === 2"
											type="warning"
											size="small"
											@click="handleRefund(order)"
										>
											申请退款
										</el-button>
									</div>
								</div>
							</div>
						</div>
						<el-empty
							v-else
							description="暂无订单"
						/>
						<div
							class="tab-pagination"
							v-if="ordersTotal > 10"
						>
							<el-pagination
								v-model:current-page="ordersPage"
								:page-size="10"
								:total="ordersTotal"
								layout="prev, pager, next"
								small
								@current-change="fetchOrders"
							/>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane
					label="信用记录"
					name="credit"
				>
					<div
						class="credit-section"
						v-loading="creditLoading"
					>
						<div class="credit-rules">
							<h4>信用规则</h4>
							<ul>
								<li>✅ 参加球局 +2分</li>
								<li>✅ 完成球局 +5分</li>
								<li>❌ 放鸽子 -20分</li>
								<li>⚠️ 信用分低于60分将无法报名</li>
							</ul>
						</div>
						<div class="credit-logs">
							<h3>变动记录</h3>
							<div class="log-list">
								<div
									v-for="log in creditLogs"
									:key="log.id"
									class="log-item"
								>
									<div class="log-info">
										<span class="log-reason">{{ getReasonText(log.reason) }}</span>
										<span class="log-time">{{ formatDateTime(log.createdAt) }}</span>
									</div>
									<span
										class="log-amount"
										:class="log.changeAmount > 0 ? 'positive' : 'negative'"
									>
										{{ log.changeAmount > 0 ? "+" : "" }}{{ log.changeAmount }}
									</span>
								</div>
							</div>
							<el-empty
								v-if="creditLogs.length === 0"
								description="暂无信用记录"
							/>
						</div>
						<div
							class="tab-pagination"
							v-if="creditTotal > 15"
						>
							<el-pagination
								v-model:current-page="creditPage"
								:page-size="15"
								:total="creditTotal"
								layout="prev, pager, next"
								small
								@current-change="fetchCreditLogs"
							/>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>

		<el-dialog
			v-model="showEditDialog"
			title="编辑资料"
			width="480px"
		>
			<el-form
				:model="editForm"
				label-width="80px"
			>
				<el-form-item label="昵称">
					<el-input
						v-model="editForm.nickname"
						maxlength="20"
					/>
				</el-form-item>
				<el-form-item label="性别">
					<el-radio-group v-model="editForm.gender">
						<el-radio :value="0">未知</el-radio>
						<el-radio :value="1">男</el-radio>
						<el-radio :value="2">女</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="城市">
					<el-input
						v-model="editForm.city"
						placeholder="所在城市"
					/>
				</el-form-item>
				<el-form-item label="个性签名">
					<el-input
						v-model="editForm.bio"
						type="textarea"
						maxlength="200"
						show-word-limit
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showEditDialog = false">取消</el-button>
				<el-button
					type="primary"
					@click="handleSave"
					:loading="saving"
					>保存</el-button
				>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import { ElMessage, ElMessageBox } from "element-plus";
	import { useUserStore } from "@/store/user";
	import { matchApi, orderApi, userApi } from "@/api";
	import type { Match, Order, CreditLog } from "@/types";
	import MatchCard from "@/components/MatchCard.vue";
	import { formatDate, formatDateTime, getOrderStatusText } from "@/utils/format";

	const userStore = useUserStore();
	const router = useRouter();
	const activeTab = ref("matches");
	const showEditDialog = ref(false);
	const saving = ref(false);

	const editForm = reactive({
		nickname: userStore.user?.nickname || "",
		gender: userStore.user?.gender || 0,
		city: userStore.user?.city || "",
		bio: userStore.user?.bio || "",
	});

	const matches = ref<Match[]>([]);
	const matchesLoading = ref(false);
	const matchesPage = ref(1);
	const matchesTotal = ref(0);

	const orders = ref<Order[]>([]);
	const ordersLoading = ref(false);
	const ordersPage = ref(1);
	const ordersTotal = ref(0);

	const creditLogs = ref<CreditLog[]>([]);
	const creditLoading = ref(false);
	const creditPage = ref(1);
	const creditTotal = ref(0);

	function getOrderStatusType(status: number): "warning" | "success" | "info" | "danger" | "" {
		const map: Record<number, "warning" | "success" | "info" | "danger" | ""> = {
			1: "warning",
			2: "success",
			3: "info",
			4: "",
			5: "danger",
		};
		return map[status] || "info";
	}

	function getReasonText(reason: string): string {
		const map: Record<string, string> = {
			join_match: "参加球局",
			complete_match: "完成球局",
			no_show: "放鸽子",
			report_approved: "举报成立",
		};
		return map[reason] || reason;
	}

	function handleTabChange(tab: string) {
		if (tab === "matches" && matches.value.length === 0) fetchMatches();
		else if (tab === "orders" && orders.value.length === 0) fetchOrders();
		else if (tab === "credit" && creditLogs.value.length === 0) fetchCreditLogs();
	}

	async function fetchMatches() {
		matchesLoading.value = true;
		try {
			const res = await matchApi.myMatches({ page: matchesPage.value, pageSize: 10 });
			matches.value = res.data.list as Match[];
			matchesTotal.value = res.data.pagination.total;
		} finally {
			matchesLoading.value = false;
		}
	}

	async function fetchOrders() {
		ordersLoading.value = true;
		try {
			const res = await orderApi.myOrders({ page: ordersPage.value, pageSize: 10 });
			orders.value = res.data.list as Order[];
			ordersTotal.value = res.data.pagination.total;
		} finally {
			ordersLoading.value = false;
		}
	}

	async function fetchCreditLogs() {
		creditLoading.value = true;
		try {
			const res = await userApi.getCreditLogs({ page: creditPage.value, pageSize: 15 });
			creditLogs.value = res.data.list as CreditLog[];
			creditTotal.value = res.data.pagination.total;
		} finally {
			creditLoading.value = false;
		}
	}

	async function handlePay(order: Order) {
		try {
			await ElMessageBox.confirm(`确认支付 ¥${order.amount}？`, "支付确认");
			await orderApi.pay(order.id);
			ElMessage.success("支付成功");
			fetchOrders();
		} catch {
			/* cancelled */
		}
	}

	async function handleRefund(order: Order) {
		try {
			await ElMessageBox.confirm("确认申请退款？", "退款确认", { type: "warning" });
			await orderApi.refund(order.id, "用户申请退款");
			ElMessage.success("退款成功");
			fetchOrders();
		} catch {
			/* cancelled */
		}
	}

	async function handleSave() {
		saving.value = true;
		try {
			await userApi.updateProfile(editForm);
			await userStore.fetchProfile();
			ElMessage.success("保存成功");
			showEditDialog.value = false;
		} finally {
			saving.value = false;
		}
	}

	async function handleLogout() {
		try {
			await ElMessageBox.confirm("确定要退出登录吗？", "提示", { type: "warning" });
			userStore.logout();
			ElMessage.success("已退出登录");
			router.push("/");
		} catch {
			/* cancelled */
		}
	}

	onMounted(() => {
		fetchMatches();
	});
</script>

<style scoped>
	.profile-card {
		background: #fff;
		border-radius: 12px;
		padding: 32px;
		margin-bottom: 24px;
	}
	.profile-header {
		display: flex;
		align-items: center;
		gap: 24px;
	}
	.profile-info {
		flex: 1;
	}
	.profile-info h2 {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 6px;
	}
	.profile-bio {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 8px;
	}
	.profile-meta {
		display: flex;
		gap: 16px;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.profile-tabs {
		background: #fff;
		border-radius: 12px;
		padding: 24px;
	}
	.match-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	@media (max-width: 768px) {
		.match-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.order-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.order-card {
		background: #f9fafb;
		border-radius: 10px;
		padding: 16px;
	}
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.order-no {
		font-size: 13px;
		color: var(--text-secondary);
	}
	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}
	.order-info h4 {
		font-size: 15px;
		font-weight: 600;
	}
	.order-info p {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 2px;
	}
	.order-amount {
		font-size: 18px;
		font-weight: 700;
		color: var(--primary-color);
	}
	.order-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.order-time {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.order-actions {
		display: flex;
		gap: 8px;
	}
	.credit-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.credit-rules {
		background: #f9fafb;
		border-radius: 10px;
		padding: 20px;
	}
	.credit-rules h4 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.credit-rules ul {
		list-style: none;
	}
	.credit-rules li {
		font-size: 14px;
		padding: 4px 0;
		color: var(--text-regular);
	}
	.credit-logs h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.log-list {
		display: flex;
		flex-direction: column;
	}
	.log-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid var(--border-color);
	}
	.log-item:last-child {
		border-bottom: none;
	}
	.log-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.log-reason {
		font-size: 14px;
	}
	.log-time {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.log-amount {
		font-size: 18px;
		font-weight: 700;
	}
	.log-amount.positive {
		color: #67c23a;
	}
	.log-amount.negative {
		color: #f56c6c;
	}
	.tab-pagination {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}
</style>
