import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { userApi, authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const isLoggedIn = computed(() => !!token.value)

  async function loginByPhone(phone: string, password: string) {
    const res = await authApi.loginByPhone({ phone, password })
    setAuth(res.data)
    return res.data
  }

  async function register(phone: string, password: string, nickname?: string) {
    const res = await authApi.register({ phone, password, nickname })
    setAuth(res.data)
    return res.data
  }

  async function fetchProfile() {
    const res = await userApi.getProfile()
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
  }

  function setAuth(data: { accessToken: string; user: User }) {
    token.value = data.accessToken
    user.value = data.user
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isLoggedIn,
    loginByPhone,
    register,
    fetchProfile,
    logout,
  }
})