const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

exports.runLighthouseAudit = async (url) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless=new', // Use new headless mode
      '--no-sandbox', // Required for some environments, especially Linux
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Recommended for Docker/CI environments
      '--disable-gpu', // Recommended for headless
      '--incognito' // Ensures a clean state
    ]
  });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    // Add a custom timeout if needed, e.g., 60 seconds (60000 ms)
    // formFactor: 'desktop', // Optional: specify form factor
    // screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 }, // Optional: specific screen size
  };

  try {
    const result = await lighthouse(url, options);
    return result.lhr.categories.performance.score * 100;
  } catch (error) {
    console.error(`Lighthouse Audit Error for ${url}:`, error);
    throw new Error(`Lighthouse audit failed: ${error.message || error}`);
  } finally {
    await chrome.kill(); // Ensure Chrome is always closed
  }
};