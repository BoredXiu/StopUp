<template>
  <div class="orders-page page-container">
    <div class="page-header"><h2>订单管理</h2></div>

    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索订单号" clearable @input="fetchOrders" style="width: 240px" />
      <el-select v-model="status" placeholder="状态" clearable @change="fetchOrders" style="width: 120px">
        <el-option label="待支付" :value="1" />
        <el-option label="已支付" :value="2" />
        <el-option label="已取消" :value="3" />
        <el-option label="已完成" :value="4" />
        <el-option label="已退款" :value="5" />
      </el-select>
    </div>

    <el-table :data="orders" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="match_title" label="球局" min-width="160" show-overflow-tooltip />
      <el-table-column prop="user_nickname" label="用户" width="120" />
      <el-table-column prop="amount" label="金额" width="100">
        <template #default="{ row }">¥{{ row.amount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="fetchOrders"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import dayjs from 'dayjs'

const orders = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>()
const page = ref(1)
const pageSize = 15
const total = ref(0)

function formatDate(d: string) { return dayjs(d).format('YYYY-MM-DD HH:mm') }
function getStatusText(s: number) {
  const map: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '已取消', 4: '已完成', 5: '已退款' }
  return map[s] || '未知'
}
function getStatusType(s: number) {
  const map: Record<number, string> = { 1: 'warning', 2: 'success', 3: 'info', 4: '', 5: 'danger' }
  return (map[s] || 'info') as any
}

let timer: ReturnType<typeof setTimeout>
function fetchOrders() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    loading.value = true
    try {
      const res = await adminApi.getOrders({
        page: page.value, pageSize, keyword: keyword.value || undefined,
        status: status.value,
      })
      orders.value = res.data.list
      total.value = res.data.pagination.total
    } finally { loading.value = false }
  }, 200)
}

onMounted(fetchOrders)
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>