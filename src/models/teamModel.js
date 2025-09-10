const moment = require("moment");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Team = sequelize.define("teams", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, // optional description
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
          const rawValue = this.getDataValue("created_at");
          return rawValue ? moment(rawValue).format("YYYY-MM-DD") : null;
        }, // automatically set to now()
    },
  }, {
    tableName: "teams", // explicit table name
    timestamps: false,  // we manage created_at manually
  });

  return Team;
};
