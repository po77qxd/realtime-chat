// models/index.js
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
