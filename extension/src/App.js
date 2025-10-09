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
  Chip,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  Switch,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup as FilterToggle,
  ToggleButton as FilterButton
} from '@mui/material';
import { 
  KeyboardArrowDown, 
  MoreVert, 
  Person, 
  Notifications, 
  Visibility, 
  Security, 
  Help, 
  Info,
  Search,
  ArrowBack,
  ExpandMore,
  PowerSettingsNew
} from '@mui/icons-material';

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

// Mock data for fallback when API is not available
const getMockActivityLogs = () => [
  {
    id: 1,
    title: 'GitHub - Repository',
    url: 'github.com/user/repo',
    duration: '2h 15m',
    date: new Date().toISOString().split('T')[0],
    productive: true,
    timestamp: new Date()
  },
  {
    id: 2,
    title: 'YouTube - Video',
    url: 'youtube.com/watch',
    duration: '45m',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    productive: false,
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    title: 'Stack Overflow',
    url: 'stackoverflow.com/question',
    duration: '1h 30m',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    productive: true,
    timestamp: new Date(Date.now() - 172800000)
  },
  {
    id: 4,
    title: 'Reddit - Discussion',
    url: 'reddit.com/r/programming',
    duration: '20m',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    productive: false,
    timestamp: new Date(Date.now() - 172800000)
  },
  {
    id: 5,
    title: 'Documentation',
    url: 'docs.example.com',
    duration: '3h 10m',
    date: new Date().toISOString().split('T')[0],
    productive: true,
    timestamp: new Date()
  }
];

