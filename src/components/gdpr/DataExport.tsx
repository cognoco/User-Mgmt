'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/axios';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/lib/utils/responsive';
import { Progress } from '@/components/ui/progress';

// Define export formats
enum ExportFormat {
  JSON = 'json',
  CSV = 'csv'
}

export function DataExport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [exportProgress, setExportProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const isMobile = useIsMobile();

  const handleExport = async () => {
    setIsLoading(true);
    setExportProgress(0);
    setShowSuccess(false);
    
    // Simulate progress for better UX feedback
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        // Randomly increase progress up to 90% (the actual completion will push to 100%)
        const increase = Math.random() * 10;
        const newValue = Math.min(prev + increase, 90);
        return newValue;
      });
    }, 500);

    try {
      const response = await api.get(`/api/gdpr/export?format=${format}`, {
        responseType: 'blob',
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `user_data_export.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Complete progress and show success
      setExportProgress(100);
      setShowSuccess(true);
      
      toast({
        title: t('gdpr.export.successTitle'),
        description: t('gdpr.export.successDescription'),
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') { console.error("Data export error:", error); }
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.response?.data?.error || t('gdpr.export.errorDescription'),
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('gdpr.export.title')}</CardTitle>
        <CardDescription>{t('gdpr.export.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('gdpr.export.format')}</h3>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as ExportFormat)}
            className={isMobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2"}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.JSON} id="json" />
              <Label htmlFor="json" className="cursor-pointer">JSON</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={ExportFormat.CSV} id="csv" />
              <Label htmlFor="csv" className="cursor-pointer">CSV</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Progress Indicator */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('gdpr.export.preparing')}</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}
        
        {/* Success Message */}
        {showSuccess && (
          <Alert className="bg-green-50 border-green-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">
              {t('gdpr.export.successDescription')}
            </AlertDescription>
          </Alert>
        )}
        
        <p className="text-xs text-muted-foreground">
          {t('gdpr.export.helpText')}
        </p>
      </CardContent>
      <CardFooter className={isMobile ? "flex-col space-y-4" : "flex-row justify-between"}>
        <Button 
          onClick={handleExport} 
          disabled={isLoading} 
          className={isMobile ? "w-full" : ""}
          {...(isLoading ? { role: "status" } : {})}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isLoading ? t('common.loading') : t('gdpr.export.buttonText')}
        </Button>
        
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>{t('gdpr.export.dataPrivacyNote')}</span>
        </div>
      </CardFooter>
    </Card>
  );
} 