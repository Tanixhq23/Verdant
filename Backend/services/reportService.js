const Report = require("../models/AuditReport"); // mongoose schema

async function getLatestReport() {
  return await Report.findOne().sort({ createdAt: -1 }).lean();
}

module.exports = { getLatestReport };
