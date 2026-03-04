const axios = require('axios');

exports.runEcoIndexAnalysis = async (url) => {
    let siteBytes = 0;
    let isGreenHosted = 0; // Default to not green, or try to infer if possible

    try {
        // Step 1: Fetch the website to get its content length (bytes)
        // This is a simplified approach; getting accurate content size for dynamic sites is complex.
        // For real accuracy, you'd need to consider all assets (JS, CSS, images).
        const websiteResponse = await axios.head(url); // Use HEAD request to get headers without downloading full content
        siteBytes = parseInt(websiteResponse.headers['content-length'], 10);

        isGreenHosted = await checkIfGreenHost(url); 

        if (isNaN(siteBytes) || siteBytes <= 0) {
            console.warn(`Could not determine content length for ${url}. Skipping WebsiteCarbon API call.`);
            return {
                co2PerVisit: null,
                cleanerThan: 'Unknown',
                greenHost: null
            };
        }

        // Step 2: Call the WebsiteCarbon /data API with the calculated bytes and green status
        const carbonApiResponse = await axios.get(`https://api.websitecarbon.com/data?bytes=${siteBytes}&green=${isGreenHosted}`);
        const data = carbonApiResponse.data;

        // Note: The response structure for /data might be different.
        // Based on the image you shared, it seems to be: data.statistics.co2.grid.grams
        return {
            co2PerVisit: data.statistics.co2.grid.grams, // Corrected based on your previous image
            cleanerThan: (data.cleanerThan * 100).toFixed(2) + '%',
            greenHost: data.green // This 'green' property might still exist at the top level, or within statistics
        };

    } catch (error) {
        console.error(`WebsiteCarbon API or site fetch Error for ${url}:`, error.message);
        // Log the full error to understand if it's a 401, 404, etc.
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return {
            co2PerVisit: null,
            cleanerThan: 'Unknown',
            greenHost: null
        };
    }
};

async function checkIfGreenHost(url) {
    return 0; // 0 for false, 1 for true
}