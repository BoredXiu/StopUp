import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(uni.getStorageSync('token') || '')

  async function fetchProfile() {
    try {
      const res = await userApi.getProfile()
      user.value = res.data
    } catch { /* ignore */ }
  }

  function setToken(t) {
    token.value = t
    uni.setStorageSync('token', t)
  }

  function logout() {
    token.value = ''
    user.value = null
    uni.removeStorageSync('token')
  }

  return { user, token, fetchProfile, setToken, logout }
})