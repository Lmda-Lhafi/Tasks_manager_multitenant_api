const Task = require("../models/task.model");
const User = require("../models/user.model");
const { catchAsync, ApiError } = require("../middleware/errorhandler");

// @route   POST /api/task
// @desc    Create a new task
// @access  Private (admin only)
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, status, assignedUsers } = req.body;
  const tenantId = req.tenant;
  const createdBy = req.user.id;

  // keep only valid active/non-deleted users for assignment
  let validAssigned = [];
  if (assignedUsers && assignedUsers.length > 0) {
    const users = await User.find({
      _id: { $in: assignedUsers },
      tenant: tenantId,
      isActive: true,
      isDeleted: false,
    });
    validAssigned = users.map((u) => u._id);
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    tenant: tenantId,
    assignedUsers: validAssigned,
    createdBy,
  });
  await newTask.populate([
    { path: "assignedUsers", select: "name email role" },
    { path: "createdBy", select: "name email" },
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
  const tenantId = req.tenant;
  const { title, description, status, assignedUsers } = req.body;
  const task = await Task.findOne({
    _id: id,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }

  // filter assignedUsers to valid active/non-deleted users (ignore invalid ids)
  if (assignedUsers && assignedUsers.length > 0) {
    const users = await User.find({
      _id: { $in: assignedUsers },
      tenant: tenantId,
      isActive: true,
      isDeleted: false,
    });
    task.assignedUsers = users.map((u) => u._id);
  }

  // Update fields
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;

  await task.save();

  await task.populate([
    { path: "assignedUsers", select: "name email role" },
    { path: "createdBy", select: "name email" },
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
  const tenantId = req.tenant;
  const { status, assignedTo } = req.query;

  const filter = { tenant: tenantId, isDeleted: false };
  if (status) filter.status = status;
  if (assignedTo) filter.assignedUsers = assignedTo;
  const tasks = await Task.find(filter)
    .populate([
      { path: "assignedUsers", select: "name email role" },
      { path: "createdBy", select: "name email" },
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
  const tenantId = req.tenant;

  const tasks = await Task.find({
    tenant: tenantId,
    assignedUsers: userId,
    isDeleted: false,
  })
    .populate([
      { path: "assignedUsers", select: "name email role" },
      { path: "createdBy", select: "name email" },
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
  const tenantId = req.tenant;

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
    { new: true }
  );
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }
  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});

// @route   PATCH /api/task/:id/status
// @desc    Update only the status of a task (assigned users or admin)
// @access  Private
exports.updateTaskStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.tenant;
  const userId = req.user.id;

  if (!status) {
    return next(new ApiError(400, "Status is required"));
  }

  const allowed = ["todo", "in-progress", "done"];
  if (!allowed.includes(status)) {
    return next(new ApiError(400, "Invalid status"));
  }

  const task = await Task.findOne({
    _id: id,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }

  const isAssigned = (task.assignedUsers || []).some((u) => String(u) === String(userId) || String(u?._id) === String(userId));
  const isAdminUser = req.user?.role === "admin" || (Array.isArray(req.user?.roles) && req.user.roles.includes("admin"));

  if (!isAssigned && !isAdminUser) {
    return next(new ApiError(403, "Not authorized to update task status"));
  }

  task.status = status;
  await task.save();

  await task.populate([
    { path: "assignedUsers", select: "name email role" },
    { path: "createdBy", select: "name email" },
  ]);

  res.status(200).json({
    status: "success",
    message: "Task status updated successfully",
    task,
  });
});
