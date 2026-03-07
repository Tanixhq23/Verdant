const fs = require("fs");

exports.runLighthouseAudit = async (url) => {
  // Dynamically import both
  const chromeLauncher = await import("chrome-launcher");
  const { default: lighthouse } = await import("lighthouse");
  const puppeteer = await import("puppeteer");

  const discoveredChromePath =
    process.env.CHROME_PATH ||
    (typeof puppeteer.executablePath === "function" ? puppeteer.executablePath() : undefined);

  // Only pass an executable path if the browser binary actually exists.
  const chromePath =
    discoveredChromePath && fs.existsSync(discoveredChromePath)
      ? discoveredChromePath
      : undefined;

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: [
      "--headless=new",      // Use new headless mode
      "--no-sandbox",        // Required in Docker/Linux
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Avoid memory issues in Docker
      "--disable-gpu",       // Recommended for headless
      "--incognito",         // Clean state
    ],
  });

  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  try {
    const result = await lighthouse(url, options);
    return result.lhr.categories.performance.score * 100;
  } catch (error) {
    console.error(`Lighthouse Audit Error for ${url}:`, error);
    throw new Error(`Lighthouse audit failed: ${error.message || error}`);
  } finally {
    await chrome.kill(); // Always clean up
  }
};
