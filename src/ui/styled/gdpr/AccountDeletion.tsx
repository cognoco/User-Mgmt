'use client';

import React, { useState } from 'react';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/primitives/alert-dialog"
import { useToast } from "@/ui/primitives/use-toast";
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/hooks/auth/useAuth';

export function AccountDeletion() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, might need to pass password confirmation here
      const response = await api.post('/api/gdpr/delete');

      toast({
        title: t('gdpr.delete.successTitle'),
        description: response.data.message || t('gdpr.delete.successDescription'),
      });

      // Wait a bit for toast to show, then log out
      setTimeout(() => {
          logout();
          // Optionally redirect to home page or login page
          // window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') { console.error("Account deletion error:", error); }
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: error.response?.data?.error || t('gdpr.delete.errorDescription'),
      });
      setIsLoading(false); // Only set loading false on error, on success user is signed out
    }
     // Keep dialog open on error 
    // setIsConfirmOpen(false); // Close dialog on success is handled by sign out
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">{t('gdpr.delete.title')}</CardTitle>
        <CardDescription>{t('gdpr.delete.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isLoading ? t('common.loading') : t('gdpr.delete.buttonText')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <AlertTriangle className="inline-block mr-2 h-5 w-5 text-destructive" />
                {t('gdpr.delete.confirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                 {t('gdpr.delete.confirmDescription1')} 
                 <strong className="text-destructive">{t('gdpr.delete.confirmDescription2')}</strong>
                 {t('gdpr.delete.confirmDescription3')}
                 {/* Add input for password confirmation here in real implementation */}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   t('gdpr.delete.confirmButton')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground mt-3">
            {t('gdpr.delete.helpText')}
        </p>
      </CardContent>
    </Card>
  );
} 