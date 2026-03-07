// websitetracker/controllers/auditController.js
const express = require("express");
const { runLighthouseAudit } = require("../services/lighthouseService");
const { scrapePageResources } = require("../services/scraperService");
const { checkGreenHosting } = require("../services/hostingService");
const { runEcoIndexAnalysis } = require("../services/ecoindexService");
const { applyHeuristics } = require("../services/heuristicsService");
const {
  scrapeDetailedPageData,
  breakdownResources,
} = require("../services/pageAnalysisService");

const AuditReport = require("../models/AuditReport");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

const app = express();

// Example error route
app.get("/notfound", (req, res, next) => {
  next(new AppError("Resource not found", 404));
});

exports.getAuditReport = (req, res) => {
  try {
    logger.info("Audit report requested");
    res.json({ msg: "Audit report generated" });
  } catch (err) {
    logger.error("Error generating report: " + err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.auditWebsite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // 1️⃣ Lighthouse performance audit
    const lighthouseScore = await runLighthouseAudit(url);

    // 2️⃣ Basic page resource scrape
    const resourceData = await scrapePageResources(url);

    // 3️⃣ Emissions analysis via EcoIndex / WebsiteCarbon API
    const carbonAnalysis = await runEcoIndexAnalysis(url);

    // 4️⃣ Apply custom heuristics
    const heuristics = await applyHeuristics(resourceData);

    // 5️⃣ Check green hosting status
    const greenHosting = await checkGreenHosting(url);

    // 6️⃣ In-depth page & resource analysis
    const detailedData = await scrapeDetailedPageData(url);
    const breakdown = breakdownResources(detailedData.resources);

    // 7️⃣ Final verdict
    const hasMeasuredCarbon =
      typeof carbonAnalysis?.co2PerVisit === "number" &&
      Number.isFinite(carbonAnalysis.co2PerVisit);

    const verdict =
      lighthouseScore > 60 &&
      hasMeasuredCarbon &&
      carbonAnalysis.co2PerVisit < 0.8 &&
      greenHosting
        ? "Optimized"
        : "Needs Improvement";

    // 8️⃣ Build audit report object
    const auditReport = {
      url,
      lighthouseScore,
      carbonAnalysis,
      resourceData,
      heuristics,
      greenHosting,
      verdict,
      breakdown,
      pageAnalysis: detailedData.domData,
    };

    // 9️⃣ Save to MongoDB
    const newReport = new AuditReport(auditReport);
    await newReport.save();

    // 🔟 Respond to frontend
    res.status(200).json({
      message: "Audit complete. Report saved to MongoDB.",
      reportId: newReport._id,
      detailedReport: auditReport,
    });
  } catch (error) {
    console.error("Audit failed:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
