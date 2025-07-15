import React, { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { CampaignWizard } from '@/components/campaign/CampaignWizard';
import { LinkedInConnectionSetup } from '@/components/LinkedInConnectionSetup';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'campaign-wizard' | 'linkedin-setup'>('dashboard');
  const [campaignData, setCampaignData] = useState(null);
  const { toast } = useToast();

  const handleCreateCampaign = () => {
    setCurrentView('campaign-wizard');
  };

  const handleCampaignComplete = (data: any) => {
    setCampaignData(data);
    setCurrentView('linkedin-setup');
  };

  const handleLaunchCampaign = () => {
    toast({
      title: "Campaign Launched!",
      description: "Your LinkedIn automation campaign is now running.",
    });
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackToSettings = () => {
    setCurrentView('campaign-wizard');
  };

  if (currentView === 'campaign-wizard') {
    return (
      <CampaignWizard 
        onBack={handleBackToDashboard}
        onComplete={handleCampaignComplete}
      />
    );
  }

  if (currentView === 'linkedin-setup' && campaignData) {
    return (
      <LinkedInConnectionSetup 
        campaignData={campaignData}
        onLaunch={handleLaunchCampaign}
        onBack={handleBackToSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 px-[10rem] py-[5rem]">
      <div className="container mx-auto px-4 py-8">
        <Dashboard onCreateCampaign={handleCreateCampaign} />
      </div>
    </div>
  );
};

export default Index;