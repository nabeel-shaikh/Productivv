require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Activity = require('./models/Activity');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Basic route (for testing)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// API Routes

// 1. Save a new activity log
app.post('/api/activity', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json({ message: 'Activity saved', activity });
  } catch (err) {
    console.error('Error saving activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get all activity logs
app.get('/api/activity', async (req, res) => {
  try {
    // Support for date filtering if needed later (e.g. ?start=...&end=...)
    const { start, end } = req.query;
    let query = {};
    if (start && end) {
      query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
    }
    
    const activities = await Activity.find(query).sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get aggregated stats for graphs
app.get('/api/stats', async (req, res) => {
  try {
    // Aggregate total duration by category
    const stats = await Activity.aggregate([
      {
        $group: {
          _id: "$category",
          totalDuration: { $sum: "$duration" },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
