// Custom ApiError class
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for admin
  console.error("ERROR 💥:", err);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

// 404 not found handler later if the apperror added.

// Async Error Wrapper (to avoid try-catch blocks)
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// add Mongoose error handling later if needed

module.exports = { ApiError, errorHandler, catchAsync };
