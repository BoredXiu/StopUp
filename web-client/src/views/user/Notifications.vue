<template>
  <div class="notifications-page container page-container">
    <div class="page-header">
      <h1>消息通知</h1>
      <el-button link type="primary" @click="handleMarkAllRead">全部已读</el-button>
    </div>

    <div class="notification-list" v-loading="loading">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification-item"
        :class="{ unread: item.isRead === 0 }"
        @click="handleClick(item)"
      >
        <div class="notify-icon">
          <el-icon v-if="item.type === 'match_join'" color="#67C23A"><UserFilled /></el-icon>
          <el-icon v-else-if="item.type === 'match_cancel'" color="#F56C6C"><CircleCloseFilled /></el-icon>
          <el-icon v-else-if="item.type === 'payment'" color="#409EFF"><Money /></el-icon>
          <el-icon v-else color="#909399"><Bell /></el-icon>
        </div>
        <div class="notify-content">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
          <span class="notify-time">{{ formatDateTime(item.createdAt) }}</span>
        </div>
        <div class="unread-dot" v-if="item.isRead === 0"></div>
      </div>
    </div>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchNotifications"
      />
    </div>

    <el-empty v-if="!loading && notifications.length === 0" description="暂无通知" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, UserFilled, CircleCloseFilled, Money } from '@element-plus/icons-vue'
import { notificationApi } from '@/api'
import { useNotificationStore } from '@/store/notification'
import type { Notification } from '@/types'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const notificationStore = useNotificationStore()
const notifications = ref<Notification[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 15
const total = ref(0)

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await notificationApi.list({ page: page.value, pageSize })
    notifications.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

async function handleClick(item: Notification) {
  if (item.isRead === 0) {
    await notificationApi.markRead(item.id)
    notificationStore.fetchUnreadCount()
    item.isRead = 1
  }
  if (item.relatedType === 'match' && item.relatedId) {
    router.push(`/matches/${item.relatedId}`)
  }
}

async function handleMarkAllRead() {
  await notificationApi.markAllRead()
  notificationStore.fetchUnreadCount()
  fetchNotifications()
}

onMounted(fetchNotifications)
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
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.notification-item:hover {
  background: #f5f7fa;
}
.notification-item.unread {
  background: #ecf5ff;
}
.notify-icon {
  margin-top: 2px;
}
.notify-content {
  flex: 1;
}
.notify-content h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}
.notify-content p {
  font-size: 13px;
  color: var(--text-regular);
  margin-bottom: 6px;
}
.notify-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-top: 6px;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>