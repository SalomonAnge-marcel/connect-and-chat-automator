// LinkedIn Connector Pop-up Logic
// This file handles the user interface and CSV file processing

let csvData = []; // Store the CSV data after parsing
let statusDiv; // Reference to the status display area

// When the pop-up loads, set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    statusDiv = document.getElementById('status');
    
    // Set up file input listener
    document.getElementById('csvFile').addEventListener('change', handleFileSelect);
    
    // Set up start button listener
    document.getElementById('startBtn').addEventListener('click', startAutomation);
    
    // Check current status from storage
    loadCurrentStatus();
});

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

// Start the automation process
function startAutomation() {
    if (csvData.length === 0) {
        updateStatus('Error: Please upload a valid CSV file first', 'error');
        return;
    }
    
    updateStatus('Starting automation...', 'info');
    document.getElementById('startBtn').disabled = true;
    
    // Send the CSV data to the background script
    chrome.runtime.sendMessage({
        action: 'startAutomation',
        csvData: csvData
    }, function(response) {
        if (response && response.success) {
            updateStatus('Automation started successfully!', 'success');
        } else {
            updateStatus('Error: Could not start automation - ' + (response?.error || 'Unknown error'), 'error');
            document.getElementById('startBtn').disabled = false;
        }
    });
}

// Update the status display
function updateStatus(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const classname = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
    
    statusDiv.innerHTML += `<span class="${classname}">[${timestamp}] ${message}</span>\n`;
    statusDiv.scrollTop = statusDiv.scrollHeight; // Scroll to bottom
}

// Load current status from background script
function loadCurrentStatus() {
    chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
        if (response && response.status) {
            updateStatus(response.status, 'info');
        }
    });
}

// Listen for status updates from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
        updateStatus(request.message, request.type || 'info');
        
        // Re-enable start button if automation is complete or stopped
        if (request.message.includes('Stopped') || request.message.includes('Complete')) {
            document.getElementById('startBtn').disabled = false;
        }
    }
});