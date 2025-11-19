// content.js
// This script runs in the context of the web page.
// It can be used to extract more detailed metadata or detect user idle state within the page.

console.log("Productivv Content Script Active");

// Example: Listen for visibility change to handle tab switching at page level (optional backup to background.js)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page became hidden
    } else {
        // Page became visible
    }
});

