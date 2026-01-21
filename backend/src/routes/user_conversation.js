import express from "express";
import { success } from "../routes/helper.js";
import { UserConversation, Conversation } from "../db/sequelize.js";
import auth from "../auth/auth.js";

const userConversationRouter = express();

userConversationRouter.post("/", auth, (req, res) => {
	UserConversation.create({
		user_id: req.user_id,
		conversation_id: req.body.conv_id,
	})
		.then((createdUserConv) => {
			const message = `l'utilisateur ${createdUserConv.user_id} a bien été ajouté a la conversation ${createdUserConv.conversation_id}.`;

			Conversation.findByPk(req.body.conv_id).then((conv) => {
				req.io.to(`user_${req.user_id}`).emit("join_conv", {
					...conv.get({ plain: true }),
				});

				res.json(success(message, createdUserConv));
			});
		})
		.catch((error) => {
			const message = `Lûtilisateur n'a pas pu être ajouté a la conversation. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

export { userConversationRouter };
