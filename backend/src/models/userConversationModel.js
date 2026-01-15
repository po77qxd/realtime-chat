const UserConversationModel = (sequelize, DataTypes) => {
	return sequelize.define(
		"UserConversation",
		{
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "user_",
					key: "user_id",
				},
			},
			conversation_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: "conversation",
					key: "conversation_id",
				},
			},
		},
		{
			tableName: "user_conversation",
			timestamps: false,
		}
	);
};

export { UserConversationModel };
