const ConversationModel = (sequelize, DataTypes) => {
	return sequelize.define(
		"Conversation",
		{
			conversation_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
			},
			admin_user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "user_",
					key: "user_id",
				},
			},
		},
		{
			tableName: "conversation",
			timestamps: false,
		}
	);
};

export { ConversationModel };
