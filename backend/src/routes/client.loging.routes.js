const express = require("express");
const { login } = require("../controllers/client.auth.js");

const router = express.Router();
// Client login route
// @route   POST /api/clients/login
router.post("/login", login);

module.exports = router;