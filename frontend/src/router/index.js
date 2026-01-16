import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import userService from '@/services/userService'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/LoginView.vue'),
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('../views/RegisterView.vue'),
		},
		{
			path: '/home',
			name: 'userHome',
			meta: { requiresAuth: true },
			component: () => import('../views/UserHomeView.vue'),
		},
	],
})

router.beforeEach(async (to, from, next) => {
	if (to.meta.requiresAuth) {
		try {
			await userService.getCurrentUser()
			return next()
		} catch (err) {
			router.push('/login') // redirect to login
		}
	} else {
		return next()
	}
})

export default router
