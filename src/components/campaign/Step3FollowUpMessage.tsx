import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Step3Props {
  data: any;
  onUpdate: (updates: any) => void;
}

export const Step3FollowUpMessage: React.FC<Step3Props> = ({ data, onUpdate }) => {
  const sampleLead = data.leads[0] || { 
    name: 'John Doe', 
    company: 'Tech Corp', 
    position: 'Software Engineer',
    profile_url: 'https://linkedin.com/in/sample'
  };

  const getPreviewMessage = () => {
    return data.followUpMessage
      .replace(/\{\{name\}\}/g, sampleLead.name || 'John Doe')
      .replace(/\{\{company\}\}/g, sampleLead.company || 'Tech Corp')  
      .replace(/\{\{position\}\}/g, sampleLead.position || 'Software Engineer');
  };

  return (
    <div className="space-y-6">
      {/* Enable Follow-up */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable-followup"
          checked={data.followUpEnabled}
          onCheckedChange={(checked) => onUpdate({ followUpEnabled: checked })}
        />
        <label htmlFor="enable-followup" className="text-sm font-medium">
          Send automatic message after connection acceptance
        </label>
      </div>

      {/* Message Editor */}
      {data.followUpEnabled && (
        <div className="space-y-4">
          <div>
            <label htmlFor="followup-message" className="block text-sm font-medium mb-2">
              Follow-up Message
            </label>
            <Textarea
              id="followup-message"
              value={data.followUpMessage}
              onChange={(e) => onUpdate({ followUpMessage: e.target.value })}
              placeholder="Thanks for connecting {{name}}! I'm excited to learn more about your experience at {{company}}."
              className="min-h-[120px]"
            />
            <p className="text-sm text-muted-foreground mt-2">
              This message will be sent automatically when someone accepts your connection request
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {data.followUpEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Follow-up Preview
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
      )}

      {/* Available Variables */}
      {data.followUpEnabled && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Available Variables:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><code className="bg-background px-2 py-1 rounded">{'{{name}}'}</code> - Contact's name</div>
            <div><code className="bg-background px-2 py-1 rounded">{'{{company}}'}</code> - Company name</div>
            <div><code className="bg-background px-2 py-1 rounded">{'{{position}}'}</code> - Job title</div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">Follow-up Message Best Practices:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Wait 1-2 days after connection before sending follow-up</li>
          <li>• Keep the message conversational and not overly salesy</li>
          <li>• Reference their background or mutual interests</li>
          <li>• End with a question to encourage engagement</li>
        </ul>
      </div>
    </div>
  );
};