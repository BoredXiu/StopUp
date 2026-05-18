<template>
  <div class="venues-page container page-container">
    <div class="page-title">
      <h1>场馆列表</h1>
      <p>发现优质运动场馆</p>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索场馆名称或地址"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
        style="width: 300px"
      />
      <el-select v-model="city" placeholder="选择城市" clearable @change="fetchVenues" style="width: 160px">
        <el-option label="北京" value="北京" />
        <el-option label="上海" value="上海" />
        <el-option label="广州" value="广州" />
        <el-option label="深圳" value="深圳" />
        <el-option label="杭州" value="杭州" />
        <el-option label="成都" value="成都" />
      </el-select>
    </div>

    <div class="venue-grid" v-loading="loading">
      <div
        v-for="venue in venues"
        :key="venue.id"
        class="venue-card"
        @click="$router.push(`/venues/${venue.id}`)"
      >
        <div class="venue-cover">
          <img :src="venue.coverImage || '/placeholder-venue.jpg'" :alt="venue.name" />
          <span class="venue-rating">⭐ {{ venue.rating }}</span>
        </div>
        <div class="venue-body">
          <h3>{{ venue.name }}</h3>
          <p class="venue-address">
            <el-icon><Location /></el-icon>
            {{ venue.address }}
          </p>
          <div class="venue-footer">
            <span class="venue-city">{{ venue.city }}{{ venue.district ? ' · ' + venue.district : '' }}</span>
            <span class="venue-count">{{ venue.matchCount }} 场球局</span>
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
        @current-change="fetchVenues"
      />
    </div>

    <el-empty v-if="!loading && venues.length === 0" description="暂无场馆" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Location } from '@element-plus/icons-vue'
import { venueApi } from '@/api'
import type { Venue } from '@/types'

const venues = ref<Venue[]>([])
const loading = ref(false)
const keyword = ref('')
const city = ref('')
const page = ref(1)
const pageSize = 12
const total = ref(0)

let searchTimer: ReturnType<typeof setTimeout>

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchVenues()
  }, 300)
}

async function fetchVenues() {
  loading.value = true
  try {
    const res = await venueApi.list({
      page: page.value,
      pageSize,
      keyword: keyword.value || undefined,
      city: city.value || undefined,
    })
    venues.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

onMounted(fetchVenues)
</script>

<style scoped>
.page-title {
  margin-bottom: 24px;
}
.page-title h1 {
  font-size: 24px;
  font-weight: 700;
}
.page-title p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.venue-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.venue-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}
.venue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.venue-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
}
.venue-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.venue-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
}
.venue-body {
  padding: 16px;
}
.venue-body h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}
.venue-address {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.venue-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
@media (max-width: 768px) {
  .venue-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .venue-grid { grid-template-columns: 1fr; }
}
</style>