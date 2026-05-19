import { defineStore } from "pinia"
import { ref } from "vue"
import { userApi } from "@/api"
import type { User } from "@/types"

export const useUserStore = defineStore("user", () => {
	const user = ref<User | null>(null)
	const token = ref<string>(uni.getStorageSync("token") || "")

	async function fetchProfile(): Promise<void> {
		try {
			const res = await userApi.getProfile()
			user.value = res.data as User
		} catch (_) {
			/* ignore */
		}
	}

	function setToken(t: string): void {
		token.value = t
		uni.setStorageSync("token", t)
	}

	function logout(): void {
		token.value = ""
		user.value = null
		uni.removeStorageSync("token")
	}

	return { user, token, fetchProfile, setToken, logout }
})