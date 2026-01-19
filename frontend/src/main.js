import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { io } from 'socket.io-client'

const socket = io('ws://localhost:3001')

socket.on('hello', (arg) => {
	console.log(arg)
})

socket.emit('howdy', 'stranger')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
