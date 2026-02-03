const Task = require("../models/task.model");
const User = require("../models/user.model");
const { catchAsync, ApiError } = require("../middleware/errorhandler");

// @route   POST /api/task
// @desc    Create a new task
// @access  Private (admin only)
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, status, assignedUsers } = req.body;
  const tenantId = req.user.tenant;
  const createdBy = req.user.id;

  if (assignedUsers && assignedUsers.length > 0) {
    const users = await User.find({
      _id: { $in: assignedUsers },
      tenant: tenantId,
      isActive: true,
      isDeleted: false,
    });

    if (users.length !== assignedUsers.length) {
      return next(new ApiError(400, "One or more assigned users are invalid"));
    }
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    tenant: tenantId,
    assignedUsers: assignedUsers || [],
    createdBy,
  });
  await newTask.populate([
    { path: "assignedUsers", select: "email role" },
    { path: "createdBy", select: "email" },
  ]);
  res.status(201).json({
    status: "success",
    task: newTask,
  });
});

// @route   PUT /api/task/:id
// @desc    Update a task
// @access  Private (admin only)
exports.updatetask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tenantId = req.user.tenant;
  const { title, description, status, assignedUsers } = req.body;
  const task = await Task.findOne({
    _id: id,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }

  if (assignedUsers && assignedUsers.length > 0) {
    const users = await User.find({
      _id: { $in: assignedUsers },
      tenant: tenantId,
      isActive: true,
      isDeleted: false,
    });

    if (users.length !== assignedUsers.length) {
      return next(new ApiError(400, "Invalid assigned users"));
    }
  }

  // Update fields
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  if (assignedUsers) task.assignedUsers = assignedUsers;

  await task.save();

  await task.populate([
    { path: "assignedUsers", select: "email role" },
    { path: "createdBy", select: "email" },
  ]);

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    task,
  });
});

// get all tasks by tenant (admin only)
// @route   GET /api/tasks
// @desc    Get all tasks in the tenant
// @access  Admin
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const tenantId = req.user.tenant;
  const { status, assignedTo } = req.query;

  const filter = { tenant: tenantId, isDeleted: false };
  if (status) filter.status = status;
  if (assignedTo) filter.assignedUsers = assignedTo;
  const tasks = await Task.find(filter)
    .populate([
      { path: "assignedUsers", select: "email role" },
      { path: "createdBy", select: "email" },
    ])
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: tasks.length,
    tasks,
  });
});

// @route   GET /api/task/me
// @desc    Get tasks assigned to the its user
// @access  User
exports.getmytasks = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const tenantId = req.user.tenant;

  const tasks = await Task.find({
    tenant: tenantId,
    assignedUsers: userId,
    isDeleted: false,
  })
    .populate([
      { path: "assignedUsers", select: "email role" },
      { path: "createdBy", select: "email" },
    ])
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: tasks.length,
    tasks,
  });
});

// @route   DELETE /api/task/:id
// @desc    Soft delete a task
// @access  Private (admin only)
exports.deletetask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tenantId = req.user.tenant;

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      tenant: tenantId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user._id,
    },
    { new: true },
  );
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }
  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
