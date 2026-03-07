const fs = require("fs");
const path = require("path");

function findChromeInCache(cacheDir) {
  if (!cacheDir || !fs.existsSync(cacheDir)) {
    return null;
  }

  const stack = [cacheDir];
  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && (entry.name === "chrome" || entry.name === "chrome.exe")) {
        return fullPath;
      }
    }
  }

  return null;
}

exports.runLighthouseAudit = async (url) => {
  const { default: lighthouse } = await import("lighthouse");
  const puppeteerModule = await import("puppeteer");
  const puppeteer = puppeteerModule.default || puppeteerModule;
  const cacheDir =
    process.env.PUPPETEER_CACHE_DIR || path.join(__dirname, "..", ".cache", "puppeteer");

  let executablePath;
  try {
    executablePath =
      typeof puppeteer.executablePath === "function" ? puppeteer.executablePath() : undefined;
  } catch (_error) {
    executablePath = undefined;
  }

  if (!executablePath || !fs.existsSync(executablePath)) {
    executablePath = findChromeInCache(cacheDir) || undefined;
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--incognito",
    ],
  });

  const wsEndpoint = browser.wsEndpoint();
  const browserPort = Number(new URL(wsEndpoint).port);

  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: browserPort,
  };

  try {
    const result = await lighthouse(url, options);
    return result.lhr.categories.performance.score * 100;
  } catch (error) {
    console.error(`Lighthouse Audit Error for ${url}:`, error);
    throw new Error(`Lighthouse audit failed: ${error.message || error}`);
  } finally {
    await browser.close();
  }
};
