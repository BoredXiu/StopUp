<template>
  <div class="reports-page page-container">
    <div class="page-header"><h2>举报管理</h2></div>

    <div class="search-bar">
      <el-select v-model="status" placeholder="状态" clearable @change="fetchReports" style="width: 120px">
        <el-option label="待处理" :value="0" />
        <el-option label="已处理" :value="1" />
        <el-option label="已驳回" :value="2" />
      </el-select>
    </div>

    <el-table :data="reports" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="reporter_nickname" label="举报人" width="120" />
      <el-table-column prop="reported_nickname" label="被举报人" width="120" />
      <el-table-column prop="reason" label="举报原因" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="举报时间" width="170">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button link type="primary" @click="handleApprove(row)">通过</el-button>
            <el-button link type="danger" @click="handleReject(row)">驳回</el-button>
          </template>
          <span v-else style="color: #909399">已处理</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="fetchReports"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import dayjs from 'dayjs'

const reports = ref<any[]>([])
const loading = ref(false)
const status = ref<number | undefined>()
const page = ref(1)
const pageSize = 15
const total = ref(0)

function formatDate(d: string) { return dayjs(d).format('YYYY-MM-DD HH:mm') }
function getStatusText(s: number) {
  const map: Record<number, string> = { 0: '待处理', 1: '已通过', 2: '已驳回' }
  return map[s] || '未知'
}
function getStatusType(s: number) {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return (map[s] || 'info') as any
}

async function fetchReports() {
  loading.value = true
  try {
    const res = await adminApi.getReports({
      page: page.value, pageSize, status: status.value,
    })
    reports.value = res.data.list
    total.value = res.data.pagination.total
  } finally { loading.value = false }
}

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm('确认通过该举报？将通过扣除被举报人信用分', '操作确认', { type: 'warning' })
    await adminApi.handleReport(row.id, { status: 1, remark: '管理员审核通过' })
    ElMessage.success('已处理')
    fetchReports()
  } catch { /* cancelled */ }
}

async function handleReject(row: any) {
  try {
    await ElMessageBox.confirm('确认驳回该举报？', '操作确认')
    await adminApi.handleReport(row.id, { status: 2, remark: '管理员驳回' })
    ElMessage.success('已驳回')
    fetchReports()
  } catch { /* cancelled */ }
}

onMounted(fetchReports)
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>