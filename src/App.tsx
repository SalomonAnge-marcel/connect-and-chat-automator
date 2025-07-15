import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const campaignList = [
  {
    name: "Outreach Campaign #1",
    sent: 150,
    connected: 45,
    messages: 30,
    replies: 12,
    status: "completed",
    createdAt: "2024-01-15",
    leads: [
      { name: "Gustavo Gouse", profile_url: "https://linkedin.com/in/gustavo", company: "Acme Inc", position: "Manager" },
      { name: "Mira Siphon", profile_url: "https://linkedin.com/in/mira", company: "Beta LLC", position: "Sales" },
      { name: "Maria Saris", profile_url: "https://linkedin.com/in/maria", company: "Gamma Ltd", position: "Engineer" },
    ],
  },
  {
    name: "Sales Prospecting",
    sent: 89,
    connected: 23,
    messages: 15,
    replies: 5,
    status: "running",
    createdAt: "2024-01-20",
    leads: [
      { name: "John Doe", profile_url: "https://linkedin.com/in/johndoe", company: "Delta Corp", position: "BDR" },
      { name: "Jane Smith", profile_url: "https://linkedin.com/in/janesmith", company: "Epsilon Inc", position: "AE" },
    ],
  },
];

const CampaignDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const campaign = campaignList.find(c => c.name === name);
  if (!campaign) {
    return (
      <div className="min-h-screen px-[10rem] py-[5rem] bg-background flex flex-col items-center justify-center font-poppins">
        <h1 className="text-3xl font-bold mb-4">Campaign Not Found</h1>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Dashboard</button>
      </div>
    );
  }
  // Analytics
  const acceptanceRate = campaign.sent > 0 ? (campaign.connected / campaign.sent) * 100 : 0;
  const replyRate = campaign.messages > 0 ? (campaign.replies / campaign.messages) * 100 : 0;
  // Chart data (mocked for now)
  const chartData = [
    { month: 'Jan', Sent: campaign.sent - 20, Connected: campaign.connected - 10 },
    { month: 'Feb', Sent: campaign.sent - 10, Connected: campaign.connected - 5 },
    { month: 'Mar', Sent: campaign.sent, Connected: campaign.connected },
  ];
  return (
    <div className="min-h-screen px-[10rem] py-[5rem] bg-background font-poppins">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">{campaign.name}</h1>
            <p className="text-muted-foreground">Created: {campaign.createdAt}</p>
          </div>
          <button
            className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary/90 transition"
            onClick={() => navigate("/")}
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.connected}</div>
              <div className="text-xs text-muted-foreground">{acceptanceRate.toFixed(1)}% acceptance</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.messages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Replies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.replies}</div>
              <div className="text-xs text-muted-foreground">{replyRate.toFixed(1)}% reply rate</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-space-grotesk">Campaign Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Sent" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="Connected" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-space-grotesk">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Profile URL</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.leads.map((lead, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>
                      <a href={lead.profile_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        {lead.profile_url}
                      </a>
                    </TableCell>
                    <TableCell>{lead.company || '-'}</TableCell>
                    <TableCell>{lead.position || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaign/:name" element={<CampaignDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
