import express from "express";
import { success } from "../routes/helper.js";
import { Message } from "../db/sequelize.js";

const messageRouter = express();

messageRouter.get("/", (req, res) => {
  Message.findAll({ order: ["timestamp_"]})
    .then((messages) => {
      const message = `Il y a ${messages.length} messages qui correspondent au terme de la recherche`;
      res.json(success(message, messages));
    })
    .catch((error) => {
      const message = `Les messages n'ont pas pu être récupérés. Merci de réessayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

messageRouter.get("/:id", (req, res) => {
  Message.findByPk(req.params.id)
    .then((message) => {
      if (message === null) {
        const res_message = `Le message demandé n'existe pas. Merci de réessayer avec un autre identifiant.`;
        return res.status(404).json({ res_message });
      }
      const res_message = `Le message dont l'id vaut ${message.message_id} a bien été récupéré !`;
      res.json(success(res_message, message));
    })
    .catch((error) => {
      const res_message = `Le message n'a pas pu être récupéré. Veuillez reéssayer dans quelques instants.`;
      res.status(500).json({ res_message, data: error });
    });
});

export { messageRouter };