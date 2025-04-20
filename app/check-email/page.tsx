'use client';

import { Button } from "@/components/ui/button";
import { useAuthStore } from '@/lib/stores/auth.store';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck, AlertCircle, MailWarning } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState<string | null>(null);
    const [isReregisterAttempt, setIsReregisterAttempt] = useState(false);
    const [isValidAccess, setIsValidAccess] = useState(false);

    const { 
        sendVerificationEmail, 
        isLoading, 
        error, 
        successMessage, 
        clearError, 
        clearSuccessMessage 
    } = useAuthStore((state) => ({
        sendVerificationEmail: state.sendVerificationEmail,
        isLoading: state.isLoading,
        error: state.error,
        successMessage: state.successMessage,
        clearError: state.clearError,
        clearSuccessMessage: state.clearSuccessMessage,
    }));

    useEffect(() => {
        const emailFromQuery = searchParams.get('email');
        const reregisterFlag = searchParams.get('reregister') === 'true';
        
        if (emailFromQuery) {
            setEmail(decodeURIComponent(emailFromQuery));
            setIsReregisterAttempt(reregisterFlag);
            setIsValidAccess(true);
            clearError();
            clearSuccessMessage();
        } else {
            console.warn('CheckEmailPage accessed without email parameter.');
            setIsValidAccess(false);
        }

        return () => {
            clearError();
            clearSuccessMessage();
        }
    }, [searchParams, clearError, clearSuccessMessage]);

    const handleResend = async () => {
        if (!email) {
            console.error('Cannot resend email, email address not found.');
            return;
        }
        clearError();
        clearSuccessMessage();
        console.log(`Resending verification email to: ${email}`);
        await sendVerificationEmail(email);
    };

    let title = "Check Your Inbox";
    let icon = <MailCheck className="mx-auto h-16 w-16 text-green-500" />;
    let description = (
        <p className="text-muted-foreground">
            Registration successful! We&apos;ve sent a verification link to
            {email ? <strong className="font-medium"> {email}</strong> : ' your email address'}.
            Please click the link in the email to activate your account.
        </p>
    );

    if (isReregisterAttempt && isValidAccess) {
        title = "Verification Email Sent";
        description = (
            <p className="text-muted-foreground">
                It looks like you&apos;ve already started the registration process. 
                We&apos;ve sent a <strong>new</strong> verification link to
                {email ? <strong className="font-medium"> {email}</strong> : ' your email address'}.
                Please click the latest link in your email to activate your account.
            </p>
        );
    }

    if (!isValidAccess) {
        title = "Missing Information";
        icon = <MailWarning className="mx-auto h-16 w-16 text-yellow-500" />;
        description = (
            <Alert variant="default" className="text-left bg-yellow-50 border-yellow-300 text-yellow-800">
                <AlertTitle>Cannot Proceed</AlertTitle>
                <AlertDescription>
                    It seems you&apos;ve landed here directly. Please <a href="/register" className="underline">register</a> or <a href="/login" className="underline">login</a> first.
                    If you were expecting to resend a verification email, please ensure you followed the correct link.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container max-w-md mx-auto py-12">
            <div className="bg-card rounded-lg shadow p-8 text-center space-y-6">
                
                {icon}

                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                
                {description}

                {isValidAccess && successMessage && (
                    <Alert variant="default" className="text-left bg-green-100 border-green-300 text-green-800">
                        <AlertTitle>Email Sent</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                {isValidAccess && error && (
                    <Alert variant="destructive" className="text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3 pt-4">
                    {isValidAccess && (
                        <Button 
                            onClick={handleResend}
                            disabled={isLoading || !email}
                            className="w-full"
                            variant="secondary"
                        >
                            {isLoading ? 'Sending...' : 'Resend Verification Email'}
                        </Button>
                    )}
                    
                    <Button 
                        onClick={() => router.push('/login')}
                        className="w-full"
                        variant="outline"
                    >
                        Return to Login
                    </Button>
                </div>

            </div>
        </div>
    );
} 