const sequelize = require("../config/db");
const UserModel = require("./userModel");
const TeamModel = require("./teamModel");

const User = UserModel(sequelize);
const Team = TeamModel(sequelize);

// relationship
Team.hasMany(User, { foreignKey: "teamid", as: "users" });
User.belongsTo(Team, { foreignKey: "teamid", as: "teams" });

module.exports = { sequelize, User, Team };
