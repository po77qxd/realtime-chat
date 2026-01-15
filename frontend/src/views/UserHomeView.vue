<script setup>
import { ref, onMounted } from 'vue'
import conversationService from '@/services/conversationService'
import userService from '@/services/userService'

const conversations = ref(null)
const messages = ref(null)
const user = ref(null)
const shownConvId = ref(null)
const showCreateConv = ref(false)
const convName = ref('')
const messageToSend = ref('')

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
					shownConvId.value = conversations.value[0].conversation_id

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
	shownConvId.value = id
	conversationService
		.getMessagesByConvId(id)
		.then((response) => {
			messages.value = response.data.data
		})
		.catch((error) => {
			console.log(error)
		})
}

function showCreateConvForm() {
	showCreateConv.value = true
}

function closeCreateConvForm() {
	showCreateConv.value = false
	convName.value = ''
}

async function createConv() {
	if (!convName.value.trim()) return

	conversationService
		.createConv(convName.value)
		.then((response) => {
			closeCreateConvForm()
			change_conv(response.data.data.conversation_id)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function sendMessage() {
	if (!messageToSend.value.trim()) return

	conversationService
		.sendMessage(shownConvId.value, messageToSend.value)
		.then((response) => {
			messageToSend.value = ''
			//console.log(response.data.data)
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
				<div
					v-for="conv in conversations"
					@click="change_conv(conv.conversation_id)"
					:class="{ selectedConv: shownConvId == conv.conversation_id }"
				>
					{{ conv.name }}
				</div>
			</div>

			<div class="createConv" v-if="showCreateConv">
				<h3>Créer un conversation</h3>
				<input type="text" placeholder="Nom de la conversation" v-model="convName" />
				<div class="createConvButtons">
					<button @click="closeCreateConvForm">Annuler</button>
					<button @click="createConv">Créer</button>
				</div>
			</div>

			<div class="buttons">
				<button @click="showCreateConvForm">Créer une conversation</button>
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
				<form @submit.prevent="sendMessage" class="sendMessageForm">
					<input type="text" placeholder="Envoyer un message" v-model="messageToSend" />
					<button type="submit" class="sendButton">
						<img src="../assets/send.png" />
					</button>
				</form>
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

.selectedConv {
	background-color: blue;
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

.sendMessageForm {
	display: flex;
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
	width: 40px;
	margin: 5px;
	border: none;
	margin-left: -40px;
	background-color: white;
}

.sendButton img {
	width: 100%;
}

.createConv {
	width: 100%;
	text-align: center;
}

.createConv input {
	padding: 15px;
	margin: 5px;
	width: 89%;
}

.createConvButtons {
	display: flex;
}

.createConvButtons button {
	width: 50%;
	padding: 15px;
	margin: 10px;
}
</style>
