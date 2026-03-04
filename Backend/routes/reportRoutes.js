const express = require("express");
const { getLatestReportAnalysis } = require("../controllers/reportController");

const router = express.Router();

router.get("/latest-analysis", getLatestReportAnalysis);

module.exports = router;
