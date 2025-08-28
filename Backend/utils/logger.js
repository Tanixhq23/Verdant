// utils/logger.js
const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname, "../logs/error.log"), level: "error" }), // This will only write logs with a level of 'error' or higher
    new transports.File({ filename: path.join(__dirname, "../logs/combined.log"), level: "info" }), // This will write all logs from 'info' level up to 'error'
  ],
});

module.exports = logger;