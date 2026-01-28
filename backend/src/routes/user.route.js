const express = require("express");
const { adduser, acceptinvite, getallusers, updateuserstatus } = require("../controllers/user.controll");
const { validate } = require("../middleware/validate");
const authorized = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/invite",
  validate("user.inviteUser"),
  authorized,
  isAdmin,
  adduser,
);
// need more thinking.
router.post(
  "/accept-invite",
  validate("user.acceptinvite"),
  acceptinvite,
);

router.get("/", authorized, isAdmin, getallusers);
router.patch("/:id/status", validate("user.updateUserStatus"), authorized, isAdmin, updateuserstatus);

module.exports = router;
