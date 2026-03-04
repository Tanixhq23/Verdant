const { getLatestReport } = require("../services/reportService");
const { analyzeReport } = require("../services/aiService");

async function getLatestReportAnalysis(req, res, next) {
  try {
    const latestReport = await getLatestReport();
    if (!latestReport) {
      return res.status(404).json({ message: "No reports found" });
    }

    const analysis = await analyzeReport(latestReport);

    res.json({
      report: latestReport,
      analysis: analysis
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLatestReportAnalysis };
