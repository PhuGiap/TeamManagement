require("dotenv").config();
const express = require("express");
const app = express();
const { sequelize } = require("./models");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const swaggerRoutes = require("./routes/swaggerRoutes");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);

// Swagger docs
app.use("/api-docs", swaggerRoutes);

const PORT = process.env.PORT || 5001;

sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ Unable to connect to DB:", err));

