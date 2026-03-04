// middlewares/errorHandler.js
const logger = require("../utils/logger");

// Global error handling middleware
function errorHandler(err, req, res, next) {
  logger.error("🌍 Global Error Handler:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  // Handle specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation Error", details: err.message });
  }

  if (err.name === "MongoServerError") {
    return res.status(500).json({ error: "Database Error", details: err.message });
  }

  // Default fallback
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
