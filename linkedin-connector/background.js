// LinkedIn Connector Background Script
// This file handles the automation logic and Chrome APIs

// Storage keys for tracking progress
const STORAGE_KEYS = {
    REQUESTED: 'requested_profiles',
    MESSAGED: 'messaged_profiles',
    LAST_REQUEST_DATE: 'last_request_date',
    DAILY_COUNT: 'daily_request_count'
};

const DAILY_LIMIT = 10; // Maximum connection requests per day
let isRunning = false; // Track if automation is currently running
let currentStatus = 'Ready'; // Current status message

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startAutomation') {
        startAutomationProcess(request.csvData)
            .then(() => sendResponse({success: true}))
            .catch(error => sendResponse({success: false, error: error.message}));
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'getStatus') {
        sendResponse({status: currentStatus});
    }
});

// Main automation process
async function startAutomationProcess(csvData) {
    if (isRunning) {
        throw new Error('Automation is already running');
    }
    
    isRunning = true;
    updateStatus('Starting automation process...', 'info');
    
    try {
        // Check if we can send requests today
        const canSendToday = await checkDailyLimit();
        if (!canSendToday) {
            updateStatus('Daily limit of 10 requests reached. Try again tomorrow.', 'error');
            return;
        }
        
        // Get current progress from storage
        const progress = await getProgress();
        
        // Step 1: Send connection requests
        await sendConnectionRequests(csvData, progress);
        
        // Step 2: Check for accepted connections
        await checkAcceptedConnections(csvData, progress);
        
        // Step 3: Send messages to accepted connections
        await sendFirstMessages(csvData, progress);
        
        updateStatus('Automation complete!', 'success');
        
    } catch (error) {
        updateStatus(`Automation stopped: ${error.message}`, 'error');
    } finally {
        isRunning = false;
    }
}

// Check if we can send more requests today
async function checkDailyLimit() {
    const today = new Date().toDateString();
    const storage = await chrome.storage.local.get([STORAGE_KEYS.LAST_REQUEST_DATE, STORAGE_KEYS.DAILY_COUNT]);
    
    const lastRequestDate = storage[STORAGE_KEYS.LAST_REQUEST_DATE];
    const dailyCount = storage[STORAGE_KEYS.DAILY_COUNT] || 0;
    
    // If it's a new day, reset the counter
    if (lastRequestDate !== today) {
        await chrome.storage.local.set({
            [STORAGE_KEYS.LAST_REQUEST_DATE]: today,
            [STORAGE_KEYS.DAILY_COUNT]: 0
        });
        return true;
    }
    
    // Check if we've reached the daily limit
    return dailyCount < DAILY_LIMIT;
}

// Get current progress from storage
async function getProgress() {
    const storage = await chrome.storage.local.get([
        STORAGE_KEYS.REQUESTED,
        STORAGE_KEYS.MESSAGED
    ]);
    
    return {
        requested: storage[STORAGE_KEYS.REQUESTED] || [],
        messaged: storage[STORAGE_KEYS.MESSAGED] || []
    };
}

// Send connection requests to profiles
async function sendConnectionRequests(csvData, progress) {
    updateStatus('Starting to send connection requests...', 'info');
    
    // Get current daily count
    const storage = await chrome.storage.local.get([STORAGE_KEYS.DAILY_COUNT]);
    let dailyCount = storage[STORAGE_KEYS.DAILY_COUNT] || 0;
    
    // Filter profiles that haven't been requested yet
    const profilesToRequest = csvData.filter(profile => 
        !progress.requested.includes(profile.profile_url)
    );
    
    updateStatus(`Found ${profilesToRequest.length} profiles to send requests to`, 'info');
    
    for (const profile of profilesToRequest) {
        // Check daily limit
        if (dailyCount >= DAILY_LIMIT) {
            updateStatus(`Reached daily limit of ${DAILY_LIMIT} requests`, 'info');
            break;
        }
        
        try {
            await sendSingleConnectionRequest(profile);
            
            // Mark as requested
            progress.requested.push(profile.profile_url);
            await chrome.storage.local.set({[STORAGE_KEYS.REQUESTED]: progress.requested});
            
            // Update daily count
            dailyCount++;
            await chrome.storage.local.set({[STORAGE_KEYS.DAILY_COUNT]: dailyCount});
            
            updateStatus(`Sent request to ${profile.name}`, 'success');
            
            // Random delay between requests (5-10 seconds)
            await randomDelay(5000, 10000);
            
        } catch (error) {
            updateStatus(`Failed to send request to ${profile.name}: ${error.message}`, 'error');
            
            // If it's a LinkedIn warning, stop the process
            if (error.message.includes('LinkedIn warning')) {
                throw error;
            }
            
            // Continue with other profiles for other errors
            await randomDelay(2000, 3000);
        }
    }
}

// Send a single connection request
async function sendSingleConnectionRequest(profile) {
    // Open LinkedIn profile in a new tab
    const tab = await chrome.tabs.create({
        url: profile.profile_url,
        active: false
    });
    
    // Wait for tab to load
    await waitForTabLoad(tab.id);
    
    // Check for LinkedIn warning/checkpoint
    await checkForLinkedInWarning(tab.id);
    
    // Execute connection request script
    const results = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: clickConnectButton,
        args: [profile.name]
    });
    
    // Close the tab
    await chrome.tabs.remove(tab.id);
    
    // Check if the script execution was successful
    if (!results || !results[0] || !results[0].result.success) {
        throw new Error(results[0]?.result?.error || 'Failed to find Connect button');
    }
}

