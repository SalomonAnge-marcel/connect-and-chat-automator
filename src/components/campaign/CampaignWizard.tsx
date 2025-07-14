import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { Step1ImportLeads } from './Step1ImportLeads';
import { Step2ConnectionMessage } from './Step2ConnectionMessage';
import { Step3FollowUpMessage } from './Step3FollowUpMessage';
import { Step4CampaignSettings } from './Step4CampaignSettings';

interface CampaignData {
  leads: any[];
  connectionMessage: string;
  followUpMessage: string;
  followUpEnabled: boolean;
  dailyLimit: number;
  actionDelay: string;
  stopOnBlock: boolean;
  campaignName: string;
}

interface CampaignWizardProps {
  onBack: () => void;
  onComplete: (data: CampaignData) => void;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    leads: [],
    connectionMessage: "Hi {{name}}, I'd love to connect and learn more about your work!",
    followUpMessage: "Thanks for connecting! I'm excited to learn more about your experience.",
    followUpEnabled: true,
    dailyLimit: 15,
    actionDelay: '10-30s',
    stopOnBlock: true,
    campaignName: 'New Campaign'
  });

  const steps = [
    { title: 'Import Leads', description: 'Upload your LinkedIn leads' },
    { title: 'Connection Message', description: 'Craft your connection request' },
    { title: 'Follow-up Message', description: 'Set up post-connection message' },
    { title: 'Campaign Settings', description: 'Configure automation settings' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(campaignData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return campaignData.leads.length > 0;
      case 2:
        return campaignData.connectionMessage.length > 0;
      case 3:
        return true; // Follow-up is optional
      case 4:
        return campaignData.campaignName.length > 0;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ImportLeads 
            data={campaignData} 
            onUpdate={updateCampaignData}
          />
        );
      case 2:
        return (
          <Step2ConnectionMessage 
            data={campaignData} 
            onUpdate={updateCampaignData}
          />
        );
      case 3:
        return (
          <Step3FollowUpMessage 
            data={campaignData} 
            onUpdate={updateCampaignData}
          />
        );
      case 4:
        return (
          <Step4CampaignSettings 
            data={campaignData} 
            onUpdate={updateCampaignData}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handlePrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of 4: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <span 
              key={index}
              className={index + 1 <= currentStep ? 'text-primary font-medium' : ''}
            >
              {step.title}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === 4 ? 'Launch Campaign' : 'Next'}
        </Button>
      </div>
    </div>
  );
};