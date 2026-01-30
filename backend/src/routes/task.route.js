const express = require("express");
const { createTask, updatetask, getAllTasks, getmytasks, deletetask } = require("../controllers/task.controller");
const { validate } = require("../middleware/validate");
const authorized = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/", authorized, isAdmin, validate("task.createTask"), createTask);
router.put("/:id", authorized, isAdmin, validate("task.updateTask"), updatetask);
router.get("/", authorized, isAdmin, getAllTasks);
router.get("/me", authorized, getmytasks);
router.delete("/:id", authorized, isAdmin, deletetask);



module.exports = router;