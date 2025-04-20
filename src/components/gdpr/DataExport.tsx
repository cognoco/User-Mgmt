'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/axios'; // Use configured axios instance

export function DataExport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/gdpr/export', {
        responseType: 'blob', // Important to handle the file download
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'user_data_export.json'; // Default filename
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

      toast({
        title: t('gdpr.export.successTitle'),
        description: t('gdpr.export.successDescription'),
      });

    } catch (error: any) {
      console.error("Data export error:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.response?.data?.error || t('gdpr.export.errorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('gdpr.export.title')}</CardTitle>
        <CardDescription>{t('gdpr.export.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isLoading ? t('common.loading') : t('gdpr.export.buttonText')}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
            {t('gdpr.export.helpText')}
        </p>
      </CardContent>
    </Card>
  );
} 