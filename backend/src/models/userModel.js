const UserModel = (sequelize, DataTypes) => {
	return sequelize.define(
		"User",
		{
			user_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			email: {
				type: DataTypes.STRING(75),
				allowNull: false,
				unique: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			password: {
				type: DataTypes.STRING(256),
				allowNull: false,
			},
		},
		{
			tableName: "user_",
			timestamps: false,
		}
	);
};

export { UserModel };
