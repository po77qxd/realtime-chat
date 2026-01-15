const MessageModel = (sequelize, DataTypes) => {
	return sequelize.define(
		"Message",
		{
			message_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			text: {
				type: DataTypes.STRING(4096),
				allowNull: false,
			},
			timestamp_: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			conversation_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "conversation",
					key: "conversation_id",
				},
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "user_",
					key: "user_id",
				},
			},
		},
		{
			tableName: "message",
			timestamps: false,
		}
	);
};

export { MessageModel };
