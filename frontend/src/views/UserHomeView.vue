<script setup>
import { ref, onMounted } from 'vue'
import conversationService from '@/services/conversationService'
import userService from '@/services/userService'

const conversations = ref(null)
const messages = ref(null)
const user = ref(null)

//TODO: menu edit/delete sur les messages
//TODO: ordre des messages

onMounted(() => {
	userService
		.getCurrentUser()
		.then((response) => {
			user.value = response.data
			userService
				.getUserConversations(user.value.user_id)
				.then((response) => {
					conversations.value = response.data.data

					conversationService
						.getMessagesByConvId(conversations.value[0].conversation_id) //par défaut on affiche les messages de la premiere conv
						.then((response) => {
							messages.value = response.data.data
						})
						.catch((error) => {
							console.log(error)
						})
				})
				.catch((error) => {
					console.log(error)
				})
		})
		.catch((error) => {
			console.log(error)
		})
})

function change_conv(id) {
	conversationService
		.getMessagesByConvId(id)
		.then((response) => {
			messages.value = response.data.data
		})
		.catch((error) => {
			console.log(error)
		})
}
</script>
<template>
	<div class="home">
		<div class="conversations">
			<div>Mes conversations</div>
			<div class="filters">
				<input type="text" placeholder="Rechercher" />
				<button>Filtres</button>
			</div>
			<div class="conversations-list">
				<div v-for="conv in conversations" @click="change_conv(conv.conversation_id)">
					{{ conv.name }}
				</div>
			</div>
			<div class="buttons">
				<button>Créer une conversation</button>
				<button>Rejoindre une conversation</button>
			</div>
		</div>
		<div class="current-conv">
			<div class="messages">
				<div
					v-for="message in messages"
					class="message"
					:class="{ 'self-message': message.user_id == user.user_id }"
				>
					<div class="message-sender">{{ message.user_id }}</div>
					<div class="message-text">{{ message.text }}</div>
				</div>
			</div>
			<div class="message-bar">
				<input type="text" placeholder="Envoyer un message" />
				<button>Envoyer</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.home {
	display: flex;
	width: 100%;
}

.conversations {
	width: 25%;
	height: 100%;
	border-right: 1px solid grey;
	display: flex;
	flex-direction: column;
	margin-left: auto;
}

.filters {
	display: flex;
	gap: 8px;
}

.filters input {
	flex: 1;
	padding: 10px;
	border-radius: 5px;
}

.filters button {
	margin-left: 5px;
	margin-right: 5px;
}

.conversations-list {
	flex: 1;
	overflow-y: auto;
}

.conversations-list div {
	padding: 6px 0;
	cursor: pointer;
}

.buttons {
	display: flex;
	width: 100%;
	justify-content: space-around;
}

.buttons button {
	padding: 15px;
}

.current-conv {
	width: 75%;
	height: 100%;
	display: flex;
	flex-direction: column;
	margin-left: 15px;
}

.messages {
	flex: 1;
	overflow-y: auto;
}

.message {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.message-sender {
	font-size: 12px;
	font-weight: bold;
}

.message-text {
	background: blue;
	padding: 8px 12px;
	width: fit-content;
}

.self-message {
	align-self: flex-end;
	text-align: right;
	margin-right: 15px;
}

.self-message .message-text {
	background: darkblue;
	margin-left: auto;
}

.message-bar {
	width: 100%;
	margin-left: 10px;
}

.message-bar input {
	flex: 1;
	padding: 10px;
	width: 90%;
}

.message-bar button {
	cursor: pointer;
}
</style>
