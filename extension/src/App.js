import React, { useState, useEffect } from 'react';
import { FaHome, FaClock, FaCog, FaChevronDown } from 'react-icons/fa'; // Icons for the tabs
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

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

const App = () => {
  // State to track the selected tab
  const [activeTab, setActiveTab] = useState('Home');

  // State to track the selected view (Day/Week) on Home tab
  const [view, setView] = useState('Week');
  
  // State for time tracking data
  const [timeData, setTimeData] = useState({});
  
  // State to track selected date/date range
  const [selectedDate, setSelectedDate] = useState('');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
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
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>Productivv</h1>
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      <div style={styles.content}>
        {activeTab === 'Home' && (
          <>
            <div style={styles.topRow}>
              <div style={styles.toggleWrapper}>
                <div
                  style={{
                    ...styles.slider,
                    transform: view === 'Day' ? 'translateX(0)' : 'translateX(100%)',
                  }}
                />
                <button style={styles.toggleButton} onClick={() => {
                  setView('Day');
                  setSelectedDate(formatDate(currentDate));
                  setShowDateDropdown(false);
                }}>
                  Day
                </button>
                <button style={styles.toggleButton} onClick={() => {
                  setView('Week');
                  const { startOfWeek, endOfWeek } = getWeekDates(currentDate);
                  setSelectedDate(formatDateRange(startOfWeek, endOfWeek));
                  setShowDateDropdown(false);
                }}>
                  Week
                </button>
              </div>
              <p style={styles.viewText}>Current View: {view}</p>
            </div>
            
            {/* Date Dropdown */}
            <div style={styles.dateDropdownContainer}>
              <button 
                style={styles.dateDropdownButton}
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                {selectedDate}
                <FaChevronDown style={styles.dropdownIcon} />
              </button>
              {showDateDropdown && (
                <div style={styles.dropdownMenu}>
                  {view === 'Week' ? (
                    getWeekOptions(currentDate).map((option, index) => (
                      <div 
                        key={index}
                        style={styles.dropdownItem} 
                        onClick={() => {
                          setSelectedDate(option.label);
                          setShowDateDropdown(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))
                  ) : (
                    getDayOptions(currentDate).map((option, index) => (
                      <div 
                        key={index}
                        style={styles.dropdownItem} 
                        onClick={() => {
                          setSelectedDate(option.label);
                          setShowDateDropdown(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Chart Section */}
            <div style={styles.chartContainer}>
              <div style={styles.chartHeader}>
                <div style={styles.chartTitle}>Time Usage</div>
                <div style={styles.chartSubtitle}>{formatTime(totalTime)}</div>
                <div style={styles.comparisonBadge}>
                  <span style={styles.arrow}>{percentageChange >= 0 ? '↗' : '↘'}</span> 
                  {Math.abs(percentageChange)}% from last {view.toLowerCase()}
                </div>
              </div>
              
              <div style={styles.rechartsContainer}>
                <ResponsiveContainer width="100%" height={300}>
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
                      fill="#e0e0e0" 
                      radius={[2, 2, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Logs' && <p style={styles.placeholderText}>Previous Logs (Coming Soon)</p>}

        {activeTab === 'Settings' && <p style={styles.placeholderText}>Settings (Coming Soon)</p>}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.navbar}>
        <button
          style={activeTab === 'Home' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('Home')}
        >
          <FaHome /> <span>Home</span>
        </button>
        <button
          style={activeTab === 'Logs' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('Logs')}
        >
          <FaClock /> <span>Logs</span>
        </button>
        <button
          style={activeTab === 'Settings' ? styles.activeNavButton : styles.navButton}
          onClick={() => setActiveTab('Settings')}
        >
          <FaCog /> <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8fdff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Ensures navbar stays at the bottom
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    margin: '0',
    color: '#36494f',
  },
  content: {
    flex: 1, // Pushes navbar to bottom
    padding: '20px',
  },
  toggleWrapper: {
    display: 'flex',
    position: 'relative',
    width: '150px',
    height: '40px',
    backgroundColor: '#f1f1f1',
    borderRadius: '25px',
    overflow: 'hidden',
    boxShadow: '0 0 3px rgba(0,0,0,0.2)',
  },
  slider: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: '#0988b1',
    borderRadius: '25px',
    transition: 'transform 0.3s ease',
  },
  toggleButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 1,
    color: '#333',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  viewText: {
    fontSize: '1rem',
    color: '#36494f',
    margin: 0,
  },
  dateDropdownContainer: {
    position: 'relative',
    marginBottom: '30px',
  },
  dateDropdownButton: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '1rem',
    color: '#36494f',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  dropdownIcon: {
    fontSize: '0.8rem',
    color: '#666',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#36494f',
    borderBottom: '1px solid #f0f0f0',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '400px', // Make it more square-shaped
    margin: '0 auto 20px auto',
  },
  rechartsContainer: {
    width: '100%',
    height: '300px', // Increased height for more square appearance
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#36494f',
  },
  chartSubtitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#36494f',
  },
  comparisonBadge: {
    backgroundColor: '#f0f8ff',
    color: '#0988b1',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  arrow: {
    fontSize: '0.7rem',
  },
  placeholderText: {
    fontSize: '1.2rem',
    color: '#777',
    textAlign: 'center',
    marginTop: '50px',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    padding: '10px 0',
    borderTop: '1px solid #ddd',
    position: 'fixed',
    bottom: 0,
    width: '100%',
  },
  navButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#777',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
  },
  activeNavButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#0988b1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 0',
    fontWeight: 'bold',
  },
};

export default App;
