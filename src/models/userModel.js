const moment = require("moment");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        vailidate: {
          isEmail: true, // validate email format
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
      },
      teamid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "teams",
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          const rawValue = this.getDataValue("created_at");
          return rawValue ? moment(rawValue).format("YYYY-MM-DD") : null;
        },
      },
    },
    {
      tableName: "users", 
      timestamps: false,  
    }
  );

  return User;
};
