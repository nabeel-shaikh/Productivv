import React, { useState, useEffect } from 'react';
import { FaHome, FaClock, FaCog } from 'react-icons/fa'; // Icons for the tabs
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { 
  ThemeProvider, 
  createTheme, 
  ToggleButton, 
  ToggleButtonGroup, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

/*
 * Productivv - Dynamic Time Tracking App
 * 
 * Data Structure:
 * timeData = {
 *   "2024-01-15": {
 *     productive: 4.5,    // hours spent on productive sites
 *     neutral: 1.2,       // hours spent on neutral sites  
 *     unproductive: 2.1,  // hours spent on unproductive sites
 *     total: 7.8          // total hours
 *   }
 * }
 * 
 * Future Integration Points:
 * - Browser extension will call addTimeData() to update tracking
 * - AI classification will determine productive/neutral/unproductive categories
 * - MongoDB/API integration will replace localStorage persistence
 * - Real-time updates will trigger chart re-renders
 */

// Utility functions for date handling
const formatDate = (date) => {
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const formatDateRange = (startDate, endDate) => {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
};

const getWeekDates = (date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfWeek.setDate(diff);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return { startOfWeek, endOfWeek };
};

const getDayOptions = (currentDate) => {
  const options = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    options.push({
      value: date.toISOString().split('T')[0],
      label: formatDate(date)
    });
  }
  return options;
};

const getWeekOptions = (currentDate) => {
  const options = [];
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - (i * 7));
    const { startOfWeek, endOfWeek } = getWeekDates(date);
    options.push({
      value: `${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}`,
      label: formatDateRange(startOfWeek, endOfWeek)
    });
  }
  return options;
};

