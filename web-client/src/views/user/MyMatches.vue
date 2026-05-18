<template>
  <div class="my-matches-page container page-container">
    <div class="page-header">
      <h1>我的球局</h1>
      <el-button type="primary" @click="$router.push('/user/create-match')">创建球局</el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="fetchMatches">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="报名中" name="1" />
      <el-tab-pane label="已满员" name="2" />
      <el-tab-pane label="已开始" name="3" />
      <el-tab-pane label="已结束" name="4" />
      <el-tab-pane label="已取消" name="5" />
    </el-tabs>

    <div class="match-grid" v-loading="loading">
      <MatchCard v-for="match in matches" :key="match.id" :match="match" />
    </div>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchMatches"
      />
    </div>

    <el-empty v-if="!loading && matches.length === 0" description="暂无球局" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { matchApi } from '@/api'
import type { Match } from '@/types'
import MatchCard from '@/components/MatchCard.vue'

const activeTab = ref('')
const matches = ref<Match[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 12
const total = ref(0)

async function fetchMatches() {
  loading.value = true
  try {
    const res = await matchApi.myMatches({
      page: page.value,
      pageSize,
      status: activeTab.value ? Number(activeTab.value) : undefined,
    })
    matches.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

onMounted(fetchMatches)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 24px;
  font-weight: 700;
}
.match-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
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
</style>