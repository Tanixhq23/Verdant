const puppeteer = require('puppeteer');

exports.scrapePageResources = async (url) => {
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--incognito'
    ]
  });
  const page = await browser.newPage();

  let resources = [];

  page.on('response', async (response) => {
    try { // Add try-catch block for response handling
      const request = response.request();
      const resUrl = request.url();
      const type = request.resourceType();
      const size = parseInt(response.headers()['content-length']) || 0;

      resources.push({ url: resUrl, type, size });
    } catch (e) {
      console.warn('Error processing response in scraperService:', e.message);
    }
  });

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000 // Increase timeout to 60 seconds
    });
  } catch (error) {
    console.error(`Error navigating to ${url} in scraperService:`, error);
    // Continue even if navigation fails to return partial resources or a clear error
    // Or re-throw if you want to explicitly fail the audit on navigation failure
    throw new Error(`Failed to load page in scraper: ${error.message}`);
  } finally {
    await browser.close();
  }

  return resources;
};