// API connection placeholder
const fetchLogsFromMongo = async (dateRange) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/logs?dateRange=${dateRange}`);
    // const data = await response.json();
    // return data;
    
    // For now, return mock data
    console.log('Fetching logs for date range:', dateRange);
    return getMockActivityLogs();
  } catch (error) {
    console.error('Error fetching logs:', error);
    return getMockActivityLogs(); // Fallback to mock data
  }
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
    text: {
      primary: '#2c3e50', // Darker grey instead of black
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
      color: '#2c3e50',
      fontSize: '1.5rem', // Smaller for popup
    },
    h5: {
      fontSize: '1.1rem', // Smaller for popup
    },
    h6: {
      fontSize: '1rem', // Smaller for popup
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
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
  
  // Current date for reference - Use actual current date
  const [currentDate] = useState(new Date());
  
  // State for menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // New state variables for functionality
  const [isExtensionActive, setIsExtensionActive] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [productiveFilter, setProductiveFilter] = useState('all'); // 'all', 'productive', 'unproductive'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  // New handler functions for enhanced functionality
  const handleCheckboxChange = (index) => {
    setActivityLogs(prev => prev.map((log, i) => 
      i === index ? { ...log, productive: !log.productive } : log
    ));
    // TODO: Update backend when API is ready
  };

  const handleProductiveFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setProductiveFilter(newFilter);
    }
  };

  const filterLogs = () => {
    let filtered = activityLogs;

    // Filter by productive status
    if (productiveFilter !== 'all') {
      filtered = filtered.filter(log => 
        productiveFilter === 'productive' ? log.productive : !log.productive
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected date
    if (selectedDate) {
      if (view === 'Day') {
        filtered = filtered.filter(log => log.date === selectedDate);
      } else {
        // Week view - parse date range
        const [startDate, endDate] = selectedDate.split('_');
        filtered = filtered.filter(log => log.date >= startDate && log.date <= endDate);
      }
    }

    setFilteredLogs(filtered);
  };

  // Load activity logs
  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      const logs = await fetchLogsFromMongo(selectedDate || 'all');
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setActivityLogs(getMockActivityLogs());
    } finally {
      setLoading(false);
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

  // Load activity logs when component mounts or date changes
  useEffect(() => {
    if (isExtensionActive) {
      loadActivityLogs();
    }
  }, [selectedDate, isExtensionActive]);

  // Filter logs when filters change
  useEffect(() => {
    filterLogs();
  }, [activityLogs, productiveFilter, searchQuery, selectedDate, view]);

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
        width: '450px',
        height: '600px',
    display: 'flex',
    flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Header with Title, Toggle, and Menu */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          px: 2,
          py: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isExtensionActive}
              onChange={(e) => setIsExtensionActive(e.target.checked)}
              color="primary"
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {isExtensionActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
          <Typography 
            variant="h3" 
            component="h1" 
            color="text.primary" 
            sx={{ 
              m: 0,
              fontWeight: 600,
              color: '#2c3e50',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}
          >
            Productivv
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={(event) => setAnchorEl(event.currentTarget)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2c3e50'
              }}
            >
              <MoreVert />
            </button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => { setActiveTab('Home'); setAnchorEl(null); }}>
                <ListItemIcon><FaHome /></ListItemIcon>
                <ListItemText>Home</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setActiveTab('Logs'); setAnchorEl(null); }}>
                <ListItemIcon><FaClock /></ListItemIcon>
                <ListItemText>Logs</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { setActiveTab('Settings'); setAnchorEl(null); }}>
                <ListItemIcon><FaCog /></ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Conditional Rendering Based on Active Tab */}
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflow: 'auto',
          opacity: isExtensionActive ? 1 : 0.5,
          transition: 'opacity 0.3s ease'
        }}>
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
            <Box>
              <Typography variant="h5" component="h2" color="text.primary" sx={{ mb: 2, fontWeight: 600 }}>
                Activity Logs
              </Typography>
              
              {/* Search and Filter Controls */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ minWidth: 150, flex: 1 }}
                />
                <FilterToggle
                  value={productiveFilter}
                  exclusive
                  onChange={handleProductiveFilterChange}
                  size="small"
                >
                  <FilterButton value="all">All</FilterButton>
                  <FilterButton value="productive">Productive</FilterButton>
                  <FilterButton value="unproductive">Unproductive</FilterButton>
                </FilterToggle>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: 2, maxHeight: 300 }}>
                <Table stickyHeader aria-label="activity logs table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>URL</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Productive</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            {isExtensionActive ? 'No logs found' : 'Extension is inactive'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <TableRow key={log.id}>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{log.title}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {log.url}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{log.duration}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            {new Date(log.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Checkbox 
                              checked={log.productive} 
                              onChange={() => handleCheckboxChange(index)}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 'Settings' && (
            <Box>
              {/* Settings Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <button
                  onClick={() => setActiveTab('Home')}
                  style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer',
                    padding: '8px',
                    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
                    color: '#2c3e50'
                  }}
                >
                  <ArrowBack />
                </button>
                <Typography variant="h5" component="h2" color="text.primary" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
              </Box>

              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search for a setting..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#bdbdbd',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0988b1',
                      },
                    },
                  }}
                />
              </Box>

              {/* Settings Accordions */}
              <Box sx={{ '& .MuiAccordion-root': { boxShadow: 1, mb: 1 } }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Account
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Email"
                        defaultValue="user@example.com"
                        size="small"
                        disabled
                      />
                      <TextField
                        label="Display Name"
                        defaultValue="Productivv User"
                        size="small"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Notifications color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Notifications
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Email Alerts</Typography>
                        <Switch size="small" defaultChecked />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Desktop Notifications</Typography>
                        <Switch size="small" />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Visibility color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Appearance
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl size="small">
                        <InputLabel>Theme</InputLabel>
                        <Select defaultValue="light" label="Theme">
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Privacy & Security
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Data Collection</Typography>
                        <Switch size="small" defaultChecked />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Analytics</Typography>
                        <Switch size="small" />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Help color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Help and Support
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Need help? Contact us at support@productivv.com
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        About
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">Productivv v1.0.0</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Productivity tracking extension
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Navigation */}
        <Box sx={{
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
          p: 0.5,
    borderTop: '1px solid #ddd',
    width: '100%',
        }}>
          <button
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: activeTab === 'Home' ? '#0988b1' : '#777',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 0',
              fontWeight: activeTab === 'Home' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Home')}
          >
            <FaHome size={16} /> <span style={{ fontSize: '0.75rem' }}>Home</span>
          </button>
          <button
            style={{
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
              color: activeTab === 'Logs' ? '#0988b1' : '#777',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px 0',
              fontWeight: activeTab === 'Logs' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Logs')}
          >
            <FaClock size={16} /> <span style={{ fontSize: '0.75rem' }}>Logs</span>
          </button>
          <button
            style={{
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
              color: activeTab === 'Settings' ? '#0988b1' : '#777',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px 0',
              fontWeight: activeTab === 'Settings' ? 'bold' : 'normal',
            }}
            onClick={() => setActiveTab('Settings')}
          >
            <FaCog size={16} /> <span style={{ fontSize: '0.75rem' }}>Settings</span>
          </button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
