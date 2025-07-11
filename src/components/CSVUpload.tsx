import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVData {
  profile_url: string;
  first_name: string;
  last_name: string;
  company?: string;
  position?: string;
  message?: string;
  [key: string]: string | undefined; // Allow any additional custom columns
}

interface ColumnMapping {
  [csvColumn: string]: string | null; // Maps CSV column names to our expected column names
}

interface CSVUploadProps {
  onDataParsed: (data: CSVData[]) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onDataParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [showMapping, setShowMapping] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } | null>(null);

  const { toast } = useToast();

  const requiredColumns = ['profile_url', 'first_name', 'last_name'];
  const optionalColumns = ['company', 'position', 'message'];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationStatus(null);
      setShowMapping(false);
      
      // Parse headers immediately to show mapping interface
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);
      
      // Auto-map columns that match exactly
      const autoMapping: ColumnMapping = {};
      [...requiredColumns, ...optionalColumns].forEach(expectedCol => {
        const matchedHeader = headers.find(h => 
          h.toLowerCase() === expectedCol.toLowerCase() ||
          h.toLowerCase().replace(/[_\s]/g, '') === expectedCol.toLowerCase().replace(/[_\s]/g, '')
        );
        if (matchedHeader) {
          autoMapping[matchedHeader] = expectedCol;
        }
      });
      setColumnMapping(autoMapping);
      setShowMapping(true);
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
    
    const data: CSVData[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        // Map CSV columns to our expected columns based on user mapping
        headers.forEach((header, index) => {
          const mappedColumn = columnMapping[header];
          if (mappedColumn) {
            row[mappedColumn] = values[index] || '';
          } else {
            // Keep unmapped columns as custom columns
            row[header] = values[index] || '';
          }
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

    // Check for required columns mapping
    const mappedRequiredColumns = Object.values(columnMapping).filter(col => 
      requiredColumns.includes(col || '')
    );
    
    requiredColumns.forEach(col => {
      if (!mappedRequiredColumns.includes(col)) {
        errors.push(`Missing required column mapping: ${col}`);
      }
    });

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

      if (!row.first_name || !row.first_name.trim()) {
        errors.push(`Row ${rowNum}: Missing first name`);
        isRowValid = false;
      }

      if (!row.last_name || !row.last_name.trim()) {
        errors.push(`Row ${rowNum}: Missing last name`);
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
          Upload a CSV file with LinkedIn contacts. Required columns: profile_url, first_name, last_name. Optional: company, position, message.
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

        {showMapping && csvHeaders.length > 0 && (
          <Card className="p-4 border-2 border-primary/20">
            <div className="font-medium mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Map CSV Columns to Required Fields
            </div>
            <div className="space-y-3">
              {[...requiredColumns, ...optionalColumns].map((expectedCol) => (
                <div key={expectedCol} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium">
                    {expectedCol}
                    {requiredColumns.includes(expectedCol) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={
                      Object.entries(columnMapping).find(([_, mapped]) => mapped === expectedCol)?.[0] || "none"
                    }
                    onValueChange={(value) => {
                      // Remove any existing mapping to this expected column
                      const newMapping = { ...columnMapping };
                      Object.keys(newMapping).forEach(key => {
                        if (newMapping[key] === expectedCol) {
                          newMapping[key] = null;
                        }
                      });
                      // Set new mapping
                      if (value && value !== "none") {
                        newMapping[value] = expectedCol;
                      }
                      setColumnMapping(newMapping);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select CSV column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No mapping</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button 
          onClick={processFile} 
          disabled={!file || isProcessing || !showMapping}
        >
          {isProcessing ? 'Processing...' : 'Process CSV'}
        </Button>

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