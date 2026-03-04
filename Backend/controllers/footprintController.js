const footprintService = require('../services/footprintService');
const logger = require("../utils/logger"); // Import your logger module

exports.calculateFootprint = async (req, res) => {
  try {
    const { category } = req.params;
    const userData = req.body;

    logger.info(`Received footprint calculation request for category: ${category}`);

    if (!userData || Object.keys(userData).length === 0) {
      logger.warn(`Footprint request failed for ${category}: No data provided.`);
      return res.status(400).json({ success: false, message: 'No data provided.' });
    }

    const result = await footprintService.processFootprintData(userData, category);

    logger.info(`Successfully calculated footprint for ${category}. Footprint: ${result.footprint}`);
    res.status(200).json({ success: true, data: result });

  } catch (error) {
    logger.error(`Error in footprintController for category ${req.params.category}:`, {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ success: false, message: 'Server error while calculating footprint.' });
  }
};