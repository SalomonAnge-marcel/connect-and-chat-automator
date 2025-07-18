// service_worker.js
// This is the background brain of the extension
// It listens for messages from the popup and does the real work
// For 7th graders: This is like the engine under the hood!

// Replace with your real Supabase endpoint and API key
const SUPABASE_API_URL = 'https://YOUR-SUPABASE-API-ENDPOINT.com/api/store-liat';
const SUPABASE_API_KEY = 'YOUR_SUPABASE_API_KEY'; // If required

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'connect_linkedin') {
    // Get the LinkedIn session cookie (li_at)
    chrome.cookies.get({ url: 'https://www.linkedin.com', name: 'li_at' }, function(cookie) {
      if (!cookie || !cookie.value) {
        sendResponse({ success: false, error: 'No li_at cookie found.' });
        return;
      }
      // Prepare the data to send
      const data = {
        li_at: cookie.value,
        timestamp: new Date().toISOString()
      };
      // Send the cookie to Supabase
      fetch(SUPABASE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add API key if your Supabase endpoint requires it
          ...(SUPABASE_API_KEY ? { 'apikey': SUPABASE_API_KEY } : {})
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success' || result.success) {
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: result.message || 'Unknown error' });
        }
      })
      .catch(err => {
        sendResponse({ success: false, error: err.message });
      });
    });
    // Tell Chrome we will respond asynchronously
    return true;
  }
}); 