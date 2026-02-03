const Joi = require("joi");
const { catchAsync, ApiError } = require("./errorhandler");

const schemas = {
  auth: {
    registerTenant: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.min": "Tenant name must be at least 2 characters",
        "string.max": "Tenant name cannot exceed 100 characters",
        "any.required": "Tenant name is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
      password: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),
    }),
    login: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
    }),
  },
  user: {
    inviteUser: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    }),
    acceptinvite: Joi.object({
      token: Joi.string().required().messages({
        "any.required": "Invitation token is required",
      }),
      password: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),
    }),
    updateUserStatus: Joi.object({
      isActive: Joi.boolean().optional(),
      isDeleted: Joi.boolean().optional(),
    }),
  },
  task: {
    createTask: Joi.object({
      title: Joi.string().min(1).max(200).required().messages({
        "string.min": "Task title must be at least 1 character",
        "string.max": "Task title cannot exceed 200 characters",
        "any.required": "Task title is required",
      }),
      description: Joi.string().max(1000).optional().allow("").messages({
        "string.max": "Task description cannot exceed 1000 characters",
      }),
      status: Joi.string()
        .valid("todo", "in-progress", "done")
        .required()
        .messages({
          "any.only": "Task status must be one of: todo, in-progress, done",
          "any.required": "Task status is required",
        }),
      assignedUsers: Joi.array().items(Joi.string()).default([]),
    }),
    updateTask: Joi.object({
      title: Joi.string().min(1).max(200).optional().messages({
        "string.min": "Task title must be at least 1 character",
        "string.max": "Task title cannot exceed 200 characters",
      }),
      description: Joi.string().max(1000).optional().allow("").messages({
        "string.max": "Task description cannot exceed 1000 characters",
      }),
      status: Joi.string()
        .valid("todo", "in-progress", "done")
        .optional()
        .messages({
          "any.only": "Task status must be one of: todo, in-progress, done",
        }),
    }),
  },
  tenant: {
    updateTenant: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.min": "Tenant name must be at least 2 characters",
        "string.max": "Tenant name cannot exceed 100 characters",
        "any.required": "Tenant name is required",
      }),
    }),
  },
};

// Resolve either a direct schema object or a dot-separated path like "auth.registerTenant"
const getSchemaByPath = (schemaPath) => {
  if (!schemaPath) return null;
  if (typeof schemaPath !== "string") return schemaPath; // already a schema object
  return schemaPath
    .split(".")
    .reduce((acc, part) => (acc && acc[part] ? acc[part] : null), schemas);
};

exports.validate = (schemaName, source = "body") => {
  return catchAsync(async (req, res, next) => {
    const schema = getSchemaByPath(schemaName);

    if (!schema) {
      return next(
        new ApiError(500, `Validation schema '${schemaName}' not found`),
      );
    }

    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return next(new ApiError(400, errorMessage));
    }

    req[source] = value;
    next();
  });
};

// Helper to validate multiple sources
const validateAll = (validations) => {
  return (req, res, next) => {
    const middlewares = Object.entries(validations).map(
      ([source, schemaName]) => validate(schemaName, source),
    );

    // Run all validations sequentially
    let index = 0;
    const runNext = (err) => {
      if (err) return next(err);
      if (index >= middlewares.length) return next();
      middlewares[index++](req, res, runNext);
    };
    runNext();
  };
};

module.exports.validateAll = validateAll;
