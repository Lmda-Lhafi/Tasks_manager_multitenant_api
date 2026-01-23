const { catchAsync, ApiError } = require("../middleware/errorhandler");

const isAdmin = catchAsync(async (req, resizeBy, next) => {
  if (req.user.role !== "admin") return new ApiError(403, "access denied");
  next();
});

module.exports = { isAdmin };
