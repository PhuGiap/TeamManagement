  const { Team, User } = require("../models");
  const Joi = require("joi");
  const { Op } = require("sequelize");

  const teamSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      "string.empty": "Team name cannot be empty",
      "any.required": "Team name is required",
    }),
    description: Joi.string().allow("").optional(),
    users: Joi.array().items(Joi.number().integer().required()).min(1).required().messages({
      "array.min": "At least one user is required in the team",
      "any.required": "Users list is required",
    }),
  });


  // GET all teams with users
  exports.getAllTeams = async (req, res) => {
    try {
      const teams = await Team.findAll({
        include: [{ 
          model: User,
          as: "users",
          attributes: ['id', 'name', 'email', 'role', 'created_at']
        }], // include associated users
      });
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // GET team by ID with users
  exports.getTeamById = async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id, {
        attributes: ['id', 'name', 'description', 'created_at'], // all fields
        include: [{ 
          model: User, 
          as: "users", 
          attributes: ['id','name','email','role','created_at'] 
        }]
      });

      if (!team) return res.status(404).json({ message: "Team not found" });
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  // CREATE a new team
  exports.createTeam = async (req, res) => {
    try {
      // Joi validate
      const { error, value } = teamSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ errors: error.details.map(e => e.message) });
      }

      const { name, description, users } = value

      // Check team name
      const existTeam = await Team.findOne({ where: { name } });
      if (existTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      // Check if user_id exists
      const foundUsers = await User.findAll({ where: { id: users } });
      if (foundUsers.length !== users.length) {
        return res.status(400).json({ message: "Some users do not exist" });
      }

      // Create a new team
      const team = await Team.create({ name, description });

      // Assign users to this team if provided
      await User.update(
        { teamid: team.id },
        { where: { id: users } }
      );

      // Fetch the team including users for full response
      const result = await Team.findByPk(team.id, {
        include: [{ 
          model: User, 
          as: "users", 
          attributes: ['id', 'name', 'email', 'role', 'created_at'] 
        }],
        
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // UPDATE team info
  exports.updateTeam = async (req, res) => {
    try {
      // Joi validate request body
      const { error, value } = teamSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({ errors: error.details.map(err => err.message) });
      }

      const { name, description, users } = value;
      const teamId = req.params.id;

      // Check if team exists
      const team = await Team.findByPk(teamId);
      if (!team) return res.status(404).json({ message: "Team not found" });

      // Check name is not duplicate (except current team)
      const existingTeam = await Team.findOne({
        where: { name, id: { [Op.ne]: teamId } }
      });
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      // Check if user_id exists
      const foundUsers = await User.findAll({ where: { id: users } });
      if (foundUsers.length !== users.length) {
        return res.status(400).json({ message: "Some users do not exist" });
      }

      // Update team fields
      await team.update({ name, description, users });

      // Reassign users to this team
      await User.update(
        { teamid: team.id },
        { where: { id: users } }
      );

      // Fetch updated team with users for full response
      const result = await Team.findByPk(team.id, {
        include: [{ 
          model: User,
          as: "users",
          attributes: ['id', 'name', 'email', 'role', 'created_at']
         }],
        
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // DELETE team
  exports.deleteTeam = async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id);
      if (!team) return res.status(404).json({ message: "Team not found" });

      await team.destroy();
      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
