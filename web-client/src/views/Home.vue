<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <h1 class="hero-title">找到你的运动搭子</h1>
        <p class="hero-subtitle">随时随地，拼一场球局</p>
        <div class="hero-search">
          <el-input
            v-model="searchKeyword"
            size="large"
            placeholder="搜索球局、运动类型..."
            :prefix-icon="Search"
            @keyup.enter="goSearch"
          >
            <template #append>
              <el-button type="primary" @click="goSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="sport-quick-tags">
          <span
            v-for="sport in sports"
            :key="sport.id"
            class="quick-tag"
            :class="{ active: activeSport === sport.id }"
            @click="filterBySport(sport.id)"
          >
            {{ sport.name }}
          </span>
        </div>
      </div>
    </section>

    <div class="container">
      <section class="section" v-if="featuredMatches.length > 0">
        <div class="section-header">
          <h2>推荐球局</h2>
          <el-button link type="primary" @click="$router.push('/search')">查看更多</el-button>
        </div>
        <div class="match-grid">
          <MatchCard v-for="match in featuredMatches" :key="match.id" :match="match" />
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2>最新球局</h2>
          <div class="filter-tabs">
            <span
              v-for="sport in [{ id: 0, name: '全部' }, ...sports.slice(0, 6)]"
              :key="sport.id"
              class="filter-tab"
              :class="{ active: activeSport === sport.id }"
              @click="filterBySport(sport.id)"
            >
              {{ sport.name }}
            </span>
          </div>
        </div>
        <div class="match-grid">
          <MatchCard v-for="match in matches" :key="match.id" :match="match" />
        </div>
        <div class="load-more" v-if="total > matches.length">
          <el-button @click="loadMore" :loading="loading">加载更多</el-button>
        </div>
      </section>

      <section class="section" v-if="hotVenues.length > 0">
        <div class="section-header">
          <h2>热门场馆</h2>
          <el-button link type="primary" @click="$router.push('/venues')">查看全部</el-button>
        </div>
        <div class="venue-grid">
          <div
            v-for="venue in hotVenues"
            :key="venue.id"
            class="venue-card"
            @click="$router.push(`/venues/${venue.id}`)"
          >
            <div class="venue-cover">
              <img :src="venue.coverImage || '/placeholder-venue.jpg'" :alt="venue.name" />
            </div>
            <div class="venue-info">
              <h4>{{ venue.name }}</h4>
              <p class="venue-address text-ellipsis">{{ venue.address }}</p>
              <div class="venue-meta">
                <span>⭐ {{ venue.rating }}</span>
                <span>{{ venue.matchCount }}场球局</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { matchApi, venueApi, sportApi } from '@/api'
import type { Match, Venue, Sport } from '@/types'
import MatchCard from '@/components/MatchCard.vue'

const router = useRouter()
const searchKeyword = ref('')
const activeSport = ref(0)
const sports = ref<Sport[]>([])
const matches = ref<Match[]>([])
const featuredMatches = ref<Match[]>([])
const hotVenues = ref<Venue[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)

function goSearch() {
  router.push({ name: 'Search', query: { keyword: searchKeyword.value } })
}

function filterBySport(sportId: number) {
  activeSport.value = sportId
  page.value = 1
  matches.value = []
  fetchMatches()
}

async function fetchMatches() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 12, status: 1 }
    if (activeSport.value > 0) params.sportId = activeSport.value
    const res = await matchApi.list(params)
    if (page.value === 1) {
      matches.value = res.data.list
    } else {
      matches.value.push(...res.data.list)
    }
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  fetchMatches()
}

onMounted(async () => {
  const [sportsRes, featuredRes, hotVenuesRes] = await Promise.all([
    sportApi.getAll(),
    matchApi.list({ pageSize: 4, isFeatured: 1, status: 1 }),
    venueApi.getHot(4),
  ])
  sports.value = sportsRes.data
  featuredMatches.value = featuredRes.data.list
  hotVenues.value = hotVenuesRes.data
  fetchMatches()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  padding: 60px 0 40px;
  text-align: center;
  color: #fff;
}
.hero-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}
.hero-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
}
.hero-search {
  max-width: 560px;
  margin: 0 auto 24px;
}
.sport-quick-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.quick-tag {
  padding: 4px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-tag:hover,
.quick-tag.active {
  background: rgba(255, 255, 255, 0.35);
}
.section {
  margin-top: 40px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-header h2 {
  font-size: 20px;
  font-weight: 700;
}
.filter-tabs {
  display: flex;
  gap: 4px;
}
.filter-tab {
  padding: 4px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tab:hover,
.filter-tab.active {
  color: var(--primary-color);
  background: #ecf5ff;
}
.match-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) {
  .match-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .match-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .match-grid { grid-template-columns: 1fr; }
}
.load-more {
  text-align: center;
  margin-top: 24px;
}
.venue-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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
  height: 140px;
  overflow: hidden;
}
.venue-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.venue-info {
  padding: 12px 16px;
}
.venue-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.venue-address {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.venue-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>