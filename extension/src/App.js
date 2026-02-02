import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  ThemeProvider, 
  createTheme, 
  ToggleButton, 
  ToggleButtonGroup, 
  Select, 
  MenuItem, 
  FormControl, 
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
  Switch,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup as FilterToggle,
  ToggleButton as FilterButton,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Stack,
  Grid
} from '@mui/material';
import { 
  MoreVert, 
  Search, 
  ExpandMore, 
  HomeRounded, 
  AccessTimeFilledRounded, 
  SettingsRounded, 
  CheckCircleRounded, 
  CancelRounded, 
  TrendingUp, 
  TrendingDown,
  ArrowForwardRounded 
} from '@mui/icons-material';
import { 
  SiPython, SiJavascript, SiOpenjdk, SiPostgresql, 
  SiHtml5, SiCss3, SiCplusplus, SiPhp, SiMicrosoft 
} from 'react-icons/si';

/*
 * Productivv - Dynamic Time Tracking App
 */

// --- Scroll Reveal Component ---
const ScrollReveal = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={domRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      {children}
    </Box>
  );
};

// --- Project Card Component ---
const ProjectCard = ({ title, tech, description, link, screenshot }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        overflow: 'hidden', 
        position: 'relative', 
        border: '1px solid #e2e8f0',
        transition: '0.3s',
        '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ position: 'relative', height: 160, bgcolor: '#f8fafc' }}>
        {screenshot ? (
          <img src={screenshot} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <Typography variant="body2">Preview Image</Typography>
          </Box>
        )}
        {isHovered && (
          <Box sx={{ 
            position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(3px)', transition: '0.3s'
          }}>
            <IconButton 
              component="a"
              href={link}
              target="_blank"
              sx={{ 
                bgcolor: 'white', 
                color: 'text.primary',
                px: 3,
                py: 1.5,
                borderRadius: 20,
                fontSize: '0.875rem',
                fontWeight: 700,
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'white',
                  color: 'primary.main', // NOT white on hover
                }
              }}
            >
              View Code
            </IconButton>
          </Box>
        )}
      </Box>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight="800" color="text.primary" sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {tech}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.6, mb: 2 }}>
          {description}
        </Typography>
        <Box component="a" href={link} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', '&:hover': { textDecoration: 'underline' } }}>
          View on GitHub <ArrowForwardRounded sx={{ fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// --- Utility Functions ---

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
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateValue = `${year}-${month}-${day}`;

    options.push({
      value: localDateValue,
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
    
    const sYear = startOfWeek.getFullYear();
    const sMonth = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const sDay = String(startOfWeek.getDate()).padStart(2, '0');
    const startStr = `${sYear}-${sMonth}-${sDay}`;

    const eYear = endOfWeek.getFullYear();
    const eMonth = String(endOfWeek.getMonth() + 1).padStart(2, '0');
    const eDay = String(endOfWeek.getDate()).padStart(2, '0');
    const endStr = `${eYear}-${eMonth}-${eDay}`;

    options.push({
      value: `${startStr}_${endStr}`,
      label: formatDateRange(startOfWeek, endOfWeek)
    });
  }
  return options;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// --- API Calls ---

const fetchLogsFromMongo = async (dateRange) => {
  try {
    let url = 'http://localhost:5001/api/activity';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    return data.map((item, index) => {
      const localDate = new Date(item.timestamp).toLocaleDateString('en-CA'); 
      return {
        id: item.id || index,
        title: item.title || 'No Title',
        duration: formatDuration(item.duration), 
        rawDuration: item.duration,
        date: localDate, 
        productive: item.productivity === 'productive',
        productivityColor: item.productivityColor, 
        timestamp: new Date(item.timestamp),
        category: item.category
      };
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return []; 
  }
};

const fetchStatsFromBackend = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/stats');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return [];
  }
};

// --- Theme ---

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1e40af' },
    secondary: { main: '#64748b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    success: { main: '#10b981' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', padding: '4px 12px', '&.Mui-selected': { backgroundColor: '#eff6ff', color: '#2563eb' } } } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid #f1f5f9', padding: '12px 16px' }, head: { backgroundColor: '#f8fafc', fontWeight: 600, color: '#475569' } } },
    MuiBottomNavigation: { styleOverrides: { root: { borderTop: '1px solid #e2e8f0', height: 64 } } },
    MuiBottomNavigationAction: { styleOverrides: { root: { '&.Mui-selected': { color: '#2563eb' } } } },
  },
});

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const productive = payload.find(p => p.name === 'Productive')?.value || 0;
    const unproductive = payload.find(p => p.name === 'Unproductive')?.value || 0;
    const neutral = payload.find(p => p.name === 'Neutral')?.value || 0;
    const total = productive + unproductive + neutral;
    const prodPercent = total > 0 ? Math.round((productive / total) * 100) : 0;

    return (
      <Paper sx={{ p: 1.5, border: '1px solid #e2e8f0', boxShadow: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="body2">Productive: <b>{formatDuration(productive * 3600)}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9ca3af' }} />
            <Typography variant="body2">Neutral: <b>{formatDuration(neutral * 3600)}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="body2">Unproductive: <b>{formatDuration(unproductive * 3600)}</b></Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          Productivity Score: {prodPercent}%
        </Typography>
      </Paper>
    );
  }
  return null;
};

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [view, setView] = useState('Week');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isExtensionActive, setIsExtensionActive] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState([]); 
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [productiveFilter, setProductiveFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for Column Widths
  const [colWidths, setColWidths] = useState({ status: 50, activity: 200, time: 80 });
  const [resizing, setResizing] = useState(null);

  // Simple resize handler
  const handleMouseDown = (e, col) => {
    setResizing({ col, startX: e.clientX, startWidth: colWidths[col] });
  };

  const handleMouseMove = (e) => {
    if (resizing) {
      const diff = e.clientX - resizing.startX;
      setColWidths(prev => ({
        ...prev,
        [resizing.col]: Math.max(50, resizing.startWidth + diff)
      }));
    }
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const handleProductiveFilterChange = (event, newFilter) => {
    if (newFilter !== null) setProductiveFilter(newFilter);
  };

  // Handle status toggle with Backend Persistence
  const handleStatusToggle = async (id, currentProductiveState) => {
    // Calculate new status string for backend
    const newStatus = currentProductiveState ? 'unproductive' : 'productive';
    
    // Optimistic UI update
    setActivityLogs(prev => prev.map(log => 
      log.id === id ? { 
        ...log, 
        productive: !currentProductiveState,
        productivityColor: !currentProductiveState ? '#10b981' : '#ef4444'
      } : log
    ));

    try {
      await fetch(`http://localhost:5001/api/activity/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productivity: newStatus })
      });
      // Refresh logs to ensure sync
      loadActivityLogs();
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error (could be improved)
      loadActivityLogs();
    }
  };

  const filterLogs = () => {
    let filtered = activityLogs;
    if (productiveFilter !== 'all') {
      filtered = filtered.filter(log => 
        productiveFilter === 'productive' ? log.productive : !log.productive
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedDate) {
      if (view === 'Day') {
        filtered = filtered.filter(log => log.date === selectedDate);
      } else {
        const [startDate, endDate] = selectedDate.split('_');
        filtered = filtered.filter(log => log.date >= startDate && log.date <= endDate);
      }
    }
    
    // Aggregate logs by title + date
    const aggregated = {};
    filtered.forEach(log => {
      const key = `${log.title}_${log.date}`;
      if (aggregated[key]) {
        aggregated[key].rawDuration += log.rawDuration || 0;
        aggregated[key].duration = formatDuration(aggregated[key].rawDuration);
      } else {
        aggregated[key] = { 
          ...log, 
          rawDuration: log.rawDuration || 0,
          duration: formatDuration(log.rawDuration || 0)
        };
      }
    });
    
    setFilteredLogs(Object.values(aggregated));
  };

  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      const logs = await fetchLogsFromMongo(selectedDate || 'all');
      setActivityLogs(logs);
      const backendStats = await fetchStatsFromBackend();
      setStats(backendStats);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['isExtensionActive'], (result) => {
        if (result.isExtensionActive !== undefined) {
          setIsExtensionActive(result.isExtensionActive);
        }
      });
    }
  }, []);

  const handleActiveChange = (e) => {
    const checked = e.target.checked;
    setIsExtensionActive(checked);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ isExtensionActive: checked });
    }
  };

  useEffect(() => {
    if (view === 'Week') {
      const { startOfWeek, endOfWeek } = getWeekDates(currentDate);
      const sYear = startOfWeek.getFullYear();
      const sMonth = String(startOfWeek.getMonth() + 1).padStart(2, '0');
      const sDay = String(startOfWeek.getDate()).padStart(2, '0');
      const startStr = `${sYear}-${sMonth}-${sDay}`;

      const eYear = endOfWeek.getFullYear();
      const eMonth = String(endOfWeek.getMonth() + 1).padStart(2, '0');
      const eDay = String(endOfWeek.getDate()).padStart(2, '0');
      const endStr = `${eYear}-${eMonth}-${eDay}`;
      
      setSelectedDate(`${startStr}_${endStr}`);
    } else {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    }
  }, [view, currentDate]);

  useEffect(() => {
    if (isExtensionActive) {
      loadActivityLogs();
    }
  }, [selectedDate, isExtensionActive]);

  useEffect(() => {
    filterLogs();
  }, [activityLogs, productiveFilter, searchQuery, selectedDate, view]);

  const getChartData = () => {
    if (view === 'Week') {
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const data = days.map(d => ({ day: d, productive: 0, neutral: 0, unproductive: 0, total: 0 }));
      
      filteredLogs.forEach(log => {
        if (!log.timestamp) return;
        const dayIndex = log.timestamp.getDay();
        const durationHours = (log.rawDuration || 0) / 3600;
        
        if (log.productive) data[dayIndex].productive += durationHours;
        else data[dayIndex].unproductive += durationHours;
        
        data[dayIndex].total += durationHours;
      });
      return data;
    } else {
      const data = [{ day: 'Today', productive: 0, neutral: 0, unproductive: 0, total: 0 }];
      filteredLogs.forEach(log => {
        const durationHours = (log.rawDuration || 0) / 3600;
        if (log.productive) data[0].productive += durationHours;
        else data[0].unproductive += durationHours;
        data[0].total += durationHours;
      });
      return data;
    }
  };

  const chartData = getChartData();
  const totalTime = filteredLogs.reduce((acc, log) => acc + ((log.rawDuration || 0) / 3600), 0);
  const percentageChange = view === 'Week' ? (stats?.weeklyChange || 0) : (stats?.dailyChange || 0);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '450px', height: '600px', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
        
        {/* --- App Bar --- */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>P</Box>
            <Typography variant="h6" color="text.primary">Productivv</Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 20 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isExtensionActive ? '#10b981' : '#cbd5e1' }} />
              <Switch checked={isExtensionActive} onChange={handleActiveChange} size="small" sx={{ transform: 'scale(0.8)' }} />
            </Stack>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert fontSize="small" />
            </IconButton>
          </Stack>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} PaperProps={{ sx: { mt: 1, minWidth: 160, boxShadow: 3 } }}>
            <MenuItem onClick={() => { setActiveTab('Home'); setAnchorEl(null); }}><ListItemIcon><HomeRounded fontSize="small" /></ListItemIcon><ListItemText>Home</ListItemText></MenuItem>
            <MenuItem onClick={() => { setActiveTab('Logs'); setAnchorEl(null); }}><ListItemIcon><AccessTimeFilledRounded fontSize="small" /></ListItemIcon><ListItemText>Logs</ListItemText></MenuItem>
            <MenuItem onClick={() => { setActiveTab('Settings'); setAnchorEl(null); }}><ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon><ListItemText>Settings</ListItemText></MenuItem>
          </Menu>
        </Box>

        {/* --- Main Content --- */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          
          {activeTab === 'Home' && (
            <Stack spacing={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <ToggleButtonGroup value={view} exclusive onChange={(e, newView) => newView && setView(newView)} fullWidth size="small">
                    <ToggleButton value="Day">Day</ToggleButton>
                    <ToggleButton value="Week">Week</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <Select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} displayEmpty sx={{ bgcolor: 'background.paper' }}>
                      {view === 'Week' ? getWeekOptions(currentDate).map((opt, i) => <MenuItem key={i} value={opt.value}>{opt.label}</MenuItem>) : getDayOptions(currentDate).map((opt, i) => <MenuItem key={i} value={opt.value}>{opt.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Card>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Total Time</Typography>
                      <Typography variant="h4" fontWeight="700" color="text.primary">{formatDuration(totalTime * 3600)}</Typography>
                    </Box>
                    <Chip icon={percentageChange >= 0 ? <TrendingUp /> : <TrendingDown />} label={`${Math.abs(percentageChange).toFixed(1)}%`} color={percentageChange >= 0 ? "success" : "error"} size="small" variant="soft" sx={{ bgcolor: percentageChange >= 0 ? '#ecfdf5' : '#fef2f2', color: percentageChange >= 0 ? '#059669' : '#dc2626' }} />
                  </Stack>
                  
                  <Box sx={{ height: 240, mt: 3, ml: -2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `${val}h`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        {/* Side-by-side bars: Remove stackId */}
                        <Bar dataKey="productive" name="Productive" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="neutral" name="Neutral" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="unproductive" name="Unproductive" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          )}

          {activeTab === 'Logs' && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField placeholder="Search activity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" fullWidth InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />, sx: { bgcolor: 'background.paper' } }} />
              </Stack>
              
              <FilterToggle value={productiveFilter} exclusive onChange={handleProductiveFilterChange} size="small" fullWidth>
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="productive">Productive</ToggleButton>
                <ToggleButton value="unproductive">Unproductive</ToggleButton>
              </FilterToggle>

              <Paper sx={{ overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 0 }}>
                <TableContainer sx={{ maxHeight: 340 }}>
                  <Table stickyHeader size="small" style={{ tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        {/* Resizable Headers */}
                        <TableCell 
                          width={colWidths.status}
                          sx={{ position: 'relative', '&:hover .resize-handle': { opacity: 1 } }}
                        >
                          Status
                          <Box
                            className="resize-handle"
                            onMouseDown={(e) => handleMouseDown(e, 'status')}
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              cursor: 'col-resize',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              bgcolor: 'primary.light'
                            }}
                          />
                        </TableCell>
                        <TableCell 
                          width={colWidths.activity}
                          sx={{ position: 'relative', '&:hover .resize-handle': { opacity: 1 } }}
                        >
                          Activity
                          <Box
                            className="resize-handle"
                            onMouseDown={(e) => handleMouseDown(e, 'activity')}
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              cursor: 'col-resize',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              bgcolor: 'primary.light'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" width={colWidths.time}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={3} align="center">Loading...</TableCell></TableRow>
                      ) : filteredLogs.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No logs found</TableCell></TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              <Checkbox 
                                checked={log.productive} 
                                onChange={() => handleStatusToggle(log.id, log.productive)}
                                icon={<CancelRounded sx={{ color: '#ef4444' }} />}
                                checkedIcon={<CheckCircleRounded sx={{ color: '#10b981' }} />}
                              />
                            </TableCell>
                            <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                {log.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.date}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="600" color="text.primary">
                                {log.duration}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Stack>
          )}

          {activeTab === 'Settings' && (
            <Stack spacing={2}>
              <Typography variant="h6">Settings</Typography>
              {['Account', 'Notifications', 'Appearance', 'Privacy'].map((setting) => (
                <Accordion key={setting} disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMore />}><Typography fontWeight="500">{setting}</Typography></AccordionSummary>
                  <AccordionDetails><Typography variant="body2" color="text.secondary">Settings for {setting} will appear here.</Typography></AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </Box>

        {/* --- Bottom Navigation --- */}
        <BottomNavigation value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)} showLabels elevation={3}>
          <BottomNavigationAction label="Home" value="Home" icon={<HomeRounded />} />
          <BottomNavigationAction label="Logs" value="Logs" icon={<AccessTimeFilledRounded />} />
          <BottomNavigationAction label="Settings" value="Settings" icon={<SettingsRounded />} />
        </BottomNavigation>

      </Box>
    </ThemeProvider>
  );
};

export default App;
