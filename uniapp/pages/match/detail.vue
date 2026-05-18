<template>
  <view class="page">
    <view class="match-header" v-if="match">
      <image :src="match.coverImage || '/static/placeholder.jpg'" class="cover-image" mode="aspectFill" />
      <view class="match-basic">
        <text class="match-title">{{ match.title }}</text>
        <view class="match-tags">
          <text class="tag">{{ match.sportName }}</text>
          <text class="tag" :class="statusClass">{{ statusText }}</text>
        </view>
      </view>
    </view>

    <view class="info-card" v-if="match">
      <view class="info-row">
        <text class="info-label">时间</text>
        <text class="info-value">{{ match.matchDate }} {{ match.startTime }} - {{ match.endTime }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">人数</text>
        <text class="info-value">{{ match.currentPlayers }}/{{ match.maxPlayers }}人 (最少{{ match.minPlayers }}人)</text>
      </view>
      <view class="info-row" v-if="match.venueName">
        <text class="info-label">场馆</text>
        <text class="info-value link" @tap="goVenue">{{ match.venueName }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">费用</text>
        <text class="info-value price">¥{{ match.perPersonFee || 0 }}/人</text>
      </view>
      <view class="info-row" v-if="match.levelRequired">
        <text class="info-label">水平</text>
        <text class="info-value">{{ levelText }}</text>
      </view>
    </view>

    <view class="section" v-if="match?.description">
      <view class="section-title">球局描述</view>
      <text class="desc-text">{{ match.description }}</text>
    </view>

    <view class="section">
      <view class="section-title">成员列表 ({{ members.length }}人)</view>
      <view class="member-list">
        <view v-for="m in members" :key="m.id" class="member-item">
          <image :src="m.avatar || '/static/default-avatar.png'" class="member-avatar" mode="aspectFill" />
          <view class="member-info">
            <text class="member-name">
              {{ m.nickname }}
              <text v-if="m.role === 1" class="creator-tag">创建者</text>
            </text>
            <text class="member-credit">信用 {{ m.creditScore }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar" v-if="match">
      <block v-if="match.status === 1 && !isJoined">
        <button class="btn-primary" @tap="handleJoin">立即报名</button>
      </block>
      <block v-else-if="match.status === 1 && isJoined && !isCreator">
        <button class="btn-warning" @tap="handleLeave">退出球局</button>
      </block>
      <block v-else-if="isCreator && (match.status === 1 || match.status === 2)">
        <button class="btn-danger" @tap="handleCancel">取消球局</button>
      </block>
      <block v-else>
        <button class="btn-disabled" disabled>{{ statusText }}</button>
      </block>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { matchApi } from '@/api'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const match = ref(null)
const members = ref([])

const statusText = computed(() => {
  const map = { 1: '报名中', 2: '已满员', 3: '已开始', 4: '已结束', 5: '已取消' }
  return map[match.value?.status] || '未知'
})
const statusClass = computed(() => {
  const map = { 1: 'open', 2: 'full', 3: 'started', 4: 'ended', 5: 'cancelled' }
  return map[match.value?.status] || ''
})
const levelText = computed(() => {
  const map = { 1: '入门', 2: '初级', 3: '中级', 4: '高级', 5: '专业' }
  return map[match.value?.levelRequired] || '不限'
})
const isCreator = computed(() => match.value?.creatorId === userStore.user?.id)
const isJoined = computed(() => members.value.some((m) => m.id === userStore.user?.id))

function goVenue() {
  if (match.value?.venueId) {
    uni.navigateTo({ url: `/pages/venue/detail?id=${match.value.venueId}` })
  }
}

async function handleJoin() {
  try {
    await matchApi.join(match.value.id)
    uni.showToast({ title: '报名成功', icon: 'success' })
    fetchDetail()
  } catch { /* ignore */ }
}

async function handleLeave() {
  const res = await uni.showModal({ title: '确认退出？', content: '退出球局可能影响信用分' })
  if (!res.confirm) return
  try {
    await matchApi.leave(match.value.id)
    uni.showToast({ title: '已退出', icon: 'success' })
    fetchDetail()
  } catch { /* ignore */ }
}

async function handleCancel() {
  const res = await uni.showModal({ title: '确认取消球局？', content: '取消球局将影响信用分' })
  if (!res.confirm) return
  try {
    await matchApi.cancel(match.value.id, '创建者取消')
    uni.showToast({ title: '已取消', icon: 'success' })
    fetchDetail()
  } catch { /* ignore */ }
}

async function fetchDetail() {
  const pages = getCurrentPages()
  const options = pages[pages.length - 1].options
  const id = Number(options.id)
  if (!id) return
  try {
    const res = await matchApi.detail(id)
    match.value = res.data.match
    members.value = res.data.members
  } catch { /* ignore */ }
}

onLoad(() => { fetchDetail() })
</script>

<style scoped>
.page { padding-bottom: 80px; }
.cover-image { width: 100%; height: 200px; }
.match-basic { padding: 16px; background: #fff; }
.match-title { font-size: 18px; font-weight: 700; display: block; margin-bottom: 8px; }
.match-tags { display: flex; gap: 8px; }
.tag { padding: 2px 10px; border-radius: 10px; font-size: 12px; background: #f0f0f0; color: #666; }
.tag.open { background: #e1f3d8; color: #67C23A; }
.tag.full { background: #faecd8; color: #E6A23C; }
.tag.cancelled { background: #fde2e2; color: #F56C6C; }

.info-card { margin: 12px 16px; background: #fff; border-radius: 10px; padding: 16px; }
.info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 13px; color: #999; }
.info-value { font-size: 14px; }
.info-value.price { color: #F56C6C; font-weight: 600; }
.info-value.link { color: #409EFF; }

.section { margin: 12px 16px; background: #fff; border-radius: 10px; padding: 16px; }
.section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.desc-text { font-size: 14px; color: #666; line-height: 1.6; }

.member-list { display: flex; flex-direction: column; gap: 10px; }
.member-item { display: flex; align-items: center; gap: 10px; }
.member-avatar { width: 40px; height: 40px; border-radius: 50%; }
.member-info { flex: 1; }
.member-name { font-size: 14px; }
.creator-tag { font-size: 11px; color: #E6A23C; margin-left: 6px; }
.member-credit { font-size: 12px; color: #999; }

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eee;
}
.btn-primary {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #409EFF;
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  border: none;
}
.btn-warning {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #E6A23C;
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  border: none;
}
.btn-danger {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #F56C6C;
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  border: none;
}
.btn-disabled {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #ccc;
  color: #fff;
  border-radius: 22px;
  font-size: 16px;
  border: none;
}
</style>