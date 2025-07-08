# LinkedIn Connector Chrome Extension

A Chrome extension that automates sending LinkedIn connection requests and first messages from a CSV file.

## Features

- Send up to 10 connection requests per day
- Personalized connection request messages
- Automatic first message to accepted connections
- Progress tracking to avoid duplicates
- Safety features to prevent LinkedIn warnings

## Installation

1. Download or clone this folder (`linkedin-connector`)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `linkedin-connector` folder
5. The extension icon should appear in your Chrome toolbar

## Usage

### 1. Prepare Your CSV File

Create a CSV file with these exact column names:
- `profile_url`: LinkedIn profile URLs (e.g., `https://www.linkedin.com/in/johndoe`)
- `name`: First names (e.g., `John`)

Example CSV:
```csv
profile_url,name
https://www.linkedin.com/in/johndoe,John
https://www.linkedin.com/in/janesmith,Jane
```

### 2. Use the Extension

1. Make sure you're logged into LinkedIn in Chrome
2. Click the LinkedIn Connector extension icon
3. Click "Choose CSV File" and select your CSV
4. Click "Start Automation" to begin
5. Watch the status updates in the extension popup

### 3. What It Does

1. **Connection Requests**: Sends personalized connection requests to up to 10 people per day
2. **Progress Tracking**: Remembers who has been contacted to avoid duplicates
3. **Safety Delays**: Waits 5-10 seconds between actions to act human-like
4. **Error Handling**: Stops if LinkedIn shows warnings or captchas

## Safety Features

- Daily limit of 10 connection requests
- Random delays between actions (5-10 seconds)
- Automatic stop if LinkedIn shows warnings
- No storage of login credentials

## Messages Used

**Connection Request Note:**
"Hi [name], I'd love to connect and learn about your work!"

**First Message:**
"Hi [name], thanks for connecting! I'm excited to learn more about your work. Can we chat about possible teamwork?"

## Troubleshooting

### Common Issues

1. **"Connect button not found"**
   - Make sure the LinkedIn profile is public and accessible
   - Some profiles may not have a Connect button (already connected, etc.)

2. **"LinkedIn warning detected"**
   - The extension automatically stops if LinkedIn shows security warnings
   - Try again later or reduce the frequency of use

3. **"CSV needs 'profile_url' and 'name' columns"**
   - Check that your CSV has the exact column names (case-sensitive)
   - Make sure there are no extra spaces in the column headers

### Best Practices

1. Start with a small CSV (5-10 profiles) to test
2. Don't run the automation too frequently
3. Make sure you're logged into LinkedIn before starting
4. Keep your LinkedIn profile professional and complete

## File Structure

- `manifest.json`: Extension configuration
- `popup.html`: User interface
- `popup.js`: UI logic and CSV handling
- `background.js`: Main automation logic
- `content.js`: LinkedIn page interaction
- `papaparse.min.js`: CSV parsing library

## Limitations

- Maximum 10 connection requests per day
- Requires manual LinkedIn login
- May not work if LinkedIn changes their interface
- Only works with valid LinkedIn profile URLs

## Technical Notes

This extension uses:
- Chrome Extension Manifest V3
- PapaParse for CSV reading
- Chrome Storage API for progress tracking
- Content scripts for LinkedIn page interaction

For developers: The code is commented for 7th-grade reading level while maintaining professional functionality.