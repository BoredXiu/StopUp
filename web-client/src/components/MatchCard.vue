<template>
  <div class="match-card" @click="$router.push(`/matches/${match.id}`)">
    <div class="card-header">
      <span class="sport-tag">{{ match.sportName }}</span>
      <el-tag :type="getMatchStatusType(match.status)" size="small">
        {{ getMatchStatusText(match.status) }}
      </el-tag>
    </div>
    <h3 class="card-title text-ellipsis">{{ match.title }}</h3>
    <div class="card-info">
      <div class="info-item">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(match.matchDate) }} {{ formatTime(match.startTime) }}-{{ formatTime(match.endTime) }}</span>
      </div>
      <div class="info-item" v-if="match.venueName">
        <el-icon><Location /></el-icon>
        <span class="text-ellipsis">{{ match.venueName }}</span>
      </div>
      <div class="info-item">
        <el-icon><User /></el-icon>
        <span>{{ match.currentPlayers }}/{{ match.maxPlayers }}人</span>
      </div>
    </div>
    <div class="card-footer">
      <div class="creator-info">
        <el-avatar :size="24" :src="match.creatorAvatar">
          {{ match.creatorNickname?.charAt(0) }}
        </el-avatar>
        <span class="creator-name">{{ match.creatorNickname }}</span>
      </div>
      <div class="fee-info">
        <span v-if="match.feeType === 3" class="free-tag">免费</span>
        <span v-else class="fee-amount">¥{{ match.perPersonFee }}/人</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Location, User } from '@element-plus/icons-vue'
import type { Match } from '@/types'
import { formatDate, formatTime, getMatchStatusText, getMatchStatusType } from '@/utils/format'

defineProps<{ match: Match }>()
</script>

<style scoped>
.match-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}
.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}
.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-regular);
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}
.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.creator-name {
  font-size: 13px;
  color: var(--text-secondary);
}
.fee-amount {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
}
.free-tag {
  font-size: 14px;
  color: var(--success-color);
  font-weight: 600;
}
</style>