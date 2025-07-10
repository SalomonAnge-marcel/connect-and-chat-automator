// LinkedIn Connector Pop-up Logic
// This file handles the user interface and CSV file processing

let csvData = []; // Store the CSV data after parsing
let statusDiv; // Reference to the status display area

// Enhanced popup initialization with session checking
document.addEventListener('DOMContentLoaded', function() {
    statusDiv = document.getElementById('status');
    
    // Set up event listeners
    document.getElementById('csvFile').addEventListener('change', handleFileSelect);
    document.getElementById('startBtn').addEventListener('click', startAutomation);
    document.getElementById('stopBtn').addEventListener('click', stopAutomation);
    
    // Initialize UI
    initializePopup();
    
    // Check session status
    checkLinkedInSession();
    
    // Check current automation status
    loadCurrentStatus();
    
    // Set up periodic session checking
    setInterval(checkLinkedInSession, 30000); // Check every 30 seconds
    setInterval(loadCurrentStatus, 5000); // Update status every 5 seconds
});

// Initialize popup UI with enhanced features
function initializePopup() {
    updateSessionIndicator(false, 'Checking session...');
    
    // Reset daily count display
    updateDailyCount(0);
    updateAutomationStatus('Ready');
}

// Check LinkedIn session status
function checkLinkedInSession() {
    chrome.runtime.sendMessage({action: 'checkSession'}, function(response) {
        if (response && response.success) {
            updateSessionIndicator(response.sessionValid, 
                response.sessionValid ? 'LinkedIn session active' : 'Please log into LinkedIn');
        } else {
            updateSessionIndicator(false, 'Session check failed');
        }
    });
}

// Update session indicator in UI
function updateSessionIndicator(isValid, message) {
    const indicator = document.getElementById('sessionIndicator');
    const dot = document.getElementById('sessionDot');
    const text = document.getElementById('sessionText');
    
    if (isValid) {
        indicator.className = 'session-indicator session-valid';
        dot.className = 'status-dot green';
    } else {
        indicator.className = 'session-indicator session-invalid';
        dot.className = 'status-dot red';
    }
    
    text.textContent = message;
    
    // Enable/disable start button based on session
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = !isValid || csvData.length === 0;
}

// Update daily count display
function updateDailyCount(count) {
    document.getElementById('dailyCount').textContent = count;
}

// Update automation status display
function updateAutomationStatus(status) {
    document.getElementById('automationStatus').textContent = status;
}

// Handle when user selects a CSV file
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        updateStatus('No file selected', 'error');
        return;
    }
    
    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
        updateStatus('Error: Please select a CSV file', 'error');
        return;
    }
    
    updateStatus('Reading CSV file...', 'info');
    
    // Use PapaParse to read the CSV file
    Papa.parse(file, {
        header: true, // Use first row as column names
        skipEmptyLines: true,
        complete: function(results) {
            handleCSVParsed(results);
        },
        error: function(error) {
            updateStatus('Error: Could not read CSV file - ' + error.message, 'error');
        }
    });
}

// Handle the parsed CSV data
function handleCSVParsed(results) {
    // Check if there were any parsing errors
    if (results.errors && results.errors.length > 0) {
        updateStatus('Error: CSV file has formatting issues', 'error');
        return;
    }
    
    // Check if the CSV is empty
    if (!results.data || results.data.length === 0) {
        updateStatus('Error: CSV file is empty', 'error');
        return;
    }
    
    // Check if required columns exist
    const requiredColumns = ['profile_url', 'name'];
    const headers = Object.keys(results.data[0]);
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
        updateStatus(`Error: CSV needs '${missingColumns.join('\' and \'')}' columns`, 'error');
        return;
    }
    
    // Filter out rows with empty required fields
    csvData = results.data.filter(row => 
        row.profile_url && row.profile_url.trim() && 
        row.name && row.name.trim()
    );
    
    if (csvData.length === 0) {
        updateStatus('Error: No valid rows found in CSV (profile_url and name cannot be empty)', 'error');
        return;
    }
    
    // Validate LinkedIn URLs
    const invalidUrls = csvData.filter(row => 
        !row.profile_url.includes('linkedin.com/in/')
    );
    
    if (invalidUrls.length > 0) {
        updateStatus(`Warning: ${invalidUrls.length} rows have invalid LinkedIn URLs (must contain 'linkedin.com/in/')`, 'error');
    }
    
    // Success - CSV is valid
    updateStatus(`CSV loaded successfully! Found ${csvData.length} valid profiles.`, 'success');
    document.getElementById('startBtn').disabled = false;
}

