<script setup></script>

<template>
	<div class="home">
		<h1>Realtime-chat</h1>
		<p>Realtime chat est une application de chat en temps réel</p>

		<div class="buttons">
			<RouterLink to="/register"><button>S'inscrire</button></RouterLink>
			<RouterLink to="/login"><button>Se connecter</button></RouterLink>
		</div>
	</div>
</template>

<style scoped>
.home {
	text-align: center;
}

button {
	margin: 15px;
	padding: 15px;
	background: #006eff;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	cursor: pointer;
	transition: background 0.3s ease;
}

button:hover {
	background: #0039f3;
}
</style>
