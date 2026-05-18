<template>
  <view class="page">
    <view class="hero-section">
      <view class="hero-title">找到你的运动搭子</view>
      <view class="hero-subtitle">随时随地，拼一场球局</view>
      <view class="search-bar">
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索球局、运动类型..."
          confirm-type="search"
          @confirm="goSearch"
        />
        <text class="search-btn" @tap="goSearch">搜索</text>
      </view>
      <scroll-view scroll-x class="sport-tags">
        <view
          v-for="sport in sports"
          :key="sport.id"
          class="sport-tag"
          :class="{ active: activeSport === sport.id }"
          @tap="filterBySport(sport.id)"
        >
          {{ sport.name }}
        </view>
      </scroll-view>
    </view>

    <view class="section" v-if="featuredMatches.length">
      <view class="section-header">
        <text class="section-title">精选球局</text>
        <text class="section-more" @tap="goSearch">更多 →</text>
      </view>
      <scroll-view scroll-x class="match-scroll">
        <view v-for="match in featuredMatches" :key="match.id" class="match-card" @tap="goMatch(match.id)">
          <image :src="match.coverImage || '/static/placeholder.jpg'" class="match-cover" mode="aspectFill" />
          <view class="match-info">
            <text class="match-title">{{ match.title }}</text>
            <text class="match-meta">{{ match.sportName }} · {{ match.city }}</text>
            <view class="match-footer">
              <text class="match-date">{{ match.matchDate }}</text>
              <text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}人</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">最新球局</text>
        <text class="section-more" @tap="goSearch">更多 →</text>
      </view>
      <view class="match-list">
        <view v-for="match in latestMatches" :key="match.id" class="match-item" @tap="goMatch(match.id)">
          <image :src="match.coverImage || '/static/placeholder.jpg'" class="match-thumb" mode="aspectFill" />
          <view class="match-body">
            <text class="match-title">{{ match.title }}</text>
            <text class="match-meta">{{ match.sportName }} · {{ match.venueName || match.city }}</text>
            <text class="match-date">{{ match.matchDate }} {{ match.startTime }}</text>
          </view>
          <view class="match-right">
            <text class="match-count">{{ match.currentPlayers }}/{{ match.maxPlayers }}</text>
            <text class="match-status" :class="match.status === 1 ? 'open' : ''">
              {{ match.status === 1 ? '报名中' : '已满员' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="section" v-if="hotVenues.length">
      <view class="section-header">
        <text class="section-title">热门场馆</text>
        <text class="section-more" @tap="goVenues">更多 →</text>
      </view>
      <scroll-view scroll-x class="venue-scroll">
        <view v-for="venue in hotVenues" :key="venue.id" class="venue-card" @tap="goVenue(venue.id)">
          <image :src="venue.coverImage || '/static/placeholder.jpg'" class="venue-cover" mode="aspectFill" />
          <text class="venue-name">{{ venue.name }}</text>
          <text class="venue-addr">{{ venue.district || venue.city }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { matchApi, venueApi, sportApi } from '@/api'

const keyword = ref('')
const activeSport = ref(null)
const sports = ref([])
const featuredMatches = ref([])
const latestMatches = ref([])
const hotVenues = ref([])

function goSearch() {
  uni.navigateTo({ url: `/pages/match/search?keyword=${keyword.value}` })
}
function goMatch(id) {
  uni.navigateTo({ url: `/pages/match/detail?id=${id}` })
}
function goVenue(id) {
  uni.navigateTo({ url: `/pages/venue/detail?id=${id}` })
}
function goVenues() {
  uni.switchTab({ url: '/pages/venue/list' })
}
function filterBySport(id) {
  activeSport.value = activeSport.value === id ? null : id
  goSearch()
}

onMounted(async () => {
  try {
    const [matchRes, venueRes, sportRes] = await Promise.all([
      matchApi.list({ pageSize: 6, status: 1 }),
      venueApi.list({ pageSize: 6, isHot: 1 }),
      sportApi.getAll(),
    ])
    featuredMatches.value = matchRes.data.list.slice(0, 3)
    latestMatches.value = matchRes.data.list
    hotVenues.value = venueRes.data.list
    sports.value = sportRes.data
  } catch { /* ignore */ }
})
</script>

<style scoped>
.page { padding-bottom: 20px; }
.hero-section {
  background: linear-gradient(135deg, #409EFF, #337ECC);
  padding: 40px 20px 24px;
  color: #fff;
}
.hero-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
.hero-subtitle { font-size: 14px; opacity: 0.85; margin-bottom: 20px; }
.search-bar {
  display: flex;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  color: #333;
}
.search-btn {
  width: 64px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background: #409EFF;
  color: #fff;
  font-size: 14px;
}
.sport-tags { white-space: nowrap; }
.sport-tag {
  display: inline-block;
  padding: 6px 16px;
  margin-right: 10px;
  border-radius: 16px;
  background: rgba(255,255,255,0.2);
  font-size: 13px;
}
.sport-tag.active { background: #fff; color: #409EFF; }

.section { margin-top: 16px; padding: 0 16px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-title { font-size: 17px; font-weight: 600; }
.section-more { font-size: 13px; color: #409EFF; }

.match-scroll { white-space: nowrap; }
.match-card {
  display: inline-block;
  width: 220px;
  margin-right: 12px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.match-cover { width: 220px; height: 130px; }
.match-info { padding: 10px; }
.match-title { font-size: 14px; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.match-meta { font-size: 12px; color: #999; display: block; margin: 4px 0; }
.match-footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; }

.match-list { background: #fff; border-radius: 10px; overflow: hidden; }
.match-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
}
.match-item:last-child { border-bottom: none; }
.match-thumb { width: 80px; height: 60px; border-radius: 6px; flex-shrink: 0; }
.match-body { flex: 1; margin-left: 10px; }
.match-title { font-size: 14px; font-weight: 600; display: block; }
.match-meta { font-size: 12px; color: #999; display: block; margin: 2px 0; }
.match-date { font-size: 12px; color: #666; }
.match-right { text-align: right; }
.match-count { font-size: 16px; font-weight: 700; color: #409EFF; display: block; }
.match-status { font-size: 12px; color: #999; }
.match-status.open { color: #67C23A; }

.venue-scroll { white-space: nowrap; }
.venue-card {
  display: inline-block;
  width: 160px;
  margin-right: 12px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.venue-cover { width: 160px; height: 100px; }
.venue-name { font-size: 13px; font-weight: 600; display: block; padding: 6px 8px 0; }
.venue-addr { font-size: 11px; color: #999; display: block; padding: 0 8px 8px; }
</style>