import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Chrome, 
  Download, 
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const InstructionsPanel: React.FC = () => {
  const steps = [
    {
      title: "Install Chrome Extension",
      description: "Download and install the LinkedIn Connector extension for automated connections",
      icon: Chrome,
      status: "required"
    },
    {
      title: "Prepare Your CSV",
      description: "Create a CSV file with 'profile_url' and 'name' columns containing LinkedIn profiles",
      icon: BookOpen,
      status: "required"
    },
    {
      title: "Upload & Process",
      description: "Upload your CSV file and let the system validate the data",
      icon: Download,
      status: "required"
    },
    {
      title: "Monitor Progress",
      description: "Track connection requests, acceptance rates, and overall campaign performance",
      icon: CheckCircle,
      status: "optional"
    }
  ];

  const csvExample = `profile_url,name,company,position,message
https://linkedin.com/in/johndoe,John Doe,Tech Corp,Software Engineer,Hi John! I'd love to connect
https://linkedin.com/in/janedoe,Jane Doe,Marketing Inc,Marketing Manager,Hi Jane! Great to meet you`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            How to Use LinkedIn Connector
          </CardTitle>
          <CardDescription>
            Follow these steps to start your LinkedIn outreach campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <Badge variant={step.status === "required" ? "default" : "secondary"}>
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Example</CardTitle>
          <CardDescription>
            Your CSV file should include these columns (profile_url and name are required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <pre>{csvExample}</pre>
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Column Descriptions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>profile_url:</strong> Full LinkedIn profile URL (required)</li>
              <li><strong>name:</strong> Contact's full name (required)</li>
              <li><strong>company:</strong> Company name (optional)</li>
              <li><strong>position:</strong> Job title (optional)</li>
              <li><strong>message:</strong> Personalized connection message (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This tool is designed for legitimate networking purposes. 
          Please respect LinkedIn's terms of service and daily connection limits (typically 30-50 per day).
          Always personalize your messages and connect with relevant professionals in your industry.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Download Chrome Extension</CardTitle>
          <CardDescription>
            Get the LinkedIn Connector extension for automated functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download Extension Files
            </Button>
            <div className="text-sm text-muted-foreground">
              Load the extension folder in Chrome Developer Mode
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};