import express from "express";
import { success } from "../routes/helper.js";
import { Conversation, Message, User } from "../db/sequelize.js";
import auth from "../auth/auth.js";
import messageMiddleware from "../middlewares/messageMiddleware.js ";
import convMiddleware from "../middlewares/convMiddleware.js";

const conversationRouter = express();

conversationRouter.get("/", auth, (req, res) => {
	Conversation.findAll({ order: ["name"] })
		.then((convs) => {
			const message = `Il y a ${convs.length} conversations`;
			res.json(success(message, convs));
		})
		.catch((error) => {
			const message = `Les conversations n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.get("/:id", auth, (req, res) => {
	Conversation.findByPk(req.params.id)
		.then((conv) => {
			if (conv === null) {
				const message = `La conversation demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
				return res.status(404).json({ message });
			}
			const message = `La conversation dont l'id vaut ${conv.conversation_id} a bien été récupéré !`;
			res.json(success(message, conv));
		})
		.catch((error) => {
			const message = `La conversation n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.post("/", auth, (req, res) => {
	Conversation.create({
		name: req.body.name,
		admin_user_id: req.user_id,
	})
		.then((createdConv) => {
			const message = `la conversation ${createdConv.name} a bien été crée.`;
			res.json(success(message, createdConv));
		})
		.catch((error) => {
			const message = `La conversation n'a n'a pas pu être crée. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.put("/:id", auth, convMiddleware, (req, res) => {
	Conversation.update(
		{
			name: req.body.name,
			admin_user_id: req.user_id,
		},
		{ where: { conversation_id: req.params.id } }
	)
		.then((updatedConv) => {
			const message = `la conversation ${req.params.id} a bien été modifiée.`;
			res.json(success(message, updatedConv));
		})
		.catch((error) => {
			const message = `La conversation n'a n'a pas pu être modifiée. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.delete("/:id", auth, convMiddleware, (req, res) => {
	Conversation.destroy({ where: { conversation_id: req.params.id } })
		.then((deletedConv) => {
			const message = `la conversation ${req.params.id} a bien été supprimée.`;
			res.json(success(message, deletedConv));
		})
		.catch((error) => {
			const message = `La conversation n'a n'a pas pu être supprimé. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

// MESSAGES //
conversationRouter.get("/:id/messages", auth, (req, res) => {
	Message.findAll({
		where: { conversation_id: req.params.id },
		order: ["timestamp_"],
		include: [
			{
				model: User,
				attributes: ["name"],
			},
		],
	})
		.then((messages) => {
			const message = `Il y a ${messages.length} messages qui correspondent au terme de la recherche`;
			res.json(success(message, messages));
		})
		.catch((error) => {
			const message = `Les messages n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.post("/:id/messages", auth, (req, res) => {
	Message.create({
		text: req.body.text,
		conversation_id: req.params.id,
		user_id: req.user_id,
	})
		.then((createdMessage) => {
			const message = `le message ${createdMessage.message_id} a bien été crée.`;

			User.findByPk(createdMessage.user_id, {
				attributes: { exclude: ["password", "email", "user_id"] }, // évite d'envoyer le mot de passe
			})
				.then((user) => {
					req.io.to(`conversation_${req.params.id}`).emit("new_message", {
						...createdMessage.get({ plain: true }),
						User: user,
					});
					res.json(success(message, createdMessage));
				})
				.catch((error) => {
					const message = `L'utilisateur n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
					res.status(500).json({ message, data: error });
				});
		})
		.catch((error) => {
			const message = `Le message n'a n'a pas pu être crée. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.put("/:id/messages/:message_id", auth, messageMiddleware, (req, res) => {
	Message.update({ text: req.body.text }, { where: { message_id: req.params.message_id } })
		.then((updatedMessage) => {
			const message = `le message ${req.params.id} a bien été modifié.`;
			res.json(success(message, updatedMessage));
		})
		.catch((error) => {
			const message = `Le message n'a n'a pas pu être modifié. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.delete("/:id/messages/:message_id", auth, messageMiddleware, (req, res) => {
	Message.destroy({ where: { message_id: req.params.message_id } })
		.then((deletedMessage) => {
			const message = `le message ${req.params.id} a bien été supprimé.`;
			res.json(success(message, deletedMessage));
		})
		.catch((error) => {
			const message = `Le message n'a n'a pas pu être supprimé. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});
export { conversationRouter };
