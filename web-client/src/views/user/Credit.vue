<template>
  <div class="credit-page container page-container">
    <div class="credit-header">
      <div class="credit-score-card">
        <div class="score-label">当前信用分</div>
        <div class="score-value" :class="scoreClass">{{ userStore.user?.creditScore || 0 }}</div>
        <div class="score-desc">{{ scoreDesc }}</div>
        <el-progress
          :percentage="userStore.user?.creditScore || 0"
          :color="scoreColor"
          :stroke-width="8"
        />
      </div>
      <div class="credit-rules">
        <h4>信用规则</h4>
        <ul>
          <li>✅ 参加球局 +2分</li>
          <li>✅ 完成球局 +5分</li>
          <li>❌ 放鸽子 -20分</li>
          <li>⚠️ 信用分低于60分将无法报名</li>
        </ul>
      </div>
    </div>

    <div class="credit-logs">
      <h3>信用记录</h3>
      <div class="log-list" v-loading="loading">
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-info">
            <span class="log-reason">{{ getReasonText(log.reason) }}</span>
            <span class="log-time">{{ formatDateTime(log.createdAt) }}</span>
          </div>
          <span class="log-amount" :class="log.changeAmount > 0 ? 'positive' : 'negative'">
            {{ log.changeAmount > 0 ? '+' : '' }}{{ log.changeAmount }}
          </span>
        </div>
      </div>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchLogs"
        />
      </div>

      <el-empty v-if="!loading && logs.length === 0" description="暂无信用记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { userApi } from '@/api'
import type { CreditLog } from '@/types'
import { formatDateTime } from '@/utils/format'

const userStore = useUserStore()
const logs = ref<CreditLog[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 15
const total = ref(0)

const scoreClass = computed(() => {
  const score = userStore.user?.creditScore || 0
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
})

const scoreColor = computed(() => {
  const score = userStore.user?.creditScore || 0
  if (score >= 80) return '#67C23A'
  if (score >= 60) return '#E6A23C'
  return '#F56C6C'
})

const scoreDesc = computed(() => {
  const score = userStore.user?.creditScore || 0
  if (score >= 90) return '信用优秀，继续保持！'
  if (score >= 80) return '信用良好'
  if (score >= 60) return '信用一般，请注意'
  return '信用较低，部分功能受限'
})

function getReasonText(reason: string): string {
  const map: Record<string, string> = {
    join_match: '参加球局',
    complete_match: '完成球局',
    no_show: '放鸽子',
    report_approved: '举报成立',
  }
  return map[reason] || reason
}

async function fetchLogs() {
  loading.value = true
  try {
    const res = await userApi.getCreditLogs({ page: page.value, pageSize })
    logs.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)
</script>

<style scoped>
.credit-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.credit-score-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}
.score-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.score-value {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 8px;
}
.score-value.high { color: #67C23A; }
.score-value.medium { color: #E6A23C; }
.score-value.low { color: #F56C6C; }
.score-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.credit-rules {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}
.credit-rules h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.credit-rules ul {
  list-style: none;
}
.credit-rules li {
  font-size: 14px;
  padding: 6px 0;
  color: var(--text-regular);
}
.credit-logs {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}
.credit-logs h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.log-list {
  display: flex;
  flex-direction: column;
}
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.log-item:last-child { border-bottom: none; }
.log-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.log-reason {
  font-size: 14px;
}
.log-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.log-amount {
  font-size: 18px;
  font-weight: 700;
}
.log-amount.positive { color: #67C23A; }
.log-amount.negative { color: #F56C6C; }
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>