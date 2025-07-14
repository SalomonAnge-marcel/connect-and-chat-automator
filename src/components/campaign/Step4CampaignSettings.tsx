import React from 'react';
import { Settings, Clock, Shield, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step4Props {
  data: any;
  onUpdate: (updates: any) => void;
}

export const Step4CampaignSettings: React.FC<Step4Props> = ({ data, onUpdate }) => {
  const estimatedDays = Math.ceil(data.leads.length / data.dailyLimit);

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name</Label>
        <Input
          id="campaign-name"
          value={data.campaignName}
          onChange={(e) => onUpdate({ campaignName: e.target.value })}
          placeholder="Enter campaign name"
        />
      </div>

      {/* Daily Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Daily Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Requests per day: {data.dailyLimit}</Label>
              <span className="text-sm text-muted-foreground">
                Est. {estimatedDays} days to complete
              </span>
            </div>
            <Slider
              value={[data.dailyLimit]}
              onValueChange={([value]) => onUpdate({ dailyLimit: value })}
              max={25}
              min={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 (Safe)</span>
              <span>15 (Recommended)</span>
              <span>25 (Aggressive)</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
            <strong>Recommended:</strong> 10-15 requests per day to avoid LinkedIn limits
          </div>
        </CardContent>
      </Card>

      {/* Action Delay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Delay between actions</Label>
            <Select value={data.actionDelay} onValueChange={(value) => onUpdate({ actionDelay: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-15s">5-15 seconds (Fast)</SelectItem>
                <SelectItem value="10-30s">10-30 seconds (Recommended)</SelectItem>
                <SelectItem value="30-60s">30-60 seconds (Conservative)</SelectItem>
                <SelectItem value="1-3m">1-3 minutes (Very Safe)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Random delays help make the automation look more natural
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stop-on-block"
              checked={data.stopOnBlock}
              onCheckedChange={(checked) => onUpdate({ stopOnBlock: checked })}
            />
            <label htmlFor="stop-on-block" className="text-sm font-medium">
              Stop campaign if LinkedIn shows restrictions
            </label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Automatically pause the campaign if LinkedIn detects unusual activity
          </p>
        </CardContent>
      </Card>

      {/* Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Total Leads:</span>
            <span className="text-sm font-medium">{data.leads.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Daily Limit:</span>
            <span className="text-sm font-medium">{data.dailyLimit} requests/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Estimated Duration:</span>
            <span className="text-sm font-medium">{estimatedDays} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Follow-up Messages:</span>
            <span className="text-sm font-medium">{data.followUpEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};