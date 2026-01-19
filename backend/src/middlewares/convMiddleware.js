import { Conversation, Message } from "../db/sequelize.js";

const convMiddleware = async (req, res, next) => {
	try {
		const conv = await Conversation.findByPk(req.params.id);
		if (!conv) {
			const message = `La conversation demandée n'existe pas. Merci de réessayer avec un autre identifiant.`;
			return res.status(404).json({ message });
		}

		// the conv admin can edit/delete the conversation
		if (req.user_id == conv.admin_user_id) return next();

		return res.status(401).json({
			message:
				"Accès refusé, vous n'avez pas les droits pour modifer/supprimer cette conversation.",
		});
	} catch (error) {
		const message = `Erreur serveur.`;
		return res.status(500).json({ message, data: error });
	}
};

export default convMiddleware;
