import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Chrome, Linkedin, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ConnectionStatus {
  extensionInstalled: boolean;
  linkedinLoggedIn: boolean;
  extensionSynced: boolean;
}

interface LinkedInConnectionSetupProps {
  campaignData: any;
  onLaunch: () => void;
  onBack: () => void;
}

export const LinkedInConnectionSetup: React.FC<LinkedInConnectionSetupProps> = ({ 
  campaignData, 
  onLaunch, 
  onBack 
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    extensionInstalled: false,
    linkedinLoggedIn: false,
    extensionSynced: false
  });

  const [isChecking, setIsChecking] = useState(true);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status.extensionInstalled && !isChecking) {
      setShowDownloadDialog(true);
    }
  }, [status.extensionInstalled, isChecking]);

  const downloadExtensionFiles = async () => {
    try {
      // Only include the new extension files
      const files = {
        'manifest.json': await fetch('/linkedin-connector/manifest.json').then(r => r.text()),
        'popup.html': await fetch('/linkedin-connector/popup.html').then(r => r.text()),
        'popup.js': await fetch('/linkedin-connector/popup.js').then(r => r.text()),
        'service_worker.js': await fetch('/linkedin-connector/service_worker.js').then(r => r.text()),
      };
      let archiveContent = '';
      for (const [filename, content] of Object.entries(files)) {
        archiveContent += `// ===== ${filename} =====\n${content}\n\n`;
      }
      const blob = new Blob([archiveContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkedin-cookie-connector-extension.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading extension files.');
    }
    setShowDownloadDialog(false);
  };

  // This function checks if the extension is synced to the current campaign
  const checkIfSynced = async (campaignId: string) => {
    // Ask the backend if the extension is synced to this campaign
    const res = await fetch(`http://localhost:3001/api/is-synced/${campaignId}`);
    const data = await res.json();
    return data.isSynced;
  };

  const checkConnectionStatus = async () => {
    let extensionInstalled = false;
    // Handshake with extension
    const pongPromise = new Promise<boolean>(resolve => {
      function handlePong(event: MessageEvent) {
        if (event.source === window && event.data && event.data.type === 'EXTENSION_PONG') {
          window.removeEventListener('message', handlePong);
          resolve(true);
        }
      }
      window.addEventListener('message', handlePong);
      window.postMessage({ type: 'EXTENSION_PING' }, '*');
      setTimeout(() => {
        window.removeEventListener('message', handlePong);
        resolve(false);
      }, 1000); // 1s timeout
    });
    extensionInstalled = await pongPromise as boolean;

    let linkedinLoggedIn = false;
    let extensionSynced = false;
    try {
      // Use the campaignId from the current campaign
      const campaignId = campaignData.campaignId;
      // Check if the extension is synced to this campaign
      extensionSynced = await checkIfSynced(campaignId);
      // If synced, we know the session is active
      linkedinLoggedIn = extensionSynced;
    } catch (error) {
      linkedinLoggedIn = false;
      extensionSynced = false;
    }
    setStatus({
      extensionInstalled,
      linkedinLoggedIn,
      extensionSynced
    });
      setIsChecking(false);
  };

  const allReady = status.extensionInstalled && status.linkedinLoggedIn && status.extensionSynced;

  const getStatusIcon = (isReady: boolean, isLoading: boolean = false) => {
    if (isLoading) return <RefreshCw className="w-5 h-5 animate-spin text-yellow-500" />;
    return isReady ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (isReady: boolean) => {
    return isReady ? 
      <Badge className="bg-green-100 text-green-800">Ready</Badge> : 
      <Badge variant="destructive">Not Ready</Badge>;
  };

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-6 font-poppins px-[10rem] py-[5rem]">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Connect Your LinkedIn Account</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          To run your campaign automatically, please verify that the Chrome extension is installed and connected to your LinkedIn account.
        </p>
      </div>

      {/* Status Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Extension Installed */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.extensionInstalled, isChecking)}
              <div>
                <h3 className="font-semibold">Extension Installed</h3>
                <p className="text-sm text-muted-foreground">
                  Chrome extension is detected and running
                </p>
              </div>
            </div>
            {getStatusBadge(status.extensionInstalled)}
          </div>

          {/* LinkedIn Session */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.linkedinLoggedIn, isChecking)}
              <div>
                <h3 className="font-semibold">LinkedIn Session Active</h3>
                <p className="text-sm text-muted-foreground">
                  You are logged into LinkedIn in Chrome
                </p>
              </div>
            </div>
            {getStatusBadge(status.linkedinLoggedIn)}
          </div>

          {/* Extension Synced */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.extensionSynced, isChecking)}
              <div>
                <h3 className="font-semibold">Extension Synchronized</h3>
                <p className="text-sm text-muted-foreground">
                  Extension is connected to your campaign account
                </p>
              </div>
            </div>
            {getStatusBadge(status.extensionSynced)}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      {!allReady && (
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!status.extensionInstalled && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                <Chrome className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Extension Not Detected</p>
                  <p className="text-sm text-red-700">Please install the Chrome extension and refresh this page</p>
                </div>
              </div>
            )}

            {!status.linkedinLoggedIn && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <Linkedin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">LinkedIn Not Connected</p>
                  <p className="text-sm text-blue-700">Please log into LinkedIn in another Chrome tab</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="https://linkedin.com/feed" target="_blank" rel="noopener noreferrer">
                      Open LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {!status.extensionSynced && status.extensionInstalled && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <RefreshCw className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Extension Not Synchronized</p>
                  <p className="text-sm text-yellow-700">Please refresh this page or restart the extension</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={checkConnectionStatus}>
                    Retry Connection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Ready to Launch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Campaign Name:</span>
            <span className="text-sm font-medium">{campaignData.campaignName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Total Leads:</span>
            <span className="text-sm font-medium">{campaignData.leads.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Daily Limit:</span>
            <span className="text-sm font-medium">{campaignData.dailyLimit} requests/day</span>
          </div>
        </CardContent>
      </Card>

      {/* Success State */}
      {allReady && (
        <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-900 mb-2">Everything is Ready!</h2>
          <p className="text-green-700 mb-4">Your LinkedIn account is connected and the extension is ready to run your campaign.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Settings
        </Button>
        <Button 
          onClick={onLaunch} 
          disabled={!allReady}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Launch Automation
        </Button>
      </div>
    </div>
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="font-poppins">
          <DialogHeader>
            <DialogTitle>Chrome Extension Not Detected</DialogTitle>
          </DialogHeader>
          <div className="py-2">The LinkedIn Connector Chrome extension is not installed or not running. Would you like to download it now?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>No</Button>
            <Button onClick={downloadExtensionFiles}>Yes, Download Extension</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};