<template>
  <div class="users-page page-container">
    <div class="page-header"><h2>用户管理</h2></div>

    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索昵称/手机号" clearable @input="fetchUsers" style="width: 240px" />
      <el-select v-model="status" placeholder="状态" clearable @change="fetchUsers" style="width: 120px">
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
    </div>

    <el-table :data="users" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="头像" width="70">
        <template #default="{ row }">
          <el-avatar :size="36" :src="row.avatar">{{ row.nickname?.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="140" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column prop="credit_score" label="信用分" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="170">
        <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            :type="row.status === 1 ? 'danger' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
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
        @current-change="fetchUsers"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import dayjs from 'dayjs'

const users = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>()
const page = ref(1)
const pageSize = 15
const total = ref(0)

function formatDate(d: string) { return dayjs(d).format('YYYY-MM-DD HH:mm') }

let timer: ReturnType<typeof setTimeout>
function fetchUsers() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    loading.value = true
    try {
      const res = await adminApi.getUsers({
        page: page.value, pageSize, keyword: keyword.value || undefined,
        status: status.value,
      })
      users.value = res.data.list
      total.value = res.data.pagination.total
    } finally { loading.value = false }
  }, 200)
}

async function handleToggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}用户「${row.nickname}」？`, '操作确认')
    await adminApi.updateUserStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch { /* cancelled */ }
}

onMounted(fetchUsers)
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>