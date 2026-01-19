import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { io } from 'socket.io-client'

export const socket = io('ws://localhost:3001')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
