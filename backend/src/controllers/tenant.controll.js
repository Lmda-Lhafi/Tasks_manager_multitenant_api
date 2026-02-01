const Tenant = require("../models/tenant.model");
const { catchAsync, ApiError } = require("../middleware/errorhandler");

// extract Id helper
const extractId = (value) => {
  if (!value) return null;
  return value._id || value;
};

// @route   GET /api/tenant/:id
// @desc    Get tenant info
// @access  Public
exports.gettenantinfo = catchAsync(async (req, res, next) => {
  const tenantId = req.params.id;
  const tenant = await Tenant.findOne({ _id: tenantId, isDeleted: false });
  if (!tenant) {
    return next(new ApiError("Tenant not found", 404));
  }
  res.status(200).json({
    success: true,
    data: tenant,
  });
});

// @route   PUT /api/tenant/:id
// @desc    Update tenant info
// @access  admin
exports.updatetenantinfo = catchAsync(async (req, res, next) => {
  const tenantId = req.params.id;
  const { name } = req.body;

  const adminTenantId = extractId(req.user && req.user.tenant);
  if (tenantId.toString() !== adminTenantId.toString()) {
    return next(new ApiError("Access denied", 403));
  }
  const tenant = await Tenant.findOneAndUpdate(
    { _id: tenantId, isDeleted: false },
    { name },
    { new: true },
  );
  if (!tenant) {
    return next(new ApiError("Tenant not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Tenant info updated successfully",
    data: tenant,
  });
});

// update tenant status (super admin only)

// delete tenant (soft delete) (super admin only)

// restore tenant (super admin only)