<script setup>
import { ref, onMounted } from 'vue'
import conversationService from '@/services/conversationService'
import userService from '@/services/userService'
import messageService from '@/services/messageService'
import userConversationService from '@/services/userConversationService'

const conversations = ref(null)
const messages = ref(null)
const user = ref(null)
const shownConvId = ref(null)
const showCreateConv = ref(false)
const convName = ref('')
const messageToSend = ref('')
const messageMenuShown = ref(null) //id of the message where the menu is shown
const editInputShown = ref(null) //id of the message being modified
const messagetoEdit = ref(null)

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

			userConversationService
				.addUserToConv(response.data.data.conversation_id)
				.then((response) => {
					change_conv(response.data.data.conversation_id)
				})
				.catch((error) => {
					console.log(error)
				})
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

function showMessageMenu(id) {
	messageMenuShown.value = id
}

function closeMessageMenu() {
	messageMenuShown.value = null
	//close the edit menu too
	editInputShown.value = null
	messagetoEdit.value = ''
}

async function showEditMessage(message) {
	editInputShown.value = message.message_id
	messagetoEdit.value = message.text
}

function closeEditMessage() {
	editInputShown.value = null
	messagetoEdit.value = ''
}

async function editMessage(message_id) {
	if (!messagetoEdit.value.trim()) return

	messageService
		.editMessage(message_id, messagetoEdit.value)
		.then((response) => {
			closeEditMessage()
			//console.log(response.data.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function deleteMessage(messageId) {
	messageService
		.deletedMessage(messageId)
		.then((response) => {
			console.log(response.data)
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
					@click="showMessageMenu(message.message_id)"
				>
					<div class="message-sender">{{ message.User.name }}</div>
					<div
						class="message-text"
						v-if="!editInputShown || editInputShown != message.message_id"
					>
						{{ message.text }}
					</div>
					<form
						class="edit-message"
						v-else
						@submit.prevent="editMessage(message.message_id)"
					>
						<input
							type="text"
							placeholder="Modifier le message"
							v-model="messagetoEdit"
						/>
						<button @click="closeEditMessage" type="button">
							<img src="../assets/close.png" />
						</button>
						<button type="submit"><img src="../assets/check.png" /></button>
					</form>
					<div
						class="message-menu"
						v-if="messageMenuShown && messageMenuShown == message.message_id"
					>
						<button @click="showEditMessage(message)">
							<img src="../assets/edit.png" />
						</button>
						<button @click="deleteMessage(message.message_id)">
							<img src="../assets/delete.png" />
						</button>
						<button @click.stop="closeMessageMenu">
							<img src="../assets/close.png" />
						</button>
					</div>
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
	height: 90vh;
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
	/* max-height: 100%; */
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
	font-size: 14px;
	font-weight: bold;
	margin-top: 5px;
}

.message-text {
	background: blue;
	padding: 8px 12px;
	width: fit-content;
	max-width: 50%;

	word-wrap: break-word;
	overflow-wrap: break-word;
	overflow-wrap: anywhere;
	text-align: left;
	white-space: normal;
}

.message-menu button {
	width: 40px;
	margin: 5px;
}

.message-menu button img {
	width: 100%;
}

.edit-message input {
	padding: 10px;
	margin: 5px;
}

.edit-message button {
	width: 40px;
	margin: 5px;
}

.edit-message button img {
	width: 100%;
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
	margin-top: 15px;
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
