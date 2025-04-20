'use client'; // Assuming ForgotPasswordForm uses client hooks

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'; // Adjust path if needed

export default function ResetPasswordPage() {
  return (
    <div className="container max-w-md mx-auto py-12"> {/* Use container and standard padding */} 
      <div className="bg-card rounded-lg shadow p-6"> {/* Use theme-aware background */} 
        <div className="text-center mb-6"> {/* Add margin bottom */} 
          <h1 className="text-3xl font-bold">Reset your password</h1> {/* Use h1 */} 
          <p className="mt-2 text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
} 