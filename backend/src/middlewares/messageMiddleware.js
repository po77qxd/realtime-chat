import { Conversation, Message, User } from "../db/sequelize.js";

const messageMiddleware = async (req, res, next) => {
	try {
		const message = await Message.findByPk(req.params.message_id);
		if (!message) {
			const message = `Le message demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
			return res.status(404).json({ message });
		}

		// the user can edit/delete their own messages
		if (message.user_id == req.user_id) return next();

		const conv = await Conversation.findByPk(req.params.id);
		if (!conv) {
			const message = `La conversation demandée n'existe pas. Merci de réessayer avec un autre identifiant.`;
			return res.status(404).json({ message });
		}

		// the conv admin can edit/delete every message
		if (req.user_id == conv.admin_user_id) return next();

		return res.status(401).json({
			message: "Accès refusé.",
		});
	} catch (error) {
		const message = `Erreur serveur.`;
		return res.status(500).json({ message, data: error });
	}
};

export default messageMiddleware;
