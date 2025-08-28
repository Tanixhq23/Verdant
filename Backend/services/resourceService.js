const puppeteer = require('puppeteer');

exports.analyzeResources = async (url) => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  let totalSize = 0;
  let requests = 0;

  page.on('response', async (res) => {
    const size = parseInt(res.headers()['content-length']) || 0;
    totalSize += size;
    requests++;
  });

  await page.goto(url, { waitUntil: 'networkidle2' });
  await browser.close();

  return {
    totalRequests: requests,
    pageSize: (totalSize / (1024 * 1024)).toFixed(2)
  };
};