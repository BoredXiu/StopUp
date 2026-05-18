<template>
  <view class="page">
    <view class="search-bar">
      <input class="search-input" v-model="keyword" placeholder="搜索场馆" confirm-type="search" @confirm="fetchVenues" />
    </view>

    <view class="venue-list">
      <view v-for="venue in venues" :key="venue.id" class="venue-card" @tap="goDetail(venue.id)">
        <image :src="venue.coverImage || '/static/placeholder.jpg'" class="venue-cover" mode="aspectFill" />
        <view class="venue-info">
          <text class="venue-name">{{ venue.name }}</text>
          <text class="venue-addr">{{ venue.address }}</text>
          <view class="venue-footer">
            <text class="venue-city">{{ venue.city }}{{ venue.district ? ' · ' + venue.district : '' }}</text>
            <text class="venue-rating">⭐ {{ venue.rating }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="load-more" v-if="hasMore" @tap="loadMore">加载更多</view>
    <view class="empty" v-if="!loading && venues.length === 0">暂无场馆</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { venueApi } from '@/api'

const keyword = ref('')
const venues = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

function goDetail(id) {
  uni.navigateTo({ url: `/pages/venue/detail?id=${id}` })
}

async function fetchVenues() {
  loading.value = true
  page.value = 1
  try {
    const res = await venueApi.list({ page: 1, pageSize: 15, keyword: keyword.value || undefined })
    venues.value = res.data.list
    hasMore.value = res.data.list.length >= 15
  } finally { loading.value = false }
}

async function loadMore() {
  page.value++
  try {
    const res = await venueApi.list({ page: page.value, pageSize: 15, keyword: keyword.value || undefined })
    venues.value.push(...res.data.list)
    hasMore.value = res.data.list.length >= 15
  } catch { /* ignore */ }
}

onMounted(fetchVenues)
</script>

<style scoped>
.page { padding: 12px 16px; }
.search-bar { margin-bottom: 12px; }
.search-input {
  height: 40px;
  background: #fff;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
}
.venue-list { display: flex; flex-direction: column; gap: 12px; }
.venue-card { background: #fff; border-radius: 10px; overflow: hidden; }
.venue-cover { width: 100%; height: 160px; }
.venue-info { padding: 12px; }
.venue-name { font-size: 16px; font-weight: 600; display: block; }
.venue-addr { font-size: 13px; color: #999; display: block; margin: 4px 0; }
.venue-footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-top: 6px; }
.load-more { text-align: center; padding: 16px; color: #409EFF; font-size: 14px; }
.empty { text-align: center; padding: 60px 0; color: #999; }
</style>