exports.runLighthouseAudit = async (url) => {
  const { default: lighthouse } = await import("lighthouse");
  const puppeteerModule = await import("puppeteer");
  const puppeteer = puppeteerModule.default || puppeteerModule;

  const browser = await puppeteer.launch({
    headless: true,
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