// Function to click the Connect button (runs in the LinkedIn page)
function clickConnectButton(name) {
    // Give the page time to load
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                // Look for Connect button - try multiple selectors
                let connectButton = document.querySelector('button[aria-label*="Invite"]') ||
                                   document.querySelector('button[data-control-name="invite"]') ||
                                   document.querySelector('button:contains("Connect")') ||
                                   document.querySelector('button[aria-label*="Connect"]');
                
                if (!connectButton) {
                    // Try finding by text content
                    const buttons = document.querySelectorAll('button');
                    for (let button of buttons) {
                        if (button.textContent.trim() === 'Connect') {
                            connectButton = button;
                            break;
                        }
                    }
                }
                
                if (!connectButton) {
                    resolve({success: false, error: 'Connect button not found'});
                    return;
                }
                
                // Click the Connect button
                connectButton.click();
                
                // Wait a moment for the modal to appear
                setTimeout(() => {
                    // Look for "Add a note" option
                    const addNoteButton = document.querySelector('button[aria-label*="Add a note"]') ||
                                         document.querySelector('button:contains("Add a note")');
                    
                    if (addNoteButton) {
                        addNoteButton.click();
                        
                        // Wait for note field to appear
                        setTimeout(() => {
                            const noteField = document.querySelector('textarea[name="message"]') ||
                                            document.querySelector('textarea[aria-label*="Add a note"]') ||
                                            document.querySelector('#custom-message');
                            
                            if (noteField) {
                                const message = `Hi ${name}, I'd love to connect and learn about your work!`;
                                noteField.value = message;
                                noteField.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            
                            // Find and click Send button
                            const sendButton = document.querySelector('button[aria-label*="Send"]') ||
                                             document.querySelector('button:contains("Send invitation")') ||
                                             document.querySelector('button:contains("Send")');
                            
                            if (sendButton) {
                                sendButton.click();
                                resolve({success: true});
                            } else {
                                resolve({success: false, error: 'Send button not found'});
                            }
                        }, 1000);
                        
                    } else {
                        // No note option, just send
                        const sendButton = document.querySelector('button[aria-label*="Send"]') ||
                                         document.querySelector('button:contains("Send invitation")') ||
                                         document.querySelector('button:contains("Send")');
                        
                        if (sendButton) {
                            sendButton.click();
                            resolve({success: true});
                        } else {
                            resolve({success: false, error: 'Send button not found'});
                        }
                    }
                }, 1000);
                
            } catch (error) {
                resolve({success: false, error: error.message});
            }
        }, 2000); // Wait 2 seconds for page to load
    });
}

// Check for accepted connections
async function checkAcceptedConnections(csvData, progress) {
    updateStatus('Checking for accepted connections...', 'info');
    
    try {
        // Open LinkedIn connections page
        const tab = await chrome.tabs.create({
            url: 'https://www.linkedin.com/mynetwork/network-manager/connections/',
            active: false
        });
        
        await waitForTabLoad(tab.id);
        await checkForLinkedInWarning(tab.id);
        
        // Get connection URLs from the page
        const results = await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: getConnectionUrls
        });
        
        await chrome.tabs.remove(tab.id);
        
        if (results && results[0] && results[0].result) {
            const connectionUrls = results[0].result;
            
            // Check which CSV profiles are now connected
            const newConnections = csvData.filter(profile => 
                progress.requested.includes(profile.profile_url) &&
                !progress.messaged.includes(profile.profile_url) &&
                connectionUrls.some(url => url.includes(profile.profile_url.split('/in/')[1]))
            );
            
            updateStatus(`Found ${newConnections.length} new accepted connections`, 'info');
        }
        
    } catch (error) {
        updateStatus(`Error checking connections: ${error.message}`, 'error');
    }
}

// Function to get connection URLs from LinkedIn connections page
function getConnectionUrls() {
    const connectionLinks = document.querySelectorAll('a[href*="/in/"]');
    return Array.from(connectionLinks).map(link => link.href);
}

// Send first messages to accepted connections
async function sendFirstMessages(csvData, progress) {
    updateStatus('Sending first messages to accepted connections...', 'info');
    
    // For now, we'll use a simplified approach
    // In a real implementation, you'd check which connections were accepted
    // and send messages only to those
    
    updateStatus('Message sending feature ready (implement connection checking first)', 'info');
}

// Utility functions

// Wait for a tab to finish loading
function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
        const checkTab = () => {
            chrome.tabs.get(tabId, (tab) => {
                if (tab.status === 'complete') {
                    resolve();
                } else {
                    setTimeout(checkTab, 500);
                }
            });
        };
        checkTab();
    });
}

// Check if LinkedIn is showing a warning/checkpoint page
async function checkForLinkedInWarning(tabId) {
    const results = await chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: () => window.location.href
    });
    
    const url = results[0].result;
    if (url.includes('checkpoint')) {
        throw new Error('LinkedIn warning detected - automation stopped for safety');
    }
}

// Random delay between actions
function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// Update status and notify popup
function updateStatus(message, type = 'info') {
    currentStatus = message;
    
    // Send message to popup if it's open
    chrome.runtime.sendMessage({
        action: 'updateStatus',
        message: message,
        type: type
    }).catch(() => {
        // Popup might not be open, that's okay
    });
}