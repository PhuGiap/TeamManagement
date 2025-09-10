const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Load swagger.yaml
const swaggerDocument = YAML.load("./swagger.yaml");

// Serve Swagger UI
router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = router;
