import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('user', {
	state: () => ({
		user: null,
	}),
	actions: {
		async getCurrentUser() {
			const response = await userService.getCurrentUser()
			this.user = response.data
		},
		setUser(user) {
			this.user = user
		},
		logout() {
			this.user = null
		},
	},
})