// Empty data structure - no data will be shown initially
const getEmptyData = () => {
  return {};
};

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0988b1',
    },
    secondary: {
      main: '#36494f',
    },
    background: {
      default: '#f8fdff',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

const App = () => {
  // State to track the selected tab
  const [activeTab, setActiveTab] = useState('Home');

  // State to track the selected view (Day/Week) on Home tab
  const [view, setView] = useState('Week');
  
  // State for time tracking data
  const [timeData, setTimeData] = useState({});
  
  // State to track selected date/date range
  const [selectedDate, setSelectedDate] = useState('');
  
  // Current date for reference - Set to September 24th, 2024 for demo
  const [currentDate] = useState(new Date('2024-09-24'));
  
  // Data persistence functions
  const saveTimeData = (data) => {
    try {
      localStorage.setItem('productivv_time_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save time data:', error);
    }
  };

  const loadTimeData = () => {
    try {
      const saved = localStorage.getItem('productivv_time_data');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load time data:', error);
      return null;
    }
  };

  // Function to add new time data (for future use with browser extension)
  const addTimeData = (date, productive, neutral, unproductive) => {
    const dateKey = date.toISOString().split('T')[0];
    const newData = {
      ...timeData,
      [dateKey]: {
        productive,
        neutral,
        unproductive,
        total: productive + neutral + unproductive
      }
    };
    setTimeData(newData);
    saveTimeData(newData);
  };

  // Function to export data for API/MongoDB integration
  const exportTimeData = () => {
    return {
      userId: 'current_user', // Will be dynamic in production
      data: timeData,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
  };

  // Function to import data from API/MongoDB
  const importTimeData = (apiData) => {
    if (apiData && apiData.data) {
      setTimeData(apiData.data);
      saveTimeData(apiData.data);
    }
  };

  // Initialize data and selected date
  useEffect(() => {
    // Start with empty data - no tracking data initially
    const emptyData = getEmptyData();
    setTimeData(emptyData);
    
    // Set initial selected date based on current view
    if (view === 'Week') {
      const { startOfWeek, endOfWeek } = getWeekDates(currentDate);
      setSelectedDate(formatDateRange(startOfWeek, endOfWeek));
    } else {
      setSelectedDate(formatDate(currentDate));
    }
  }, [view, currentDate]);

  // Get empty chart data structure for Recharts
  const getChartData = () => {
    if (view === 'Week') {
      // Return empty data structure for week view
      return [
        { day: 'S', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'M', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'T', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'W', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'T', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'F', productive: 0, neutral: 0, unproductive: 0, total: 0 },
        { day: 'S', productive: 0, neutral: 0, unproductive: 0, total: 0 }
      ];
    } else {
      // Return empty data structure for day view
      return [
        { day: 'T', productive: 0, neutral: 0, unproductive: 0, total: 0 }
      ];
    }
  };

  // Format time for display
  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const chartData = getChartData();
  const totalTime = 0; // No data initially
  const percentageChange = 0; // No comparison initially

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8fdff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" color="text.primary" sx={{ m: 0 }}>
            Productivv
          </Typography>
        </Box>

        {/* Conditional Rendering Based on Active Tab */}
        <Box sx={{ flex: 1, p: 2 }}>
          {activeTab === 'Home' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={(event, newView) => {
                    if (newView !== null) {
                      setView(newView);
                      if (newView === 'Day') {
                        setSelectedDate(formatDate(currentDate));
                      } else {
                        const { startOfWeek, endOfWeek } = getWeekDates(currentDate);
                        setSelectedDate(formatDateRange(startOfWeek, endOfWeek));
                      }
                    }
                  }}
                  aria-label="view selection"
                  sx={{
                    '& .MuiToggleButton-root': {
                      border: '1px solid #0988b1',
                      color: '#0988b1',
                      '&.Mui-selected': {
                        backgroundColor: '#0988b1',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#077a9e',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(9, 136, 177, 0.1)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="Day">Day</ToggleButton>
                  <ToggleButton value="Week">Week</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="body1" color="text.secondary">
                  Current View: {view}
                </Typography>
              </Box>
              
              {/* Date Dropdown */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="date-select-label">Select Date</InputLabel>
                  <Select
                    labelId="date-select-label"
                    value={selectedDate}
                    label="Select Date"
                    onChange={(event) => setSelectedDate(event.target.value)}
                    IconComponent={KeyboardArrowDown}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#0988b1',
                        },
                        '&:hover fieldset': {
                          borderColor: '#077a9e',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0988b1',
                        },
                      },
                    }}
                  >
                    {view === 'Week' ? (
                      getWeekOptions(currentDate).map((option, index) => (
                        <MenuItem key={index} value={option.label}>
                          {option.label}
                        </MenuItem>
                      ))
                    ) : (
                      getDayOptions(currentDate).map((option, index) => (
                        <MenuItem key={index} value={option.label}>
                          {option.label}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>

              {/* Chart Section */}
              <Card sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" color="text.primary">
                      Time Usage
                    </Typography>
                    <Typography variant="h5" component="div" color="primary" fontWeight="bold">
                      {formatTime(totalTime)}
                    </Typography>
                    <Chip
                      icon={<span>{percentageChange >= 0 ? '↗' : '↘'}</span>}
                      label={`${Math.abs(percentageChange)}% from last ${view.toLowerCase()}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#666' }}
                          domain={[0, 10]}
                          ticks={[0, 5, 10]}
                          tickFormatter={(value) => `${value}h`}
                        />
                        <ReferenceLine 
                          y={6} 
                          stroke="#333" 
                          strokeDasharray="5 5" 
                          label={{ value: "avg", position: "right", style: { fontSize: 10, fill: '#333' } }}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="#0988b1" 
                          radius={[2, 2, 0, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'Logs' && (
            <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 5 }}>
              Previous Logs (Coming Soon)
            </Typography>
          )}

          {activeTab === 'Settings' && (
            <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 5 }}>
              Settings (Coming Soon)
            </Typography>
          )}
        </Box>

        {/* Bottom Navigation */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          backgroundColor: '#ffffff',
          p: 1,
          borderTop: '1px solid #ddd',
          position: 'fixed',
          bottom: 0,
          width: '100%',
        }}>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              color: activeTab === 'Home' ? '#0988b1' : '#777',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 0',
              fontWeight: activeTab === 'Home' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Home')}
          >
            <FaHome /> <span>Home</span>
          </button>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              color: activeTab === 'Logs' ? '#0988b1' : '#777',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 0',
              fontWeight: activeTab === 'Logs' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Logs')}
          >
            <FaClock /> <span>Logs</span>
          </button>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              color: activeTab === 'Settings' ? '#0988b1' : '#777',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 0',
              fontWeight: activeTab === 'Settings' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Settings')}
          >
            <FaCog /> <span>Settings</span>
          </button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
