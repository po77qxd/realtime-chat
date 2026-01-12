import express from "express";
import { sequelize, initDb } from "./db/sequelize.js";


const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({mesage: "hello"})
})

import { userRouter } from "./routes/users.js";
app.use("/api/users", userRouter);

import { conversationRouter } from "./routes/conversations.js";
app.use("/api/conversations", conversationRouter);

import { messageRouter } from "./routes/messages.js";
app.use("/api/messages", messageRouter);

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