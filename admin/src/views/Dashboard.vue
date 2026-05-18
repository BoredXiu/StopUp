<template>
  <div class="dashboard-page page-container">
    <h2 class="page-header">数据概览</h2>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="24"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>运动类型分布</template>
          <div ref="sportChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>近7天球局趋势</template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { User, TrophyBase, Money, Warning } from '@element-plus/icons-vue'
import { adminApi } from '@/api'

const sportChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()

const statCards = ref([
  { label: '用户总数', value: 0, icon: User, color: '#409EFF' },
  { label: '球局总数', value: 0, icon: TrophyBase, color: '#67C23A' },
  { label: '营收总额', value: '¥0', icon: Money, color: '#E6A23C' },
  { label: '待审举报', value: 0, icon: Warning, color: '#F56C6C' },
])

onMounted(async () => {
  const res = await adminApi.dashboard()
  const data = res.data

  statCards.value[0].value = data.userCount
  statCards.value[1].value = data.matchCount
  statCards.value[2].value = `¥${data.totalRevenue || 0}`
  statCards.value[3].value = data.reportCount

  await nextTick()
  initSportChart(data.sportStats || [])
  initTrendChart(data.dailyStats || [])
})

function initSportChart(stats: { name: string; count: number }[]) {
  if (!sportChartRef.value) return
  const chart = echarts.init(sportChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: stats.map((s) => ({ name: s.name, value: s.count })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  })
}

function initTrendChart(stats: { date: string; count: number }[]) {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: stats.map((s) => s.date.slice(5)) },
    yAxis: { type: 'value' },
    series: [{
      data: stats.map((s) => s.count),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(64,158,255,0.2)' },
      itemStyle: { color: '#409EFF' },
    }],
  })
}
</script>

<style scoped>
.stat-cards { margin-bottom: 0; }
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
</style>