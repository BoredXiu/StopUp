<template>
  <div class="venues-page page-container">
    <div class="page-header">
      <h2>场馆管理</h2>
      <el-button type="primary" @click="showCreateDialog">新增场馆</el-button>
    </div>

    <div class="search-bar">
      <el-input v-model="keyword" placeholder="搜索场馆名称" clearable @input="fetchVenues" style="width: 240px" />
    </div>

    <el-table :data="venues" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="city" label="城市" width="100" />
      <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="rating" label="评分" width="80" />
      <el-table-column prop="match_count" label="球局数" width="80" />
      <el-table-column label="热门" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_hot ? 'warning' : 'info'" size="small">
            {{ row.is_hot ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        @current-change="fetchVenues"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="editingVenue ? '编辑场馆' : '新增场馆'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city" />
        </el-form-item>
        <el-form-item label="区/县">
          <el-input v-model="form.district" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.business_hours" placeholder="如: 09:00-22:00" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="form.latitude" :precision="7" style="width: 100%" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="form.longitude" :precision="7" style="width: 100%" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="热门推荐">
          <el-switch v-model="form.is_hot" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'

const venues = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = 15
const total = ref(0)
const dialogVisible = ref(false)
const editingVenue = ref<any>(null)
const saving = ref(false)

const form = reactive({
  name: '', city: '', district: '', address: '', phone: '',
  business_hours: '', latitude: 0, longitude: 0, description: '', is_hot: 0,
})

let timer: ReturnType<typeof setTimeout>
function fetchVenues() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    loading.value = true
    try {
      const res = await adminApi.getVenues({
        page: page.value, pageSize, keyword: keyword.value || undefined,
      })
      venues.value = res.data.list
      total.value = res.data.pagination.total
    } finally { loading.value = false }
  }, 200)
}

function showCreateDialog() {
  editingVenue.value = null
  Object.assign(form, {
    name: '', city: '', district: '', address: '', phone: '',
    business_hours: '', latitude: 0, longitude: 0, description: '', is_hot: 0,
  })
  dialogVisible.value = true
}

function handleEdit(row: any) {
  editingVenue.value = row
  Object.assign(form, {
    name: row.name, city: row.city, district: row.district || '',
    address: row.address, phone: row.phone || '',
    business_hours: row.business_hours || '', latitude: row.latitude,
    longitude: row.longitude, description: row.description || '',
    is_hot: row.is_hot,
  })
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingVenue.value) {
      await adminApi.updateVenue(editingVenue.value.id, form)
    } else {
      await adminApi.createVenue(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchVenues()
  } finally { saving.value = false }
}

onMounted(fetchVenues)
</script>

<style scoped>
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>