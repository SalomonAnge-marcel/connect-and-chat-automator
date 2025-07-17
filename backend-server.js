// Simple Express.js backend for receiving LinkedIn li_at cookie
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Store the latest synced session (campaign and user info)
// This is like a box where we keep the info about which campaign is connected
let syncedSession = null;

// When the extension sends the cookie, campaignId, and userId, we save them here
app.post('/api/store-linkedin-cookie', (req, res) => {
  const { li_at, campaignId, userId, timestamp } = req.body;
  if (!li_at || !campaignId) {
    return res.status(400).json({ success: false, message: 'Missing data.' });
  }
  // Save the session info (like writing it on a sticky note)
  syncedSession = { li_at, campaignId, userId, timestamp };
  res.json({ success: true, message: 'Session synced.' });
});

// Let the frontend check if the extension is synced to a specific campaign
app.get('/api/is-synced/:campaignId', (req, res) => {
  const { campaignId } = req.params;
  // If the campaignId matches the one we saved, it's synced!
  const isSynced = syncedSession && syncedSession.campaignId === campaignId;
  res.json({ isSynced });
});

// Old session status endpoint (still works for general session check)
app.get('/api/linkedin-session-status', (req, res) => {
  res.json({ sessionActive: !!(syncedSession && syncedSession.li_at) });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 