import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Lead {
  profile_url: string;
  name: string;
  company?: string;
  position?: string;
}

interface Step1Props {
  data: any;
  onUpdate: (updates: any) => void;
}

export const Step1ImportLeads: React.FC<Step1Props> = ({ data, onUpdate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Store headers for dynamic preview
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        setCsvHeaders(headers);

        // Check required columns
        if (!headers.includes('profile_url') || !headers.includes('name')) {
          setError('CSV must contain profile_url and name columns');
          return;
        }

        const leads: Lead[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const lead: Lead = {
              profile_url: values[headers.indexOf('profile_url')]?.trim() || '',
              name: values[headers.indexOf('name')]?.trim() || '',
            };

            // Optional columns
            if (headers.includes('company')) {
              lead.company = values[headers.indexOf('company')]?.trim();
            }
            if (headers.includes('position')) {
              lead.position = values[headers.indexOf('position')]?.trim();
            }

            if (lead.profile_url && lead.name) {
              leads.push(lead);
            }
          }
        }

        if (leads.length === 0) {
          setError('No valid leads found in CSV');
          return;
        }

        setError(null);
        onUpdate({ leads });
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload your LinkedIn leads</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your CSV file here, or click to browse
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <Button asChild variant="outline">
          <label htmlFor="csv-upload" className="cursor-pointer">
            Choose File
          </label>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success and Preview */}
      {data.leads.length > 0 && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully imported {data.leads.length} leads
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-2">Preview (first 5 leads)</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  {csvHeaders.map(header => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leads.slice(0, 5).map((lead: any, index: number) => (
                  <TableRow key={index}>
                    {csvHeaders.map(header => (
                      <TableCell key={header}>{lead[header] || '-'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Column Requirements */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Required CSV Columns:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li><strong>profile_url:</strong> Full LinkedIn profile URL (required)</li>
          <li><strong>first_name:</strong> Contact's first name (required)</li>
          <li><strong>last_name:</strong> Contact's last name (required)</li>
          <li><strong>company:</strong> Company name (optional)</li>
          <li><strong>position:</strong> Job title (optional)</li>
        </ul>
      </div>
    </div>
  );
};