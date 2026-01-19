import express from "express";
import { sequelize, initDb } from "./db/sequelize.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";

import { Message } from "./db/sequelize.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
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

io.on("connection", (socket) => {
	socket.on("message:send", async (data) => {
		console.log("message to tranmit: " + data.text);
		io.emit("message:new", data);
	});
});

httpServer.listen(3001);
