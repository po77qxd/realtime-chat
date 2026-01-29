import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_WEBSOCKET_URL)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
