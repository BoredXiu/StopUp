<template>
  <div class="match-detail-page container page-container" v-loading="loading">
    <template v-if="match">
      <div class="detail-main">
        <div class="detail-header">
          <div class="header-top">
            <span class="sport-tag">{{ match.sportName }}</span>
            <el-tag :type="getMatchStatusType(match.status)">
              {{ getMatchStatusText(match.status) }}
            </el-tag>
          </div>
          <h1 class="match-title">{{ match.title }}</h1>
          <div class="creator-row">
            <el-avatar :size="36" :src="match.creatorAvatar">
              {{ match.creatorNickname?.charAt(0) }}
            </el-avatar>
            <div class="creator-info">
              <span class="creator-name">{{ match.creatorNickname }}</span>
              <span class="create-time">{{ formatDateTime(match.createdAt) }} 创建</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>球局信息</h3>
          <div class="info-grid">
            <div class="info-cell">
              <span class="info-label">运动类型</span>
              <span class="info-value">{{ match.sportName }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">日期时间</span>
              <span class="info-value">{{ formatDate(match.matchDate) }} {{ formatTime(match.startTime) }}-{{ formatTime(match.endTime) }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">人数</span>
              <span class="info-value">{{ match.currentPlayers }}/{{ match.maxPlayers }}人 (最少{{ match.minPlayers }}人)</span>
            </div>
            <div class="info-cell">
              <span class="info-label">费用</span>
              <span class="info-value fee-value">
                <template v-if="match.feeType === 3">免费</template>
                <template v-else>¥{{ match.perPersonFee }}/人 ({{ getFeeTypeText(match.feeType) }})</template>
              </span>
            </div>
            <div class="info-cell">
              <span class="info-label">水平要求</span>
              <span class="info-value">{{ getLevelText(match.levelRequired) }}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">性别要求</span>
              <span class="info-value">{{ getGenderText(match.genderRequired) }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="match.description">
          <h3>球局描述</h3>
          <p class="description-text">{{ match.description }}</p>
        </div>

        <div class="detail-section" v-if="match.venueName">
          <h3>场馆信息</h3>
          <div class="venue-card-detail" @click="$router.push(`/venues/${match.venueId}`)">
            <div class="venue-name-row">
              <el-icon><Location /></el-icon>
              <span>{{ match.venueName }}</span>
            </div>
            <p class="venue-addr">{{ match.venueAddress }}</p>
          </div>
        </div>

        <div class="detail-section">
          <h3>成员列表 ({{ members.length }}人)</h3>
          <div class="member-list">
            <div v-for="member in members" :key="member.id" class="member-item">
              <el-avatar :size="40" :src="member.avatar">
                {{ member.nickname?.charAt(0) }}
              </el-avatar>
              <div class="member-info">
                <span class="member-name">
                  {{ member.nickname }}
                  <el-tag v-if="member.role === 1" size="small" type="warning">创建者</el-tag>
                </span>
                <span class="member-credit">信用分: {{ member.creditScore }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="sidebar-card">
          <div class="price-section">
            <template v-if="match.feeType === 3">
              <span class="price">免费</span>
            </template>
            <template v-else>
              <span class="price">¥{{ match.perPersonFee }}</span>
              <span class="price-unit">/人</span>
            </template>
          </div>
          <div class="player-count">
            已报名 {{ match.currentPlayers }}/{{ match.maxPlayers }} 人
          </div>
          <el-progress
            :percentage="Math.round((match.currentPlayers / match.maxPlayers) * 100)"
            :color="match.currentPlayers >= match.maxPlayers ? '#E6A23C' : '#409EFF'"
          />

          <div class="sidebar-actions" v-if="userStore.isLoggedIn">
            <template v-if="match.creatorId === userStore.user?.id">
              <el-button type="warning" plain @click="handleCancel" :disabled="![1, 2].includes(match.status)">
                取消球局
              </el-button>
              <el-button type="success" @click="handleComplete" :disabled="match.status !== 3">
                结束球局
              </el-button>
            </template>
            <template v-else-if="match.isMember">
              <el-button type="danger" plain @click="handleLeave" :disabled="![1, 2].includes(match.status)">
                退出球局
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                size="large"
                @click="handleJoin"
                :disabled="match.status !== 1 || match.currentPlayers >= match.maxPlayers"
                style="width: 100%"
              >
                {{ match.currentPlayers >= match.maxPlayers ? '已满员' : '立即报名' }}
              </el-button>
            </template>
          </div>
          <div class="sidebar-actions" v-else>
            <el-button type="primary" size="large" @click="$router.push('/login')" style="width: 100%">
              登录后报名
            </el-button>
          </div>
        </div>
      </div>
    </template>

    <el-empty v-else description="球局不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { matchApi } from '@/api'
import { useUserStore } from '@/store/user'
import type { Match, MatchMember } from '@/types'
import { formatDate, formatTime, formatDateTime, getMatchStatusText, getMatchStatusType, getFeeTypeText, getLevelText, getGenderText } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const match = ref<Match | null>(null)
const members = ref<MatchMember[]>([])
const loading = ref(true)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await matchApi.detail(id)
    match.value = res.data
    members.value = res.data.members || []
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  try {
    await ElMessageBox.confirm('确认报名该球局？', '报名确认')
    await matchApi.join(match.value!.id)
    ElMessage.success('报名成功')
    fetchDetail()
  } catch { /* cancelled */ }
}

async function handleLeave() {
  try {
    await ElMessageBox.confirm('确认退出该球局？', '退出确认')
    await matchApi.leave(match.value!.id)
    ElMessage.success('已退出')
    fetchDetail()
  } catch { /* cancelled */ }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确认取消该球局？取消后不可恢复。', '取消确认', { type: 'warning' })
    await matchApi.cancel(match.value!.id)
    ElMessage.success('球局已取消')
    fetchDetail()
  } catch { /* cancelled */ }
}

async function handleComplete() {
  try {
    await ElMessageBox.confirm('确认结束该球局？', '结束确认')
    await matchApi.complete(match.value!.id)
    ElMessage.success('球局已结束')
    fetchDetail()
  } catch { /* cancelled */ }
}

onMounted(fetchDetail)
</script>

<style scoped>
.match-detail-page {
  display: flex;
  gap: 24px;
}
.detail-main {
  flex: 1;
  min-width: 0;
}
.detail-sidebar {
  width: 320px;
  flex-shrink: 0;
}
.detail-header {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.match-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}
.creator-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.creator-info {
  display: flex;
  flex-direction: column;
}
.creator-name {
  font-size: 14px;
  font-weight: 500;
}
.create-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.detail-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}
.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.info-value {
  font-size: 14px;
  font-weight: 500;
}
.fee-value {
  color: #f56c6c;
  font-weight: 700;
}
.description-text {
  font-size: 14px;
  color: var(--text-regular);
  line-height: 1.8;
  white-space: pre-wrap;
}
.venue-card-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
}
.venue-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
}
.venue-addr {
  font-size: 13px;
  color: var(--text-secondary);
}
.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.member-name {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.member-credit {
  font-size: 12px;
  color: var(--text-secondary);
}
.sidebar-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 80px;
}
.price-section {
  text-align: center;
  margin-bottom: 12px;
}
.price {
  font-size: 32px;
  font-weight: 700;
  color: #f56c6c;
}
.price-unit {
  font-size: 14px;
  color: var(--text-secondary);
}
.player-count {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.sidebar-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (max-width: 768px) {
  .match-detail-page {
    flex-direction: column;
  }
  .detail-sidebar {
    width: 100%;
  }
}
</style>