// Enhanced automation start with validation
function startAutomation() {
    if (csvData.length === 0) {
        updateStatus('Error: Please upload a valid CSV file first', 'error');
        return;
    }
    
    // Double-check session before starting
    chrome.runtime.sendMessage({action: 'checkSession'}, function(sessionResponse) {
        if (!sessionResponse || !sessionResponse.sessionValid) {
            updateStatus('Error: LinkedIn session not detected. Please log into LinkedIn first.', 'error');
            return;
        }
        
        updateStatus('Starting safe automation...', 'info');
        updateAutomationStatus('Starting');
        
        // Show stop button, hide start button
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'block';
        
        // Send the CSV data to the background script
        chrome.runtime.sendMessage({
            action: 'startAutomation',
            csvData: csvData
        }, function(response) {
            if (response && response.success) {
                updateStatus('✓ Automation started with safety measures enabled', 'success');
                updateAutomationStatus('Running');
            } else {
                updateStatus('✗ Could not start automation: ' + (response?.error || 'Unknown error'), 'error');
                resetButtonState();
            }
        });
    });
}

// Stop automation function
function stopAutomation() {
    chrome.runtime.sendMessage({action: 'stopAutomation'}, function(response) {
        if (response && response.success) {
            updateStatus('✓ Automation stopped by user', 'info');
            updateAutomationStatus('Stopped');
        } else {
            updateStatus('Could not stop automation: ' + (response?.error || 'Not running'), 'error');
        }
        resetButtonState();
    });
}

// Reset button state
function resetButtonState() {
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    updateAutomationStatus('Ready');
}

// Update the status display
function updateStatus(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const classname = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
    
    statusDiv.innerHTML += `<span class="${classname}">[${timestamp}] ${message}</span>\n`;
    statusDiv.scrollTop = statusDiv.scrollHeight; // Scroll to bottom
}

// Enhanced status loading with comprehensive updates
function loadCurrentStatus() {
    chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
        if (response && response.success) {
            if (response.status) {
                updateStatus(response.status, 'info');
            }
            
            if (typeof response.actionsToday === 'number') {
                updateDailyCount(response.actionsToday);
            }
            
            if (response.isRunning) {
                updateAutomationStatus('Running');
                document.getElementById('startBtn').style.display = 'none';
                document.getElementById('stopBtn').style.display = 'block';
            } else {
                updateAutomationStatus('Ready');
                resetButtonState();
            }
        }
    });
}

// Enhanced message listener for real-time updates
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
        updateStatus(request.message, request.type || 'info');
        
        // Update UI based on status
        if (request.currentState) {
            updateDailyCount(request.currentState.actionsToday || 0);
            
            if (request.currentState.isRunning) {
                updateAutomationStatus('Running');
            } else if (request.message.includes('completed') || 
                      request.message.includes('stopped') || 
                      request.message.includes('Stopped')) {
                updateAutomationStatus('Complete');
                resetButtonState();
            }
        }
    }
});

// Add error handling for chrome extension context
window.addEventListener('error', function(event) {
    console.error('LinkedIn Connector Popup Error:', event.error);
    updateStatus('Popup error: ' + event.error.message, 'error');
});