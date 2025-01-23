import React, { useState } from 'react';

const App = () => {
  // State to track the selected view
  const [view, setView] = useState('Week');

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>Productivv</h1>
      </div>

      {/* Toggle Button */}
      <div style={styles.toggleWrapper}>
        <div
          style={{
            ...styles.slider,
            transform: view === 'Day' ? 'translateX(0)' : 'translateX(100%)',
          }}
        />
        <button
          style={styles.toggleButton}
          onClick={() => setView('Day')}
        >
          Day
        </button>
        <button
          style={styles.toggleButton}
          onClick={() => setView('Week')}
        >
          Week
        </button>
      </div>

      {/* Display the selected view */}
      <p style={styles.viewText}>Current View: {view}</p>
    </div>
  );
};

const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '2rem',
      margin: '0',
    },
    toggleWrapper: {
      display: 'flex',
      position: 'relative',
      width: '150px',
      height: '40px', // Set a fixed height for consistent alignment
      backgroundColor: '#f1f1f1',
      borderRadius: '25px',
      marginLeft: '30px', // Align to the left
      overflow: 'hidden', // Prevents slider overflow
      boxShadow: '0 0 3px rgba(0,0,0,0.2)', // Optional: adds a subtle shadow
    },
    slider: {
      position: 'absolute',
      width: '50%', // Half the width of the toggleWrapper
      height: '100%', // Full height to align perfectly
      backgroundColor: '#4CAF50',
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
      alignItems: 'center', // Centers text vertically
      justifyContent: 'center', // Centers text horizontally
    },
    viewText: {
      marginTop: '20px',
      fontSize: '1.2rem',
      paddingLeft: '30px', // Aligns with the toggle buttons
      textAlign: 'left',
    },
  };
  

export default App;

