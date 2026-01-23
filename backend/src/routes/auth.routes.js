const express = require("express");
const { registerTenant, login } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register-tenant",
  validate("auth.registerTenant"),
  registerTenant,
);

router.post("/login", validate("auth.login"), login);


module.exports = router;