const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  url: String,
  domain: String, // Added for duplicate merging logic
  title: String,
  timestamp: { type: Date, default: Date.now },
  duration: Number, // in seconds
  productivity: { type: String, enum: ['productive', 'unproductive', 'neutral'], default: 'neutral' },
  category: String,
  userId: String // optional for now
});

module.exports = mongoose.model('Activity', activitySchema);
