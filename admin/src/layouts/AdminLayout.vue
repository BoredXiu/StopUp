<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="220px">
        <div class="logo-area">
          <span class="logo-icon">🏀</span>
          <span class="logo-text">拼个场管理</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/matches">
            <el-icon><TrophyBase /></el-icon>
            <span>球局管理</span>
          </el-menu-item>
          <el-menu-item index="/venues">
            <el-icon><OfficeBuilding /></el-icon>
            <span>场馆管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><Money /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Warning /></el-icon>
            <span>举报管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header height="56px">
          <div class="header-right">
            <span class="admin-name">{{ adminName }}</span>
            <el-button link type="danger" @click="handleLogout">退出</el-button>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)
const adminName = computed(() => {
  const user = localStorage.getItem('admin_user')
  if (user) {
    try { return JSON.parse(user).nickname } catch { return '' }
  }
  return ''
})

function handleLogout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.el-container {
  height: 100%;
}
.el-aside {
  background: #304156;
  overflow: hidden;
}
.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo-icon { font-size: 22px; }
.el-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.admin-name {
  font-size: 14px;
  color: #606266;
}
.el-main {
  background: #f0f2f5;
}
</style>