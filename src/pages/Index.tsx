import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVUpload } from '@/components/CSVUpload';
import { CampaignDashboard } from '@/components/CampaignDashboard';
import { InstructionsPanel } from '@/components/InstructionsPanel';
import { LinkedInProfiles } from '@/components/LinkedInProfiles';
import { useToast } from '@/hooks/use-toast';
import { Linkedin, Upload, BarChart3, BookOpen, Users } from 'lucide-react';

interface CSVData {
  profile_url: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  message?: string;
  [key: string]: string | undefined; // Allow any additional custom columns
}

interface CampaignStats {
  totalContacts: number;
  sentRequests: number;
  acceptedConnections: number;
  messagesSent: number;
  responseRate: number;
}

const Index = () => {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [isActiveCompaign, setIsActiveCampaign] = useState(false);
  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    totalContacts: 0,
    sentRequests: 0,
    acceptedConnections: 0,
    messagesSent: 0,
    responseRate: 0
  });

  const { toast } = useToast();

  const handleDataParsed = (data: CSVData[]) => {
    setCsvData(data);
    setCampaignStats(prev => ({
      ...prev,
      totalContacts: data.length
    }));
  };

  const handleStartCampaign = () => {
    if (csvData.length === 0) {
      toast({
        title: "No data available",
        description: "Please upload and process a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsActiveCampaign(true);
    toast({
      title: "Campaign started",
      description: "Your LinkedIn outreach campaign is now active. Use the Chrome extension to begin sending connection requests.",
    });
  };

  const handleStopCampaign = () => {
    setIsActiveCampaign(false);
    toast({
      title: "Campaign stopped",
      description: "Your campaign has been paused. You can resume it anytime.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" style={{ paddingLeft: '10rem', paddingRight: '10rem', paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Linkedin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-space-grotesk">LinkedIn Connector</h1>
              <p className="text-muted-foreground font-poppins">
                Automate your LinkedIn networking with intelligent connection management
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 font-poppins">
            <TabsTrigger value="profiles" className="flex items-center gap-2 font-poppins">
              <Users className="w-4 h-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2 font-poppins">
              <Upload className="w-4 h-4" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 font-poppins">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2 font-poppins">
              <BookOpen className="w-4 h-4" />
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <LinkedInProfiles />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <CSVUpload onDataParsed={handleDataParsed} />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <CampaignDashboard
              stats={campaignStats}
              isActive={isActiveCompaign}
              onStartCampaign={handleStartCampaign}
              onStopCampaign={handleStopCampaign}
            />
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <InstructionsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;