const { catchAsync, ApiError } = require("../middleware/errorhandler");
const User = require("../models/user.model");
const Tenant = require("../models/tenant.model");
const sendemail = require("../config/mailer");
const jwt = require("jsonwebtoken");

// get user info.
// update user info (name, password, etc.) (user can update their own info, admin can update any user in their tenant)

// @route   POST /api/users/invite
// @desc    Invite a new user to the tenant
// @access  Admin
exports.adduser = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // normalize tenant id whether req.tenant is an object or a string
  const tenantId = req.tenant && req.tenant._id ? req.tenant._id : req.tenant;

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    tenant: tenantId,
    isDeleted: false,
  });
  if (existingUser) {
    return next(new ApiError(400, "User with this email already exists"));
  }

  const admin = await User.findById(req.user._id);
  const tenant = await Tenant.findById(tenantId);

  const jwtToken = jwt.sign(
    {
      email: email.toLowerCase(),
      tenant: tenantId,
      role: "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.INVITE_EXPIRES_IN },
  );

  const invitelink = `${process.env.FRONTEND_URL}/accept-invite?token=${jwtToken}`;

  await sendemail({
    to: email,
    subject: `${admin.email} invited you to join ${tenant.name}`,
    replyTo: admin.email,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">You've been invited!</h1>
        <p><strong>${admin.email}</strong> has invited you to join <strong>${tenant.name}</strong>.</p>
        <p>Click the button below to accept the invitation and set your password:</p>
        <a href="${invitelink}" 
           style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; 
                  text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 14px;">
          This invitation will expire in ${process.env.INVITE_EXPIRES_IN}.<br>
          If you have questions, reply to this email to contact ${admin.email}.
        </p>
      </div>
    `,
  });
  res.status(200).json({
    status: "success",
    message: "Invitation sent successfully",
    token: jwtToken, // include token in response for testing purposes (in production, you might want to omit this)
  });
});

// @route   POST /api/user/accept-invite
// @desc    Accept user invitation
// @access  Public
exports.acceptinvite = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new ApiError(400, "Invalid or expired token"));
  }

  const tenantId = decoded.tenant || decoded.tenantId;

  const existingUser = await User.findOne({
    email: decoded.email.toLowerCase(),
    tenant: tenantId,
    isDeleted: false,
  });
  if (existingUser) {
    return next(new ApiError(400, "User with this email already exists"));
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    return next(new ApiError(404, "Tenant not found"));
  }

  const newUser = await User.create({
    email: decoded.email.toLowerCase(),
    password,
    role: decoded.role,
    tenant: tenantId,
  });

  const jwtToken = jwt.sign(
    {
      id: newUser._id,
      tenant: newUser.tenant,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  res.status(201).json({
    status: "success",
    token: jwtToken,
    user: {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      tenant: newUser.tenant,
    },
  });
});

// @route   GET /api/user
// @desc    Get all users in the tenant
// @access  Admin
exports.getallusers = catchAsync(async (req, res, next) => {
  const tenantId = req.tenant && req.tenant._id ? req.tenant._id : req.tenant;

  const users = await User.find({ tenant: tenantId, isDeleted: false }).select(
    "-password",
  );
  res.status(200).json({
    status: "success",
    results: users.length,
    users,
  });
});

// @route   PATCH /api/user/:id/status
// @desc    Update user status (supports isActive and isDeleted)
// @access  Admin
exports.updateuserstatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive, isDeleted } = req.body;

  // Prevent users (including admins) from deactivating or deleting their own account
  if (String(id) === String(req.user && (req.user._id || req.user.id)) && String(req.user?.role) === "admin") {
    if ((typeof isDeleted !== "undefined" && isDeleted === true) ||
        (typeof isActive !== "undefined" && isActive === false)) {
      return next(new ApiError(403, "Admins cannot deactivate or delete your own account"));
    }
  }

  const tenantId = req.tenant && req.tenant._id ? req.tenant._id : req.tenant;

  const update = {};
  if (typeof isDeleted !== "undefined") {
    update.isDeleted = !!isDeleted;
    if (isDeleted) {
      update.isActive = false;
      update.deletedAt = new Date();
      update.deletedBy = req.user && req.user._id ? req.user._id : null;
    } else {
      update.deletedAt = null;
      update.deletedBy = null;
    }
  }
  if (typeof isActive !== "undefined") {
    if (!update.isDeleted) update.isActive = !!isActive;
  }

  if (Object.keys(update).length === 0) {
    return next(new ApiError(400, "No valid fields provided for update"));
  }

  const findFilter = { _id: id, tenant: tenantId };
  if (!(typeof isDeleted !== "undefined" && isDeleted === false)) {
    findFilter.isDeleted = false;
  }

  const updatedUser = await User.findOneAndUpdate(findFilter, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    return next(new ApiError(404, "User not found or access denied"));
  }

  res.status(200).json({
    status: "success",
    message: "User status updated successfully",
    user: updatedUser,
  });
});
