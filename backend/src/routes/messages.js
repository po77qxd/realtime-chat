import express from "express";
import { success } from "../routes/helper.js";
import { Message } from "../db/sequelize.js";
import auth from "../auth/auth.js";

const messageRouter = express();

messageRouter.get("/", auth, (req, res) => {
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

messageRouter.get("/:id", auth, (req, res) => {
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

messageRouter.put("/:id", auth, (req, res) => {
  Message.update({text: req.body.text}, { where: { message_id: req.params.id}})
    .then((updatedMessage) => {
      const message = `le message ${req.params.id} a bien été modifié.`;
      res.json(success(message, updatedMessage));
    })
    .catch((error) => {
      const message = `Le message n'a n'a pas pu être modifié. Merci de réessayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

messageRouter.delete("/:id", auth, (req, res) => {
  Message.destroy({ where: { message_id: req.params.id}})
    .then((deletedMessage) => {
      const message = `le message ${req.params.id} a bien été supprimé.`;
      res.json(success(message, deletedMessage));
    })
    .catch((error) => {
      const message = `Le message n'a n'a pas pu être supprimé. Merci de réessayer dans quelques instants.`;
      res.status(500).json({ message, data: error });
    });
});

export { messageRouter };