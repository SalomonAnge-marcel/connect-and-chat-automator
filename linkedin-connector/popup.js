// popup.js
// This file runs in the popup window of the extension
// It lets you click a button to send your LinkedIn session to your backend
// For 7th graders: This is like a remote control for your extension!

document.addEventListener('DOMContentLoaded', function() {
  const connectBtn = document.getElementById('connectBtn');
  const statusDiv = document.getElementById('status');

  connectBtn.addEventListener('click', function() {
    statusDiv.textContent = 'Connecting...';
    // Ask the service worker to get the cookie and send it
    chrome.runtime.sendMessage({ action: 'connect_linkedin' }, function(response) {
        if (response && response.success) {
        statusDiv.textContent = '✅ Cookie sent successfully!';
        statusDiv.className = 'text-green-600 text-center text-sm font-semibold';
        } else {
        statusDiv.textContent = '❌ Could not send cookie.';
        statusDiv.className = 'text-red-600 text-center text-sm font-semibold';
      }
    });
  });
});