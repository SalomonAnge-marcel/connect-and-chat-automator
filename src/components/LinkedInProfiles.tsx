import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Linkedin, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkedInProfile {
  id: string;
  name: string;
  email: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export const LinkedInProfiles = () => {
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const { toast } = useToast();

  const addProfile = () => {
    if (!newProfileName.trim() || !newProfileEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email for the profile",
        variant: "destructive",
      });
      return;
    }

    if (profiles.length >= 4) {
      toast({
        title: "Maximum profiles reached",
        description: "You can connect up to 4 LinkedIn profiles",
        variant: "destructive",
      });
      return;
    }

    const newProfile: LinkedInProfile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      email: newProfileEmail.trim(),
      status: 'disconnected'
    };

    setProfiles([...profiles, newProfile]);
    setNewProfileName('');
    setNewProfileEmail('');
    
    toast({
      title: "Profile added",
      description: "LinkedIn profile has been added successfully",
    });
  };

  const removeProfile = (id: string) => {
    setProfiles(profiles.filter(profile => profile.id !== id));
    toast({
      title: "Profile removed",
      description: "LinkedIn profile has been removed",
    });
  };

  const toggleConnection = (id: string) => {
    setProfiles(profiles.map(profile => {
      if (profile.id === id) {
        const newStatus = profile.status === 'connected' ? 'disconnected' : 'connected';
        toast({
          title: newStatus === 'connected' ? "Profile connected" : "Profile disconnected",
          description: `${profile.name} is now ${newStatus}`,
        });
        return { ...profile, status: newStatus };
      }
      return profile;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'pending':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-space-grotesk mb-2">LinkedIn Profiles</h2>
        <p className="text-muted-foreground font-poppins">
          Connect up to 4 LinkedIn profiles to manage multiple outreach campaigns
        </p>
      </div>

      {/* Add New Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="font-space-grotesk flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add LinkedIn Profile
          </CardTitle>
          <CardDescription className="font-poppins">
            Connect a new LinkedIn profile to your campaign ({profiles.length}/4 profiles)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profileName" className="font-poppins">Profile Name</Label>
              <Input
                id="profileName"
                placeholder="e.g., John Doe - Sales"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="font-poppins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail" className="font-poppins">LinkedIn Email</Label>
              <Input
                id="profileEmail"
                type="email"
                placeholder="e.g., john.doe@company.com"
                value={newProfileEmail}
                onChange={(e) => setNewProfileEmail(e.target.value)}
                className="font-poppins"
              />
            </div>
          </div>
          <Button 
            onClick={addProfile} 
            disabled={profiles.length >= 4}
            className="font-poppins"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Profile
          </Button>
        </CardContent>
      </Card>

      {/* Connected Profiles */}
      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-space-grotesk flex items-center gap-2">
              <Linkedin className="w-5 h-5" />
              Connected Profiles
            </CardTitle>
            <CardDescription className="font-poppins">
              Manage your connected LinkedIn profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Linkedin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium font-poppins">{profile.name}</h3>
                        {getStatusIcon(profile.status)}
                      </div>
                      <p className="text-sm text-muted-foreground font-poppins">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(profile.status)}
                    <Button
                      variant={profile.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleConnection(profile.id)}
                      className="font-poppins"
                    >
                      {profile.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProfile(profile.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};