<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import conversationService from '@/services/conversationService'

const props = defineProps(['messages', 'shownConvId', 'shownConvAdminId'])

const userStore = useUserStore()

const messages = computed(() => props.messages)
const shownConvId = computed(() => props.shownConvId)
const shownConvAdminId = computed(() => props.shownConvAdminId)

const messageMenuShown = ref(null) //id of the message where the menu is shown
const editInputShown = ref(null) //id of the message being modified
const messagetoEdit = ref(null)
const editMessageTextarea = ref(null)

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

	conversationService
		.editMessage(message_id, shownConvId.value, messagetoEdit.value)
		.then((response) => {
			closeEditMessage()
			//console.log(response.data.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

async function deleteMessage(messageId) {
	conversationService
		.deletedMessage(messageId, shownConvId.value)
		.then((response) => {
			// console.log(response.data)
		})
		.catch((error) => {
			console.log(error)
		})
}

function shouldShowUsername(index) {
	if (index == 0) return true
	//si le message precedant a été envoyé par un user différent, on affiche le username, sinon non
	return messages.value[index].user_id != messages.value[index - 1].user_id
}

function parseMarkdown(text) {
	return DOMPurify.sanitize(marked.parse(text))
}

watch(messagetoEdit, async () => {
	await nextTick()

	const textarea = editMessageTextarea.value[0]
	if (!textarea) return

	//reset la hauteur
	textarea.style.height = 'auto'

	const style = window.getComputedStyle(textarea)
	const lineHeight = parseFloat(style.lineHeight)
	const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

	const maxLines = 5
	const maxHeight = lineHeight * maxLines + padding

	textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
	textarea.style.height = textarea.scrollHeight + 'px'
	textarea.style.width = '50%'
})
</script>

<template>
	<div class="messages">
		<div
			v-for="(message, index) in messages"
			class="message"
			:class="{ 'self-message': message.user_id == userStore.user.user_id }"
		>
			<div class="message-sender" v-if="shouldShowUsername(index)">
				{{ message.User.name }}
			</div>
			<div
				class="message-text"
				v-if="!editInputShown || editInputShown != message.message_id"
				@click="showMessageMenu(message.message_id)"
				v-html="parseMarkdown(message.text)"
			></div>
			<form class="edit-message" v-else @submit.prevent="editMessage(message.message_id)">
				<textarea
					placeholder="Modifier le message"
					v-model="messagetoEdit"
					ref="editMessageTextarea"
				></textarea>
				<button @click="closeEditMessage" type="button">
					<img src="../assets/close.png" />
				</button>
				<button type="submit"><img src="../assets/check.png" /></button>
			</form>
			<div
				class="message-menu"
				v-if="
					messageMenuShown &&
					messageMenuShown == message.message_id &&
					(message.user_id == userStore.user.user_id || //afficher le menu seulement sur nos message ou sur tout les message si on est l'admin de la conversation actuelle
						userStore.user.user_id == shownConvAdminId)
				"
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
</template>

<style scoped>
.messages {
	flex: 1;
	overflow-y: auto;
}

.message {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-top: 4px;
}

.message-sender {
	font-size: 16px;
	font-weight: bold;
	margin-top: 5px;
}

.message-text {
	background: blue;
	padding: 0px 10px;
	width: fit-content;
	max-width: 50%;

	word-wrap: break-word;
	overflow-wrap: break-word;
	overflow-wrap: anywhere;
	text-align: left;
	white-space: normal;
}

.message-text :link {
	color: #00ffff;
}

/* deep pour que le css s'applique*/
:deep(.message-text img) {
	max-width: 100%;
}

.message-menu button {
	width: 40px;
	margin: 5px;
}

.message-menu button img {
	width: 100%;
}

.edit-message textarea {
	padding: 10px;
	margin: 5px;
	line-height: 20px;
	resize: none;
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
</style>
