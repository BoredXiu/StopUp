<template>
  <div class="matches-page page-container">
    <div class="page-header"><h2>球局管理</h2></div>

    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索球局标题" clearable @input="fetchMatches" style="width: 240px" />
      <el-select v-model="status" placeholder="状态" clearable @change="fetchMatches" style="width: 120px">
        <el-option label="报名中" :value="1" />
        <el-option label="已满员" :value="2" />
        <el-option label="已开始" :value="3" />
        <el-option label="已结束" :value="4" />
        <el-option label="已取消" :value="5" />
      </el-select>
    </div>

    <el-table :data="matches" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="sport_name" label="运动类型" width="100" />
      <el-table-column prop="creator_nickname" label="创建者" width="120" />
      <el-table-column label="人数" width="90">
        <template #default="{ row }">{{ row.current_players }}/{{ row.max_players }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="match_date" label="日期" width="110" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 1 || row.status === 2" link type="danger" @click="handleCancel(row)">
            取消
          </el-button>
          <el-button v-if="row.status === 3" link type="success" @click="handleComplete(row)">
            结束
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="fetchMatches"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'

const matches = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>()
const page = ref(1)
const pageSize = 15
const total = ref(0)

function getStatusText(s: number) {
  const map: Record<number, string> = { 1: '报名中', 2: '已满员', 3: '已开始', 4: '已结束', 5: '已取消' }
  return map[s] || '未知'
}
function getStatusType(s: number) {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: '', 4: 'info', 5: 'danger' }
  return (map[s] || 'info') as any
}

let timer: ReturnType<typeof setTimeout>
function fetchMatches() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    loading.value = true
    try {
      const res = await adminApi.getMatches({
        page: page.value, pageSize, keyword: keyword.value || undefined,
        status: status.value,
      })
      matches.value = res.data.list
      total.value = res.data.pagination.total
    } finally { loading.value = false }
  }, 200)
}

async function handleCancel(row: any) {
  try {
    await ElMessageBox.confirm(`确认取消球局「${row.title}」？`, '操作确认', { type: 'warning' })
    await adminApi.updateMatchStatus(row.id, { status: 5, cancelReason: '管理员取消' })
    ElMessage.success('已取消')
    fetchMatches()
  } catch { /* cancelled */ }
}

async function handleComplete(row: any) {
  try {
    await ElMessageBox.confirm(`确认结束球局「${row.title}」？`, '操作确认')
    await adminApi.updateMatchStatus(row.id, { status: 4 })
    ElMessage.success('已结束')
    fetchMatches()
  } catch { /* cancelled */ }
}

onMounted(fetchMatches)
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>