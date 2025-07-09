import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVData {
  profile_url: string;
  name: string;
  company?: string;
  position?: string;
  message?: string;
  [key: string]: string | undefined; // Allow any additional custom columns
}

interface CSVUploadProps {
  onDataParsed: (data: CSVData[]) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onDataParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } | null>(null);

  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationStatus(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): CSVData[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Identify custom columns (columns that aren't standard ones)
    const standardColumns = ['profile_url', 'name', 'company', 'position', 'message'];
    const customCols = headers.filter(h => !standardColumns.includes(h.toLowerCase()));
    setCustomColumns(customCols);
    
    const data: CSVData[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    return data;
  };

  const validateCSVData = (data: CSVData[]): {
    isValid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } => {
    const errors: string[] = [];
    let validRows = 0;

    if (!data.length) {
      errors.push('CSV file is empty');
      return { isValid: false, totalRows: 0, validRows: 0, errors };
    }

    // Check for required columns
    const firstRow = data[0];
    if (!firstRow.hasOwnProperty('profile_url')) {
      errors.push('Missing required column: profile_url');
    }
    if (!firstRow.hasOwnProperty('name')) {
      errors.push('Missing required column: name');
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 1;
      let isRowValid = true;

      if (!row.profile_url || !row.profile_url.trim()) {
        errors.push(`Row ${rowNum}: Missing profile URL`);
        isRowValid = false;
      } else if (!row.profile_url.includes('linkedin.com/in/')) {
        errors.push(`Row ${rowNum}: Invalid LinkedIn URL format`);
        isRowValid = false;
      }

      if (!row.name || !row.name.trim()) {
        errors.push(`Row ${rowNum}: Missing name`);
        isRowValid = false;
      }

      if (isRowValid) {
        validRows++;
      }
    });

    return {
      isValid: errors.length === 0,
      totalRows: data.length,
      validRows,
      errors
    };
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      const validation = validateCSVData(parsedData);
      
      setValidationStatus(validation);
      setCsvData(parsedData);
      
      if (validation.isValid) {
        onDataParsed(parsedData);
        toast({
          title: "CSV processed successfully",
          description: `${validation.validRows} contacts ready for campaign`,
        });
      } else {
        toast({
          title: "CSV validation failed",
          description: `Found ${validation.errors.length} errors`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-space-grotesk">
          <Upload className="w-5 h-5" />
          CSV Upload
        </CardTitle>
        <CardDescription className="font-poppins">
          Upload a CSV file with 'profile_url' and 'name' columns for LinkedIn contacts. You can include up to 3 additional custom columns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 font-poppins">
        <div className="space-y-2">
          <Label htmlFor="csv-file" className="font-medium">Choose CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">{file.name}</span>
            <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
          </div>
        )}

        <Button 
          onClick={processFile} 
          disabled={!file || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Process CSV'}
        </Button>

        {customColumns.length > 0 && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="font-medium mb-2">Custom Columns Detected:</div>
            <div className="flex flex-wrap gap-2">
              {customColumns.map((col, index) => (
                <Badge key={index} variant="outline">{col}</Badge>
              ))}
            </div>
          </div>
        )}

        {validationStatus && (
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              {validationStatus.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">
                {validationStatus.isValid ? 'Validation Passed' : 'Validation Failed'}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Total rows: {validationStatus.totalRows}, Valid rows: {validationStatus.validRows}
            </div>

            {validationStatus.errors.length > 0 && (
              <div className="mt-2">
                <div className="font-medium text-destructive mb-1">Errors:</div>
                <ul className="text-sm text-destructive space-y-1">
                  {validationStatus.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {validationStatus.errors.length > 5 && (
                    <li>... and {validationStatus.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};