const { catchAsync, ApiError } = require("../middleware/errorhandler");

const isAdmin = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") throw new ApiError(403, "access denied");
  next();
});

module.exports = { isAdmin };