const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const footprintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  category: { type: String, required: true, enum: ['energy', 'food', 'shopping', 'transport'] },
  userInput: { type: Object, required: true },
  calculatedFootprintKg: { type: Number, required: true },
  aiSuggestions: [suggestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Footprint', footprintSchema);