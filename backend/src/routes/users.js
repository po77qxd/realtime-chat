import express from "express";
import { success } from "../routes/helper.js";
import { User, Conversation } from "../db/sequelize.js";
import auth from "../auth/auth.js";
import { Op } from "sequelize";

const userRouter = express();

userRouter.get("/", auth, (req, res) => {
	User.findAll({ order: ["name"], attributes: { exclude: ["password", "email"] } })
		.then((users) => {
			const message = `Il y a ${users.length} utilisateurs qui correspondent au terme de la recherche`;
			res.json(success(message, users));
		})
		.catch((error) => {
			const message = `Les utilisateurs n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

//récuprée l'id de l'utilisateur connecté
userRouter.get("/currentUser", auth, async (req, res) => {
	try {
		const user = await User.findByPk(req.user_id, {
			attributes: { exclude: ["password", "email"] }, // évite d'envoyer le mot de passe et l'email
		});
		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}
		res.json(user);
	} catch (error) {
		const message = `L'id utilisateur n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
		res.status(500).json({ message, data: error });
	}
});

userRouter.get("/:id", auth, (req, res) => {
	User.findByPk(req.params.id, {
		attributes: { exclude: ["password", "email"] }, // évite d'envoyer le mot de passe et l'email
	})
		.then((user) => {
			if (user === null) {
				const message = `L'utilisateur demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
				return res.status(404).json({ message });
			}
			const message = `L'utilisateur dont l'id vaut ${user.user_id} a bien été récupéré !`;
			res.json(success(message, user));
		})
		.catch((error) => {
			const message = `L'utilisateur n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

userRouter.get("/:id/conversations", auth, (req, res) => {
	User.findByPk(req.params.id, {
		attributes: { exclude: ["password", "email"] }, // évite d'envoyer le mot de passe et l'email
		include: [
			{
				model: Conversation,
				attributes: ["conversation_id", "name", "admin_user_id"],
				required: false,
				where: {
					name: {
						[Op.substring]: req.query.name,
					},
				},
				through: {
					attributes: [], //ne pas renvoyer la table intermédiaire (userConversation)
				},
			},
		],
	})
		.then((user) => {
			if (user === null) {
				const message = `L'utilisateur demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
				return res.status(404).json({ message });
			}

			const message = `Les conversations de l'utilisateur dont l'id vaut ${user.user_id} ont bien été récupérées !`;
			res.json(success(message, user.Conversations));
		})
		.catch((error) => {
			const message = `Les conversations de l'utilisateur n'ont pas pu être récupérées. Veuillez reéssayer dans quelques instants.`;
			res.status(500).json({ message, data: error });
		});
});

userRouter.post("/logout", (req, res) => {
	try {
		res.clearCookie("realtime_chat", {
			path: "/",
		});

		const message = `L'utilisateur a bien été déconnecté.`;
		res.status(200).json({ message });
	} catch (error) {
		const message = `La déconnexion a échoué. Veuillez réessayer dans quelques instants.`;
		res.status(500).json({ message, data: error });
	}
});

export { userRouter };
