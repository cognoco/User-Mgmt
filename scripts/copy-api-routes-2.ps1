# Copy profile routes
Copy-Item project/app/api/profile/business/route.ts -Destination app/api/profile/business/
Copy-Item project/app/api/profile/logo/route.ts -Destination app/api/profile/logo/
Copy-Item project/app/api/profile/privacy/route.ts -Destination app/api/profile/privacy/

# Copy settings route
Copy-Item project/app/api/settings/route.ts -Destination app/api/settings/

# Copy admin routes
Copy-Item project/app/api/admin/users/route.ts -Destination app/api/admin/users/
Copy-Item project/src/app/api/admin/dashboard/route.ts -Destination app/api/admin/dashboard/

# Copy root API route
Copy-Item project/app/api/route.ts -Destination app/api/ 