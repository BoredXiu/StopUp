<template>
  <div class="venue-detail-page container page-container" v-loading="loading">
    <template v-if="venue">
      <div class="venue-header">
        <div class="venue-images">
          <div class="main-image">
            <img :src="venue.coverImage || '/placeholder-venue.jpg'" :alt="venue.name" />
          </div>
          <div class="sub-images" v-if="venue.images?.length">
            <img
              v-for="img in venue.images.slice(0, 3)"
              :key="img.id"
              :src="img.url"
              :alt="venue.name"
            />
          </div>
        </div>
        <div class="venue-info-header">
          <h1>{{ venue.name }}</h1>
          <div class="venue-meta-row">
            <span class="venue-rating">⭐ {{ venue.rating }}</span>
            <span>{{ venue.matchCount }} 场球局</span>
            <span>{{ venue.city }}{{ venue.district ? ' · ' + venue.district : '' }}</span>
          </div>
          <div class="venue-address-row">
            <el-icon><Location /></el-icon>
            <span>{{ venue.address }}</span>
          </div>
          <div class="venue-contact" v-if="venue.phone || venue.businessHours">
            <div v-if="venue.phone">
              <el-icon><Phone /></el-icon>
              <span>{{ venue.phone }}</span>
            </div>
            <div v-if="venue.businessHours">
              <el-icon><Clock /></el-icon>
              <span>营业时间: {{ venue.businessHours }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="venue-content">
        <div class="content-main">
          <div class="section" v-if="venue.description">
            <h3>场馆介绍</h3>
            <p>{{ venue.description }}</p>
          </div>
          <div class="section" v-if="venue.facilities?.length">
            <h3>设施服务</h3>
            <div class="facility-tags">
              <span v-for="(f, i) in venue.facilities" :key="i" class="facility-tag">{{ f }}</span>
            </div>
          </div>
        </div>
        <div class="content-sidebar">
          <div class="map-card">
            <h4>位置信息</h4>
            <div class="map-placeholder">
              <el-icon :size="32"><MapLocation /></el-icon>
              <p>地图加载中...</p>
              <p class="map-coords">{{ venue.latitude }}, {{ venue.longitude }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <el-empty v-else description="场馆不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Location, Phone, Clock, MapLocation } from '@element-plus/icons-vue'
import { venueApi } from '@/api'
import type { Venue } from '@/types'

const route = useRoute()
const venue = ref<Venue | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await venueApi.detail(id)
    venue.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.venue-header {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}
.venue-images {
  display: flex;
  height: 360px;
}
.main-image {
  flex: 2;
}
.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sub-images {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.sub-images img {
  flex: 1;
  width: 100%;
  object-fit: cover;
}
.venue-info-header {
  padding: 24px;
}
.venue-info-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}
.venue-meta-row {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-regular);
  margin-bottom: 12px;
}
.venue-rating {
  color: #e6a23c;
  font-weight: 600;
}
.venue-address-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.venue-contact {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: var(--text-secondary);
}
.venue-contact > div {
  display: flex;
  align-items: center;
  gap: 4px;
}
.venue-content {
  display: flex;
  gap: 24px;
}
.content-main {
  flex: 1;
}
.content-sidebar {
  width: 340px;
}
.section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.section p {
  font-size: 14px;
  color: var(--text-regular);
  line-height: 1.8;
}
.facility-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.facility-tag {
  padding: 4px 14px;
  background: #ecf5ff;
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 13px;
}
.map-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 80px;
}
.map-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.map-placeholder {
  height: 240px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
.map-coords {
  font-size: 12px;
  margin-top: 8px;
}
@media (max-width: 768px) {
  .venue-content { flex-direction: column; }
  .content-sidebar { width: 100%; }
  .venue-images { height: 240px; }
}
</style>