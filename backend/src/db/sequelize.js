import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

import { UserModel } from "../models/userModel.js";
import { ConversationModel } from "../models/conversationModel.js";
import { MessageModel } from "../models/messageModel.js";
import { UserConversationModel } from "../models/userConversationModel.js";

import { users } from "./mock-user.js";
import { conversations } from "./mock-conversation.js";
import { userConversations } from "./mock-user-conversation.js";
import { messages } from "./mock-message.js";

const sequelize = new Sequelize(
  "db_chat",
  "root",
  "root",
  {
    host: "localhost",
    port: 6034,
    dialect: "mysql",
    logging: false,
  }
);

// Init models
const User = UserModel(sequelize, DataTypes);
const Conversation = ConversationModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const UserConversation = UserConversationModel(sequelize, DataTypes);

// Associations
User.belongsToMany(Conversation, {
  through: UserConversation,
  foreignKey: "user_id",
});

Conversation.belongsToMany(User, {
  through: UserConversation,
  foreignKey: "conversation_id",
});

Conversation.hasMany(Message, { foreignKey: "conversation_id" });
Message.belongsTo(Conversation, { foreignKey: "conversation_id" });

User.hasMany(Message, { foreignKey: "user_id" });
Message.belongsTo(User, { foreignKey: "user_id" });

Conversation.belongsTo(User, {
  foreignKey: "admin_user_id",
  as: "admin",
});

// Init DB + seed
const initDb = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Base de données synchronisée");

    await importUsers();
    await importConversations();
    await importUserConversations();
    await importMessages();

    console.log("Import des données terminé");
  } catch (error) {
    console.error("Erreur DB :", error);
  }
};

// Imports
const importUsers = async () => {
  await Promise.all(
    users.map(async (user) => {
      const hash = await bcrypt.hash(user.password, 10);
      await User.create({
        name: user.name,
        email: user.email,
        password: hash,
      });
    })
  );
};

const importConversations = async () => {
  await Promise.all(
    conversations.map(async (conv) => {
      await Conversation.create(conv);
    })
  );
};

const importUserConversations = async () => {
  await Promise.all(
    userConversations.map(async (uc) => {
      await UserConversation.create(uc);
    })
  );
};

const importMessages = async () => {
  await Promise.all(
    messages.map(async (msg) => {
      await Message.create(msg);
    })
  );
};

export {
  sequelize,
  initDb,
  User,
  Conversation,
  Message,
  UserConversation,
};
