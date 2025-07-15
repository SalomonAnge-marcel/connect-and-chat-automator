import React from 'react';
import { Plus, Users, MessageSquare, TrendingUp, Play, Pause, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Campaign {
  name: string;
  sent: number;
  connected: number;
  messages: number;
  replies: number;
  status: 'completed' | 'running' | 'pending';
  createdAt: string;
}

interface DashboardProps {
  onCreateCampaign: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateCampaign }) => {
  const campaigns: Campaign[] = [
    {
      name: "Outreach Campaign #1",
      sent: 150,
      connected: 45,
      messages: 30,
      replies: 12,
      status: "completed",
      createdAt: "2024-01-15"
    },
    {
      name: "Sales Prospecting",
      sent: 89,
      connected: 23,
      messages: 15,
      replies: 5,
      status: "running",
      createdAt: "2024-01-20"
    }
  ];
  const navigate = useNavigate();
  const [showAccounts, setShowAccounts] = useState(false);
  const accounts = [
    { name: "john.doe@gmail.com", status: "connected" },
    { name: "jane.smith@gmail.com", status: "disconnected" },
    { name: "alex.lee@gmail.com", status: "connected" },
  ];

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My LinkedIn Campaigns</h1>
          <p className="text-muted-foreground">Manage and track your LinkedIn outreach campaigns</p>
        </div>
        <Button onClick={onCreateCampaign} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">239</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">28.5% acceptance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">66% message rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17</div>
            <p className="text-xs text-muted-foreground">37.8% reply rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Connected</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/campaign/${encodeURIComponent(campaign.name)}`)}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.sent}</TableCell>
                  <TableCell>{campaign.connected}</TableCell>
                  <TableCell>{campaign.messages}</TableCell>
                  <TableCell>{campaign.replies}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>{campaign.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sidebar Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer hover:underline"
            onClick={() => setShowAccounts(true)}
            title="View connected LinkedIn accounts"
          >
            <span className="text-sm">LinkedIn Accounts Connected</span>
            <Badge variant="outline">{accounts.filter(a => a.status === "connected").length} / {accounts.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Credits Remaining</span>
            <Badge variant="outline">500</Badge>
          </div>
        </CardContent>
      </Card>
      {/* Modal for LinkedIn Accounts */}
      <Dialog open={showAccounts} onOpenChange={setShowAccounts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-space-grotesk">LinkedIn Accounts</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 font-poppins">
            {accounts.map((acc) => (
              <li key={acc.name} className="flex justify-between items-center">
                <span>{acc.name}</span>
                <span
                  className={
                    acc.status === "connected"
                      ? "text-green-600 font-medium"
                      : "text-gray-400 font-medium"
                  }
                >
                  {acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
};