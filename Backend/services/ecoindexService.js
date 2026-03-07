const axios = require("axios");
const { checkGreenHosting } = require("./hostingService");

function buildUnknownCarbonResult(greenHost = null) {
  return {
    co2PerVisit: null,
    cleanerThan: "Unknown",
    greenHost,
    estimationMethod: "unavailable",
  };
}

function estimateCarbonFromBytes(siteBytes, greenHost) {
  const bytes = Number(siteBytes);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return buildUnknownCarbonResult(greenHost);
  }

  const transferMB = bytes / (1024 * 1024);

  // Coarse fallback when the upstream WebsiteCarbon endpoint blocks the request.
  const gramsPerVisit = transferMB * (greenHost ? 0.6 : 1.0);

  return {
    co2PerVisit: Number(gramsPerVisit.toFixed(4)),
    cleanerThan: "Estimated",
    greenHost,
    estimationMethod: "bytes-fallback",
  };
}

async function getSiteBytes(url) {
  try {
    const headResponse = await axios.head(url, {
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const contentLength = parseInt(headResponse.headers["content-length"], 10);
    if (Number.isFinite(contentLength) && contentLength > 0) {
      return contentLength;
    }
  } catch (_error) {
    // Fall through to GET fallback.
  }

  const getResponse = await axios.get(url, {
    timeout: 20000,
    maxRedirects: 5,
    responseType: "arraybuffer",
    validateStatus: (status) => status >= 200 && status < 400,
  });

  return Buffer.byteLength(Buffer.from(getResponse.data));
}

exports.runEcoIndexAnalysis = async (url) => {
  let siteBytes = 0;
  let greenHost = null;

  try {
    try {
      greenHost = await checkGreenHosting(url);
    } catch (hostingError) {
      console.warn(`Green hosting lookup failed for ${url}:`, hostingError.message);
      greenHost = null;
    }

    siteBytes = await getSiteBytes(url);
    if (!Number.isFinite(siteBytes) || siteBytes <= 0) {
      return buildUnknownCarbonResult(greenHost);
    }

    try {
      const carbonApiResponse = await axios.get(
        `https://api.websitecarbon.com/data?bytes=${siteBytes}&green=${greenHost ? 1 : 0}`,
        {
          timeout: 15000,
          validateStatus: (status) => status >= 200 && status < 400,
        }
      );
      const data = carbonApiResponse.data;

      return {
        co2PerVisit: data?.statistics?.co2?.grid?.grams ?? null,
        cleanerThan:
          typeof data?.cleanerThan === "number"
            ? `${(data.cleanerThan * 100).toFixed(2)}%`
            : "Unknown",
        greenHost: typeof data?.green === "boolean" ? data.green : greenHost,
        estimationMethod: "websitecarbon",
      };
    } catch (carbonError) {
      console.warn(`WebsiteCarbon blocked or failed for ${url}:`, carbonError.message);
      return estimateCarbonFromBytes(siteBytes, greenHost);
    }
  } catch (error) {
    console.error(`WebsiteCarbon API or site fetch Error for ${url}:`, error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return estimateCarbonFromBytes(siteBytes, greenHost);
  }
};
