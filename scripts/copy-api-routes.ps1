# Copy 2FA routes
Copy-Item project/app/api/2fa/backup-codes/route.ts -Destination app/api/2fa/backup-codes/
Copy-Item project/app/api/2fa/disable/route.ts -Destination app/api/2fa/disable/
Copy-Item project/app/api/2fa/setup/route.ts -Destination app/api/2fa/setup/
Copy-Item project/app/api/2fa/verify/route.ts -Destination app/api/2fa/verify/

# Copy auth routes
Copy-Item project/app/api/auth/account/route.ts -Destination app/api/auth/account/
Copy-Item project/app/api/auth/login/route.ts -Destination app/api/auth/login/
Copy-Item project/app/api/auth/logout/route.ts -Destination app/api/auth/logout/
Copy-Item project/app/api/auth/mfa/verify/route.ts -Destination app/api/auth/mfa/verify/
Copy-Item project/app/api/auth/oauth/callback/route.ts -Destination app/api/auth/oauth/callback/
Copy-Item project/app/api/auth/oauth/disconnect/route.ts -Destination app/api/auth/oauth/disconnect/
Copy-Item project/app/api/auth/register/route.ts -Destination app/api/auth/register/
Copy-Item project/app/api/auth/reset-password/route.ts -Destination app/api/auth/reset-password/
Copy-Item project/app/api/auth/send-verification-email/route.ts -Destination app/api/auth/send-verification-email/
Copy-Item project/app/api/auth/update-password/route.ts -Destination app/api/auth/update-password/ 