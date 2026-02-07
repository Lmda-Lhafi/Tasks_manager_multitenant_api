const User = require("../models/user.model");
const Tenant = require("../models/tenant.model");
const { catchAsync, ApiError } = require("../middleware/errorhandler");
const jwt = require("jsonwebtoken");

// there a issue here (the tenant saved even if there an error || )
// @route   POST /api/auth/register-tenant
// @desc    Register a new user
// @access  Public
exports.registerTenant = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }
  const existingTenant = await Tenant.findOne({
    name: name,
    isDeleted: false,
  });
  if (existingTenant) {
    throw new ApiError(400, "Tenant name already in use");
  }
  const tenant = new Tenant({ name: name });
  await tenant.save();

  const user = new User({
    email,
    password,
    role: "admin",
    tenant: tenant._id,
  });
  await user.save();

  const token = jwt.sign(
    { id: user._id, tenant: tenant._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  // remove ids
  res.status(201).json({
    message: "Tenant and admin user created successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tenant: {
      id: tenant._id,
      name: tenant.name,
    },
  });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false }).populate(
    "tenant",
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(401, "Account is deactivated");
  }

  if (!user.tenant) {
    throw new ApiError(401, "Tenant not found");
  }

  if (!user.tenant.status) {
    throw new ApiError(401, "Tenant is suspended");
  }

  const token = jwt.sign(
    { id: user._id, tenant: user.tenant._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  // return user and tenant as separate objects
  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tenant: {
      id: user.tenant._id,
      name: user.tenant.name,
    },
  });
});

//logout

//refresh token

//forgot password

//reset password

//change password
