const genAIUtil = require('../utils/genAIUtil');
const Footprint = require('../models/Footprint'); // Assuming you created this new model

exports.processFootprintData = async (userData, category) => {
  // 1. Get the analysis from the Gen AI model
  const aiAnalysis = await genAIUtil.getFootprintAnalysis(userData, category);

  // 2. Prepare the record for the database
  const footprintRecord = {
    category: category,
    userInput: userData,
    calculatedFootprintKg: aiAnalysis.carbonFootprintKg,
    aiSuggestions: aiAnalysis.suggestions,
  };

  // 3. Save to the database
  const newEntry = new Footprint(footprintRecord);
  await newEntry.save();

  // 4. Return the result to the controller
  return {
    footprint: aiAnalysis.carbonFootprintKg,
    suggestions: aiAnalysis.suggestions,
  };
};