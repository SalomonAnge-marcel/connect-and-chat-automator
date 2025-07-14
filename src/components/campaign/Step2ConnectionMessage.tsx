import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step2Props {
  data: any;
  onUpdate: (updates: any) => void;
}

export const Step2ConnectionMessage: React.FC<Step2Props> = ({ data, onUpdate }) => {
  const sampleLead = data.leads[0] || { 
    name: 'John Doe', 
    company: 'Tech Corp', 
    position: 'Software Engineer',
    profile_url: 'https://linkedin.com/in/sample'
  };

  const getPreviewMessage = () => {
    return data.connectionMessage
      .replace(/\{\{name\}\}/g, sampleLead.name || 'John Doe')
      .replace(/\{\{company\}\}/g, sampleLead.company || 'Tech Corp')  
      .replace(/\{\{position\}\}/g, sampleLead.position || 'Software Engineer');
  };

  return (
    <div className="space-y-6">
      {/* Message Editor */}
      <div className="space-y-4">
        <div>
          <label htmlFor="connection-message" className="block text-sm font-medium mb-2">
            Connection Request Message
          </label>
          <Textarea
            id="connection-message"
            value={data.connectionMessage}
            onChange={(e) => onUpdate({ connectionMessage: e.target.value })}
            placeholder="Hi {{name}}, I'd love to connect and learn more about your work!"
            className="min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Use variables like {`{{name}}, {{company}}, {{position}}`} to personalize your message
          </p>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview for: {sampleLead.name}</p>
            <div className="bg-background p-3 rounded border">
              <p className="text-sm">{getPreviewMessage()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Variables */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Available Variables:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><code className="bg-background px-2 py-1 rounded">{'{{name}}'}</code> - Contact's name</div>
          <div><code className="bg-background px-2 py-1 rounded">{'{{company}}'}</code> - Company name</div>
          <div><code className="bg-background px-2 py-1 rounded">{'{{position}}'}</code> - Job title</div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for Better Connection Rates:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep messages personal and relevant</li>
          <li>• Mention something specific about their background</li>
          <li>• Be clear about why you want to connect</li>
          <li>• Keep it concise (under 300 characters works best)</li>
        </ul>
      </div>
    </div>
  );
};