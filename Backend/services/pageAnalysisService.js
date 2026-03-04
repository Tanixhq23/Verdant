const puppeteer = require('puppeteer');

exports.scrapeDetailedPageData = async (url) => {
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
      console.warn('Error processing response in pageAnalysisService:', e.message);
    }
  });

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000 // Increase timeout to 60 seconds
    });

    const domData = await page.evaluate(() => {
      return {
        totalScripts: document.scripts.length,
        externalScripts: Array.from(document.scripts).filter(s => s.src).length,
        inlineScripts: Array.from(document.scripts).filter(s => !s.src).length,
        stylesheets: Array.from(document.styleSheets).length,
        inlineStyles: document.querySelectorAll('style').length,
        imagesWithoutLazy: Array.from(document.images).filter(img => !img.loading).length,
        iframes: document.querySelectorAll('iframe').length,
        fonts: Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).length,
        domNodes: document.getElementsByTagName('*').length
      };
    });
    return { resources, domData };

  } catch (error) {
    console.error(`Error navigating to ${url} in pageAnalysisService:`, error);
    throw new Error(`Failed to load page for detailed analysis: ${error.message}`);
  } finally {
    await browser.close();
  }
};

exports.breakdownResources = (resources) => {
  const totals = {
    js: 0,
    css: 0,
    images: 0,
    fonts: 0,
    videos: 0,
    others: 0
  };

  resources.forEach(r => {
    if (r.url.match(/\.js(\?|$)/)) totals.js += r.size;
    else if (r.url.match(/\.css(\?|$)/)) totals.css += r.size;
    else if (r.url.match(/\.(png|jpg|jpeg|gif|webp)(\?|$)/)) totals.images += r.size;
    else if (r.url.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) totals.fonts += r.size;
    else if (r.url.match(/\.(mp4|webm|ogg)(\?|$)/)) totals.videos += r.size;
    else totals.others += r.size;
  });

  return totals;
};