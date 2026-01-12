import express from "express";
import { success } from "../routes/helper.js";
import { Conversation } from "../db/sequelize.js";

const conversationRouter = express();

conversationRouter.get("/", (req, res) => {
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

conversationRouter.get("/:id", (req, res) => {
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



export { conversationRouter };