const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function formatMetric(label, value, suffix = "") {
  return `- ${label}: ${value ?? "N/A"}${value ?? value === 0 ? suffix : ""}`;
}

function buildFallbackAnalysis(report, reason) {
  const lighthouseScore = report?.lighthouseScore;
  const carbon = report?.carbonAnalysis?.co2PerVisit;
  const cleanerThan = report?.carbonAnalysis?.cleanerThan;
  const greenHost = report?.greenHosting;
  const heuristics = report?.heuristics || {};
  const pageAnalysis = report?.pageAnalysis || {};

  const improvements = [];

  if (typeof lighthouseScore === "number" && lighthouseScore < 70) {
    improvements.push("Reduce render-blocking CSS and JavaScript to improve the performance score.");
  }

  if (typeof heuristics.uncompressedImages === "number" && heuristics.uncompressedImages > 0) {
    improvements.push("Compress large images and serve modern formats such as WebP or AVIF.");
  }

  if (typeof heuristics.largeScripts === "number" && heuristics.largeScripts > 0) {
    improvements.push("Split or defer large JavaScript bundles so the page loads less code upfront.");
  }

  if (greenHost === false) {
    improvements.push("Move the site to a green hosting provider to reduce infrastructure emissions.");
  }

  if (typeof pageAnalysis.imagesWithoutLazy === "number" && pageAnalysis.imagesWithoutLazy > 0) {
    improvements.push("Lazy-load below-the-fold images to reduce transfer size and improve initial render.");
  }

  while (improvements.length < 3) {
    improvements.push("Audit third-party scripts and remove low-value resources that increase page weight.");
  }

  return [
    "AI analysis is temporarily unavailable, so this is a rule-based fallback summary.",
    "",
    "## Key findings",
    formatMetric("Lighthouse score", lighthouseScore),
    formatMetric("CO2 per visit", carbon, "g"),
    formatMetric("Cleaner than", cleanerThan),
    formatMetric("Green hosting", greenHost === null ? "Unknown" : greenHost ? "Yes" : "No"),
    formatMetric("Total requests", heuristics.totalRequests),
    formatMetric("Uncompressed images", heuristics.uncompressedImages),
    formatMetric("Large scripts", heuristics.largeScripts),
    formatMetric("External domains", heuristics.externalDomains),
    "",
    "## Critical issues",
    `- Fallback reason: ${reason}`,
    typeof lighthouseScore === "number" && lighthouseScore < 70
      ? "- Performance score is below the target threshold."
      : "- No critical Lighthouse regression detected.",
    typeof carbon === "number"
      ? `- Estimated carbon output is ${carbon}g per visit.`
      : "- Carbon estimate is unavailable or based on degraded upstream data.",
    "",
    "## Suggested improvements",
    `1. ${improvements[0]}`,
    `2. ${improvements[1]}`,
    `3. ${improvements[2]}`,
  ].join("\n");
}

function getOpenAIErrorReason(error) {
  if (!error) {
    return "unknown error";
  }

  if (error.status === 429) {
    return "OpenAI quota exceeded";
  }

  if (error.code === "insufficient_quota") {
    return "OpenAI quota exceeded";
  }

  return error.message || "unknown error";
}

async function analyzeReport(report) {
  if (!client) {
    return buildFallbackAnalysis(report, "OPENAI_API_KEY is not configured");
  }

  const prompt = `
  You are an expert web performance and carbon audit analyzer.
  Given the following report JSON, generate a clear analysis:
  - Summarize the key findings.
  - Mention exact metric values.
  - Highlight critical issues.
  - Suggest 3 improvements.
  Report JSON: ${JSON.stringify(report)}
  `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices?.[0]?.message?.content || buildFallbackAnalysis(report, "empty OpenAI response");
  } catch (error) {
    return buildFallbackAnalysis(report, getOpenAIErrorReason(error));
  }
}

module.exports = { analyzeReport };
