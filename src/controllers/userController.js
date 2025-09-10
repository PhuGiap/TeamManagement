const { User, Team } = require("../models");
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const userSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    "string.empty": "Name cannot be empty",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("member", "admin").required().messages({
    "any.only": "Role must be either 'user' or 'admin'",
    "string.empty": "Role cannot be empty",
    "any.required": "Role is required",
  }),
  teamid: Joi.number().integer().optional(),
});

// GET all users with team info
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "created_at"], //get all columns except password
      include: [
        {
          model: Team,
          as: "teams", // alias must match your association in User model
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user by ID with team info
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role", "created_at"], // get all columns except password
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new user
exports.createUser = async (req, res) => {
  try {
    // Validate body
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: error.details.map(d => d.message) });

    const { name, email, password, role, teamid } = value;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword, role, teamid });

    const result = await User.findByPk(user.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    // Validate body (password optional)
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ message: error.details.map(d => d.message) });

    const { name, email, password, role, teamid } = value;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cập nhật password nếu có
    const updatedData = { name, email, role, teamid };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    await user.update(updatedData);

    const result = await User.findByPk(user.id, {
      attributes: ["id", "name", "email", "role", "created_at"],
      include: [
        {
          model: Team,
          as: "teams",
          attributes: ["id", "name", "description", "created_at"],
        },
      ],
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check if user is the last in team
    if (user.teamid) {
      const userCount = await User.count({ where: { teamid: user.teamid } });
      if (userCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete user: team must have at least 1 user",
        });
      }
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
