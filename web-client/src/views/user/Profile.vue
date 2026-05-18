<template>
  <div class="profile-page container page-container">
    <div class="profile-card">
      <div class="profile-header">
        <el-avatar :size="80" :src="userStore.user?.avatar">
          {{ userStore.user?.nickname?.charAt(0) }}
        </el-avatar>
        <div class="profile-info">
          <h2>{{ userStore.user?.nickname }}</h2>
          <p class="profile-bio">{{ userStore.user?.bio || '这个人很懒，什么都没写...' }}</p>
          <div class="profile-meta">
            <span v-if="userStore.user?.city">{{ userStore.user.city }}</span>
            <span>信用分: {{ userStore.user?.creditScore }}</span>
          </div>
        </div>
        <el-button @click="showEditDialog = true">编辑资料</el-button>
      </div>
    </div>

    <div class="profile-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的球局" name="matches">
          <router-link to="/user/matches" class="tab-link">查看全部球局 →</router-link>
        </el-tab-pane>
        <el-tab-pane label="我的订单" name="orders">
          <router-link to="/user/orders" class="tab-link">查看全部订单 →</router-link>
        </el-tab-pane>
        <el-tab-pane label="信用记录" name="credit">
          <router-link to="/user/credit" class="tab-link">查看信用记录 →</router-link>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="showEditDialog" title="编辑资料" width="480px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" maxlength="20" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="editForm.city" placeholder="所在城市" />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="editForm.bio" type="textarea" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { userApi } from '@/api'

const userStore = useUserStore()
const activeTab = ref('matches')
const showEditDialog = ref(false)
const saving = ref(false)

const editForm = reactive({
  nickname: userStore.user?.nickname || '',
  gender: userStore.user?.gender || 0,
  city: userStore.user?.city || '',
  bio: userStore.user?.bio || '',
})

async function handleSave() {
  saving.value = true
  try {
    await userApi.updateProfile(editForm)
    await userStore.fetchProfile()
    ElMessage.success('保存成功')
    showEditDialog.value = false
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}
.profile-info {
  flex: 1;
}
.profile-info h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}
.profile-bio {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.profile-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}
.profile-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 24px 24px;
}
.tab-link {
  display: block;
  text-align: center;
  padding: 20px;
  color: var(--primary-color);
  font-size: 14px;
}
</style>