const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "user"), allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    profileImage: { type: DataTypes.STRING, allowNull: true },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = User;
