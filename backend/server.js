require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Activity = require('./models/Activity');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 5001;


// prompt
const analyzewithAI = async(title,url)=>{
  try {
    const prompt = `Analyze the following website visit and classify it as 'productive' or unproductive. 
    Context: A software engineer trying to stay focused. 
    URL: ${url},
    Page Title: ${title},
    Return ONly the string "productive" or "unproductive".
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages:[{role: "user", content: prompt}],
      max_tokens: 10,
    });
    const answer = response.choices[0].message.content.trim().toLowerCase();

    if (answer.includes("unproductive")){
      return 'unproductive';
    }
    if (answer.includes("productive")){
      return 'productive';
    }
    return 'neutral';
    
    
  } catch (error) {
    console.error("OpenAI API error: ", error);
    return 'neutral';
    
  }
}
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

// Helper: Extract domain from URL
const getDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
};

// Auto Categorization 
const productive_domains = new Set(['github.com','stackoverflow.com',
  'docs.python.org',
  'w3schools.com',
  'developer.mozilla.org',
  'trello.com',
  'jira.com',
  'notion.so',
  'calendar.google.com',
  'mail.google.com']);

const unproductive_domains = new Set(['youtube.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'netflix.com',
  'hulu.com',
  'twitch.tv']);


  const categorizeURL = (url)=>{
    const domain = getDomain(url);
    
    if (productive_domains.has(domain)){
      return 'productive';
    }
    else if (unproductive_domains.has(domain)){
      return "unproductive";
    }

    return 'unproductive';
  };



// API Routes

// 1. Save a new activity log (with accumulation logic by DOMAIN)
app.post('/api/activity', async (req, res) => {
  try {

    const {url, title, duration, timestamp,category} = req.body;
    let {productivity} = req.body;
    const domain = getDomain(url);

    // here we'll do three different tier checks. this is for url categorization
    // tier 1: first check if url is in the constants. (to be updated later)

    if (!productivity || productivity === 'neutral'){
      if (productive_domains.has(domain)){
        productivity = "productive"
      }
      else if (unproductive_domains.has(domain)){
        productivity = "unproductive"
      }
    }

    // tier 2: check if the URL as been logged before in the Database.

    if (!productivity || productivity == 'neutral'){
      const existingLog = await Activity.findOne({
        url: url,
        productivity:{ $in: ['productive', 'unproductive']}
      });
      if (existingLog){
        productivity = existingLog.productivity;
      }
    }

    // tier 3: AI analysis, send the url, title, and text from the website to openAI to determine productivity. Store in Database afterwrds.
    if (!productivity){
      productivity = "neutral";
    }


    const logDate = new Date(timestamp);
    
    // Find the most recent log with the same DOMAIN
    // Changed from 'title' to 'domain' based on user request
    const lastLog = await Activity.findOne({ domain }).sort({ timestamp: -1 });

    if (lastLog) {
      const lastLogEnd = new Date(lastLog.timestamp).getTime() + (lastLog.duration * 1000);
      const newLogStart = logDate.getTime();
      // 5 minutes in milliseconds
      const fiveMinutes = 5 * 60 * 1000;

      // Check if the new log starts within 5 minutes of the last log ending, and is not overlapping/reversed
      if (newLogStart - lastLogEnd >= 0 && newLogStart - lastLogEnd <= fiveMinutes) {
        // Accumulate duration
        lastLog.duration += duration;
        
        // Update metadata to the latest
        lastLog.productivity = productivity;
        lastLog.category = category;
        // Update title to latest visited page on that domain
        lastLog.title = title; 
        lastLog.url = url;
        
        await lastLog.save();
        return res.status(200).json({ message: 'Activity merged by domain', activity: lastLog });
      }
    }

    const activity = new Activity({
      url,
      domain, // Ensure domain is saved
      title,
      timestamp: logDate,
      duration,
      productivity,
      category
    });
    
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
    const { start, end } = req.query;
    let query = {};
    if (start && end) {
      query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
    }
    
    const activities = await Activity.find(query).sort({ timestamp: -1 });
    
    // Add productivityColor and remove URL from response
    const enhancedActivities = activities.map(act => {
      let color = '#9e9e9e'; // neutral/gray
      if (act.productivity === 'productive') color = '#10b981'; // green
      else if (act.productivity === 'unproductive') color = '#ef4444'; // red
      
      return {
        id: act._id,
        title: act.title,
        duration: act.duration,
        timestamp: act.timestamp,
        productivity: act.productivity,
        category: act.category,
        productivityColor: color
      };
    });

    res.json(enhancedActivities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Update activity status (Productive <-> Unproductive)
app.patch('/api/activity/:id', async (req, res) => {
  try {
    const { productivity } = req.body;
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { productivity },
      { new: true }
    );
    res.json(activity);
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Get aggregated stats
app.get('/api/stats', async (req, res) => {
  try {
    // Current time setup
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0,0,0,0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    // Aggregation Helper
    const getStats = async (start, end) => {
      const result = await Activity.aggregate([
        { $match: { timestamp: { $gte: start, $lt: end || new Date() } } },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: "$duration" },
            count: { $sum: 1 }
          }
        }
      ]);
      return result[0] || { totalDuration: 0, count: 0 };
    };

    const [today, yesterday, thisWeek, lastWeek, allTime] = await Promise.all([
      getStats(todayStart),
      getStats(yesterdayStart, todayStart),
      getStats(thisWeekStart),
      getStats(lastWeekStart, lastWeekEnd),
      Activity.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, // unique days
            dailyTotal: { $sum: "$duration" }
          }
        },
        {
          $group: {
            _id: null,
            uniqueDays: { $sum: 1 },
            grandTotal: { $sum: "$dailyTotal" }
          }
        }
      ])
    ]);

    // Calculate Percent Change
    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const dailyChange = calculateChange(today.totalDuration, yesterday.totalDuration);
    const weeklyChange = calculateChange(thisWeek.totalDuration, lastWeek.totalDuration);

    // Calculate Averages
    const uniqueDays = allTime[0]?.uniqueDays || 1;
    const uniqueWeeks = Math.max(1, Math.ceil(uniqueDays / 7));
    const grandTotal = allTime[0]?.grandTotal || 0;

    const dailyAverage = grandTotal / uniqueDays;
    const weeklyAverage = grandTotal / uniqueWeeks;

    // Return stats
    res.json({
      dailyChange,
      weeklyChange,
      dailyAverage,
      weeklyAverage,
    });

  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
