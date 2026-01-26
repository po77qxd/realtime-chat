import express from "express";
import { success } from "../routes/helper.js";
import { Conversation, Message, User } from "../db/sequelize.js";
import auth from "../auth/auth.js";
import messageMiddleware from "../middlewares/messageMiddleware.js ";
import convMiddleware from "../middlewares/convMiddleware.js";
import { redisClient } from "../db/redis.js";

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
		{ where: { conversation_id: req.params.id } },
	)
		.then((updatedConv) => {
			const message = `la conversation ${req.params.id} a bien été modifiée.`;

			Conversation.findByPk(req.params.id).then((conv) => {
				req.io.to(`users_conv_${req.params.id}`).emit("edit_conv", {
					...conv.get({ plain: true }),
				});
				res.json(success(message, conv));
			});
		})
		.catch((error) => {
			const message = `La conversation n'a n'a pas pu être modifiée. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.delete("/:id", auth, convMiddleware, (req, res) => {
	Conversation.destroy({ where: { conversation_id: req.params.id } })
		.then(async (deletedConv) => {
			await redisClient.del(`conversations:${req.params.id}:messages`); //supprimer le cache quand la conversation est supprimée
			const message = `la conversation ${req.params.id} a bien été supprimée.`;

			req.io.to(`users_conv_${req.params.id}`).emit("delete_conv", req.params.id);

			res.json(success(message, deletedConv));
		})
		.catch((error) => {
			const message = `La conversation n'a n'a pas pu être supprimé. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

// MESSAGES //
conversationRouter.get("/:id/messages", auth, async (req, res) => {
	const cacheKey = `conversations:${req.params.id}:messages`;

	const cached = await redisClient.get(cacheKey);
	if (cached) {
		const message = `[CACHE] Les messages de la conversation ${req.params.id} ont bien été récupérés`;
		return res.json(success(message, JSON.parse(cached)));
	}
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
		.then(async (messages) => {
			await redisClient.set(cacheKey, JSON.stringify(messages));
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
				.then(async (user) => {
					req.io.to(`conversation_${req.params.id}`).emit("new_message", {
						...createdMessage.get({ plain: true }),
						User: user,
					});
					await redisClient.del(`conversations:${req.params.id}:messages`); //invalider la cache car nouveau message
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
			const message = `le message ${req.params.message_id} a bien été modifié.`;

			Message.findByPk(req.params.message_id).then(async (new_message) => {
				req.io.to(`conversation_${req.params.id}`).emit("edit_message", {
					...new_message.get({ plain: true }),
				});
				await redisClient.del(`conversations:${req.params.id}:messages`);
				res.json(success(message, new_message));
			});
		})
		.catch((error) => {
			const message = `Le message n'a n'a pas pu être modifié. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

conversationRouter.delete("/:id/messages/:message_id", auth, messageMiddleware, (req, res) => {
	Message.destroy({ where: { message_id: req.params.message_id } })
		.then(async (_) => {
			const message = `le message ${req.params.id} a bien été supprimé.`;

			req.io.to(`conversation_${req.params.id}`).emit("delete_message", {
				message_id: req.params.message_id,
				conversation_id: req.params.id,
			});
			await redisClient.del(`conversations:${req.params.id}:messages`);
			res.json(success(message, req.params.message_id));
		})
		.catch((error) => {
			const message = `Le message n'a n'a pas pu être supprimé. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

// USERS //
conversationRouter.get("/:id/users", auth, async (req, res) => {
	Conversation.findByPk(req.params.id, {
		include: [
			{
				model: User,
				attributes: ["user_id", "name"],
				through: {
					attributes: [],
				},
			},
		],
	})
		.then(async (conv) => {
			if (conv === null) {
				const message = `La conversation demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
				return res.status(404).json({ message });
			}

			conv.Users = await Promise.all(
				conv.Users.map(async (user) => {
					const isOnline = await redisClient.exists(`user:sockets:${user.user_id}`);
					return {
						...user.get({ plain: true }),
						isOnline: isOnline == 1, // 1 si l'user est en ligne, sinon 0
					};
				}),
			);
			const message = `Les utilisateur de la conversation dont l'id vaut ${conv.conversation_id} ont bien été récupérés !`;
			res.json(success(message, conv.Users));
		})
		.catch((error) => {
			console.error(error);
			const message = `Les utilisateur de la conversation n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

export { conversationRouter };
