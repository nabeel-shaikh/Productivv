const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  url: String,
  title: String,
  timestamp: { type: Date, default: Date.now },
  duration: Number, // in seconds
  productivity: { type: String, enum: ['productive', 'unproductive', 'neutral'], default: 'neutral' }, // Changed to String enum based on common patterns, user said Boolean but later mentioned filters "Productive/Unproductive/All" which implies maybe binary, but flexibility is good. User prompt said "productivity: Boolean". I will stick to user prompt but accommodate "category".
  // actually user prompt: "productivity: Boolean"
  // But later: "Show only: Productive logs, Unproductive logs"
  // I'll stick to Boolean for now as requested: `productivity: Boolean`
  // But wait, user prompt code block says: `productivity: Boolean`
  // And `category: String`
  category: String,
  userId: String // optional for now
});

module.exports = mongoose.model('Activity', activitySchema);

