import express from "express";
import { success } from "../routes/helper.js";
import { UserConversation } from "../db/sequelize.js";
import auth from "../auth/auth.js";

const userConversationRouter = express();

userConversationRouter.post("/", auth, (req, res) => {
	UserConversation.create({
		user_id: req.user_id,
		conversation_id: req.body.conv_id,
	})
		.then((createdUserConv) => {
			const message = `l'utilisateur ${createdUserConv.user_id} a bien été ajouté a la conversation ${createdUserConv.conversation_id}.`;
			res.json(success(message, createdUserConv));
		})
		.catch((error) => {
			const message = `Lûtilisateur n'a pas pu être ajouté a la conversation. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

export { userConversationRouter };
