<template>
  <div class="my-orders-page container page-container">
    <h1 class="page-title">我的订单</h1>

    <el-tabs v-model="activeTab" @tab-change="fetchOrders">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="待支付" name="1" />
      <el-tab-pane label="已支付" name="2" />
      <el-tab-pane label="已取消" name="3" />
      <el-tab-pane label="已完成" name="4" />
      <el-tab-pane label="已退款" name="5" />
    </el-tabs>

    <div class="order-list" v-loading="loading">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <el-tag :type="getOrderStatusType(order.status)" size="small">
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

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchOrders"
      />
    </div>

    <el-empty v-if="!loading && orders.length === 0" description="暂无订单" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api'
import type { Order } from '@/types'
import { formatDate, formatDateTime, getOrderStatusText } from '@/utils/format'

const activeTab = ref('')
const orders = ref<Order[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)

function getOrderStatusType(status: number): 'warning' | 'success' | 'info' | 'danger' | '' {
  const map: Record<number, 'warning' | 'success' | 'info' | 'danger' | ''> = {
    1: 'warning', 2: 'success', 3: 'info', 4: '', 5: 'danger',
  }
  return map[status] || 'info'
}

async function fetchOrders() {
  loading.value = true
  try {
    const res = await orderApi.myOrders({
      page: page.value,
      pageSize,
      status: activeTab.value ? Number(activeTab.value) : undefined,
    })
    orders.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

async function handlePay(order: Order) {
  try {
    await ElMessageBox.confirm(`确认支付 ¥${order.amount}？`, '支付确认')
    await orderApi.pay(order.id)
    ElMessage.success('支付成功')
    fetchOrders()
  } catch { /* cancelled */ }
}

async function handleRefund(order: Order) {
  try {
    await ElMessageBox.confirm('确认申请退款？', '退款确认', { type: 'warning' })
    await orderApi.refund(order.id, '用户申请退款')
    ElMessage.success('退款成功')
    fetchOrders()
  } catch { /* cancelled */ }
}

onMounted(fetchOrders)
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.order-no {
  font-size: 13px;
  color: var(--text-secondary);
}
.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.order-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.order-info p {
  font-size: 13px;
  color: var(--text-secondary);
}
.order-amount {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.order-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>