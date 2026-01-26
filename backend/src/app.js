import express from "express";
import { sequelize, initDb } from "./db/sequelize.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import { upload } from "./middlewares/multer.js";

import { createServer } from "http";
import { Server } from "socket.io";

import { Message } from "./db/sequelize.js";
import { redisClient } from "./db/redis.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	}),
);

app.use((req, res, next) => {
	req.io = io;
	next();
});

app.get("/", (req, res) => {
	res.json({ mesage: "hello" });
});

import { userRouter } from "./routes/users.js";
app.use("/api/users", userRouter);

import { conversationRouter } from "./routes/conversations.js";
app.use("/api/conversations", conversationRouter);

import { messageRouter } from "./routes/messages.js";
app.use("/api/messages", messageRouter);

import { loginRouter } from "./routes/login.js";
app.use("/api/login", loginRouter);

import { registerRouter } from "./routes/register.js";
app.use("/api/register", registerRouter);

import { userConversationRouter } from "./routes/user_conversation.js";
app.use("/api/user_conversation", userConversationRouter);

import { uploadRouter } from "./routes/upload.js";
app.use("/api/image", uploadRouter);

app.use("/uploads", express.static("./src/uploads"));

app.use(({ res }) => {
	const message =
		"Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
	res.status(404).json(message);
});

app.listen(port, () => {
	console.log(`Example app listening on port http://localhost:${port}`);
});

sequelize
	.authenticate()
	.then((_) => console.log("Connexion à la base de données réussie."))
	.catch((error) => console.error("Erreur de connexion à la base de données"));

initDb();

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ["http://localhost:3001", "http://localhost:5173"],
	},
});

io.on("connection", async (socket) => {
	socket.on("join_conversation", (conversationId) => {
		socket.join(`conversation_${conversationId}`);
		console.log(`Socket ${socket.id} a rejoint conversation_${conversationId}`);
	});

	socket.on("leave_conversation", (conversationId) => {
		socket.leave(`conversation_${conversationId}`);
	});

	socket.on("user_join", async (userId) => {
		socket.join(`user_${userId}`); //pour envoyer une update un a seul user
		socket.userId = userId;
		await redisClient.set(`user:sockets:${userId}`, socket.id);
		await redisClient.expire(`user:sockets:${userId}`, 30); //30sec
		io.emit("user_online", userId);
	});

	socket.on("heartbeat", async (userId) => {
		await redisClient.expire(`user:sockets:${userId}`, 30);
	});

	socket.on("user_leave", (userId) => {
		socket.leave(`user_${userId}`);
	});

	socket.on("join_users_conv", (convId) => {
		//pour envoyer une update aux user qui ont cette conv dans leur liste
		socket.join(`users_conv_${convId}`);
	});

	socket.on("leave_users_conv", (convId) => {
		socket.leave(`users_conv_${convId}`);
	});

	socket.on("disconnect", async () => {
		await redisClient.del(`user:sockets:${socket.userId}`);
		io.emit("user_offline", socket.userId);
	});

	socket.on("typing", async (convId) => {
		const userId = socket.userId;
		await redisClient.set(`typing:${convId}:${userId}`, 1);
		await redisClient.expire(`typing:${convId}:${userId}`, 3); //3sec

		io.to(`conversation_${convId}`).emit("typing", userId);
	});
});

redisClient.set(`test`, "hello");

const testRedis = await redisClient.get(`test`);
console.log(testRedis);

httpServer.listen(3001);
