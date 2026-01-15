import express from "express";
import bcrypt from "bcrypt";
import { User } from "../db/sequelize.js";
import { ValidationError } from "sequelize";
import { cleanUser } from "./helper.js";

const registerRouter = express();

registerRouter.post("/", (req, res) => {
	const { email, name, password } = req.body;

	if (!email || !name || !password) {
		const message = "L'email le npm et le mot de passe sont obligatoires pour s'inscrire.";
		return res.status(400).json({ message });
	}

	bcrypt.hash(password, 8).then((hashedPassword) => {
		User.create({ email: email, name: name, password: hashedPassword })
			.then((user) => {
				const message = `L'utilisateur ${name} (${email}) a été créé.`;
				res.json({ message, data: cleanUser(user) });
			})
			.catch((error) => {
				if (error instanceof ValidationError) {
					return res.status(400).json({ message: error.message, data: error });
				}
				const message = "L'utilisateur n'a pas pu être créé. Réessayez.";
				res.status(500).json({ message, data: error });
			});
	});
});

export { registerRouter };
