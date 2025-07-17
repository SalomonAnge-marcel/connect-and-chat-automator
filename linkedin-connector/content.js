// LinkedIn Connector Content Script
// This file runs on LinkedIn pages to help with automation

// Helper function to find elements with retry logic
function findElementWithRetry(selector, maxAttempts = 5, delay = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const tryFind = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            attempts++;
            if (attempts >= maxAttempts) {
                reject(new Error(`Element not found: ${selector}`));
                return;
            }
            
            setTimeout(tryFind, delay);
        };
        
        tryFind();
    });
}

// Enhanced function to click Connect button with better selectors
function findAndClickConnect(name) {
    return new Promise((resolve) => {
        // Wait for page to load
        setTimeout(() => {
            try {
                // Multiple selectors to find Connect button
                const selectors = [
                    'button[aria-label*="Invite"]',
                    'button[data-control-name="invite"]',
                    'button[aria-label*="Connect"]',
                    'button:contains("Connect")',
                    '.pv-s-profile-actions button:contains("Connect")',
                    '.pvs-profile-actions button[aria-label*="Invite"]'
                ];
                
                let connectButton = null;
                
                // Try each selector
                for (const selector of selectors) {
                    connectButton = document.querySelector(selector);
                    if (connectButton) break;
                }
                
                // If no button found with selectors, search by text
                if (!connectButton) {
                    const buttons = document.querySelectorAll('button');
                    for (let button of buttons) {
                        const text = button.textContent.trim().toLowerCase();
                        if (text === 'connect' || text.includes('connect')) {
                            connectButton = button;
                            break;
                        }
                    }
                }
                
                if (!connectButton) {
                    resolve({success: false, error: 'Connect button not found on this profile'});
                    return;
                }
                
                // Check if button is disabled or already connected
                if (connectButton.disabled || connectButton.textContent.includes('Pending')) {
                    resolve({success: false, error: 'Already connected or request pending'});
                    return;
                }
                
                // Click the Connect button
                connectButton.scrollIntoView();
                connectButton.click();
                
                // Handle the connection modal
                setTimeout(() => handleConnectionModal(name, resolve), 1500);
                
            } catch (error) {
                resolve({success: false, error: error.message});
            }
        }, 2000);
    });
}

// Handle the connection request modal
function handleConnectionModal(name, resolve) {
    try {
        // Look for "Add a note" button or option
        const addNoteBtn = document.querySelector('button[aria-label*="Add a note"]') ||
                          document.querySelector('button:contains("Add a note")') ||
                          document.querySelector('.connect-button-send-invite__note-toggle');
        
        if (addNoteBtn && !addNoteBtn.disabled) {
            addNoteBtn.click();
            
            // Wait for note field to appear
            setTimeout(() => {
                const noteField = document.querySelector('textarea[name="message"]') ||
                                document.querySelector('textarea[aria-label*="note"]') ||
                                document.querySelector('#custom-message') ||
                                document.querySelector('.connect-button-send-invite__custom-message');
                
                if (noteField) {
                    const message = `Hi ${name}, I'd love to connect and learn about your work!`;
                    noteField.value = message;
                    noteField.focus();
                    
                    // Trigger input events
                    noteField.dispatchEvent(new Event('input', { bubbles: true }));
                    noteField.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                // Find and click Send button
                setTimeout(() => clickSendButton(resolve), 1000);
            }, 1000);
        } else {
            // No note option available, just send
            clickSendButton(resolve);
        }
    } catch (error) {
        resolve({success: false, error: error.message});
    }
}

// Click the final Send button
function clickSendButton(resolve) {
    try {
        const sendSelectors = [
            'button[aria-label*="Send invitation"]',
            'button[aria-label*="Send"]',
            'button:contains("Send invitation")',
            'button:contains("Send")',
            '.connect-button-send-invite__send-button',
            '.artdeco-button--primary:contains("Send")'
        ];
        
        let sendButton = null;
        
        // Try each selector
        for (const selector of sendSelectors) {
            sendButton = document.querySelector(selector);
            if (sendButton && !sendButton.disabled) break;
        }
        
        // Search by text if selectors don't work
        if (!sendButton) {
            const buttons = document.querySelectorAll('button');
            for (let button of buttons) {
                const text = button.textContent.trim().toLowerCase();
                if ((text.includes('send') || text === 'invite') && !button.disabled) {
                    sendButton = button;
                    break;
                }
            }
        }
        
        if (sendButton) {
            sendButton.click();
            resolve({success: true, message: 'Connection request sent successfully'});
        } else {
            resolve({success: false, error: 'Send button not found or disabled'});
        }
    } catch (error) {
        resolve({success: false, error: error.message});
    }
}

// Function to extract connection profile URLs
function extractConnectionUrls() {
    const profileLinks = document.querySelectorAll('a[href*="/in/"]');
    const urls = [];
    
    profileLinks.forEach(link => {
        const href = link.href;
        // Only get profile URLs, not other LinkedIn URLs
        if (href.includes('/in/') && !href.includes('?') && !href.includes('#')) {
            urls.push(href);
        }
    });
    
    // Remove duplicates
    return [...new Set(urls)];
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'clickConnect') {
        findAndClickConnect(request.name)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({success: false, error: error.message}));
        return true; // Keep message channel open
    }
    
    if (request.action === 'getConnections') {
        try {
            const urls = extractConnectionUrls();
            sendResponse({success: true, urls: urls});
        } catch (error) {
            sendResponse({success: false, error: error.message});
        }
    }
});

// Listen for handshake from the web app
window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'EXTENSION_PING') {
        window.postMessage({ type: 'EXTENSION_PONG' }, '*');
    }
});