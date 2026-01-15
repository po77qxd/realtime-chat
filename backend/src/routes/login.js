import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../db/sequelize.js";
import { cleanUser } from "./helper.js";

const loginRouter = express();

loginRouter.post("/", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		const message = "L'email et le mot de passe sont obligatoires pour se connecter.";
		return res.status(400).json({ message });
	}

	User.findOne({ where: { email: email } })
		.then((user) => {
			if (!user) {
				const message = "L'email est incorrect.";
				return res.status(401).json({ message });
			}

			bcrypt
				.compare(password, user.password)
				.then((validPassword) => {
					if (!validPassword) {
						const message = "Le mot de passe est faux.";
						return res.status(401).json({ message });
					} else {
						const token = jwt.sign({ user_id: user.user_id }, process.env.PRIV_KEY, {
							expiresIn: "7d",
						});
						res.cookie("realtime_chat", token, {
							httpOnly: true,
							secure: false,
							sameSite: "Strict",
							maxAge: 1000 * 60 * 60 * 60 * 24 * 7, // 7d
						});
						const message = "L'utilisateur a été connecté.";
						res.json({ message, data: cleanUser(user) });
					}
				})
				.catch((error) => {
					const message = "Erreur lors de la vérification du mot de passe.";
					res.status(500).json({ message, data: error });
				});
		})
		.catch((error) => {
			const message = "L'utilisateur n'a pas pu être connecté. Réessayez.";
			res.status(500).json({ message, data: error });
		});
});

export { loginRouter };
