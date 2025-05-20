import React, { useState } from 'react';
import { FaHome, FaClock, FaCog } from 'react-icons/fa'; // Icons for the tabs

const App = () => {
  // State to track the selected tab
  const [activeTab, setActiveTab] = useState('Home');

  // State to track the selected view (Day/Week) on Home tab
  const [view, setView] = useState('Week');

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
            <div style={styles.toggleWrapper}>
              <div
                style={{
                  ...styles.slider,
                  transform: view === 'Day' ? 'translateX(0)' : 'translateX(100%)',
                }}
              />
              <button style={styles.toggleButton} onClick={() => setView('Day')}>
                Day
              </button>
              <button style={styles.toggleButton} onClick={() => setView('Week')}>
                Week
              </button>
            </div>
            <p style={styles.viewText}>Current View: {view}</p>
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
  viewText: {
    marginTop: '20px',
    fontSize: '1.2rem',
    textAlign: 'left',
    color: '#36494f',
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
