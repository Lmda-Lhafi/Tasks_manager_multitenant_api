// JWT auth middleware placeholder
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { ApiError, catchAsync } = require("./errorhandler");
require("dotenv").config();

const authorized = catchAsync(async (req, res, next) => {
  const authheader = req.headers.authorization;
  if (!authheader || !authheader.startsWith("Bearer"))
    throw new ApiError(401, "Authentication required");

  const token = authheader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id || !decoded.tenantId)
    throw new ApiError(401, "Invalid token format");

  const user = await User.findById(decoded.id)
    .select("-password")
    .populate("tenant");
  if (!user || !user.isActive || user.isDeleted)
    throw new ApiError(401, "Authentication failed");

  if (!user.tenant || user.tenant._id.toString() !== decoded.tenantId)
    throw new ApiError(401, "Authentication failed");

  req.user = decoded.id;
  req.tenantId = decoded.tenantId;
  next();
});

module.exports = authorized;
