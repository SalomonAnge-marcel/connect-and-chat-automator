import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  ExternalLink,
  TrendingUp
} from 'lucide-react';

interface CampaignStats {
  totalContacts: number;
  sentRequests: number;
  acceptedConnections: number;
  messagesSent: number;
  responseRate: number;
}

interface CampaignDashboardProps {
  stats: CampaignStats;
  isActive: boolean;
  onStartCampaign: () => void;
  onStopCampaign: () => void;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  stats,
  isActive,
  onStartCampaign,
  onStopCampaign
}) => {
  const connectionRate = stats.totalContacts > 0 ? (stats.acceptedConnections / stats.sentRequests) * 100 : 0;
  const requestProgress = stats.totalContacts > 0 ? (stats.sentRequests / stats.totalContacts) * 100 : 0;

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Sent Requests",
      value: stats.sentRequests,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Accepted",
      value: stats.acceptedConnections,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Messages Sent",
      value: stats.messagesSent,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campaign Dashboard
              </CardTitle>
              <CardDescription>
                Monitor your LinkedIn outreach campaign progress
              </CardDescription>
            </div>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => (
              <div key={stat.title} className="flex items-center space-x-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Request Progress</span>
                <span>{stats.sentRequests}/{stats.totalContacts}</span>
              </div>
              <Progress value={requestProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {requestProgress.toFixed(1)}% of contacts reached
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connection Rate</span>
                <span>{connectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={connectionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.acceptedConnections} of {stats.sentRequests} requests accepted
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {isActive ? (
              <Button variant="destructive" onClick={onStopCampaign}>
                <Clock className="w-4 h-4 mr-2" />
                Stop Campaign
              </Button>
            ) : (
              <Button onClick={onStartCampaign} disabled={stats.totalContacts === 0}>
                <UserPlus className="w-4 h-4 mr-2" />
                Start Campaign
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open LinkedIn
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};