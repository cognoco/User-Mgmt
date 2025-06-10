Plan to Finalize Phase 9: API Integration
Based on my analysis of the current implementation, here's a comprehensive plan to properly finalize Phase 9 of the API Integration according to the architecture guidelines:

1. Audit Current API Implementation
Create an API Inventory:
List all API endpoints across all domains (auth, user, team, permissions)
Categorize them by implementation status (fully migrated, partially migrated, not migrated)
Identify common patterns and inconsistencies
Define Compliance Criteria:
API routes should use service interfaces via factory methods
No direct database access (Supabase, Prisma) in API routes
Proper error handling and response formatting
Consistent validation patterns using Zod schemas
Proper use of middleware (security, rate limiting)

2. Implement Domain-Specific API Factories
Create/Update API Service Factories:
Create or enhance factory functions for each domain:
typescript
CopyInsert
// src/lib/api/user/factory.ts
export function getApiUserService(): UserService {
  return getUserManagementConfig().services.userService;
}
Ensure All Domains Have Factories:
Auth: getApiAuthService()
User: getApiUserService()
Team: getApiTeamService()
Permission: getApiPermissionService()
3. Refactor API Endpoints by Domain
3.1. Profile API Refactoring
Update Avatar Endpoint:
Replace direct Supabase calls with adapter interfaces
Use getApiUserService() for user operations
Move file storage logic to a dedicated adapter
Update Other Profile Endpoints:
Apply the same pattern to all profile-related endpoints
Ensure consistent error handling and validation
3.2. Team API Refactoring
Update Team Members Endpoint:
Replace direct Prisma calls with team service methods
Use getApiTeamService() for team operations
Implement proper pagination through service interfaces
Update Team Invitations Endpoints:
Apply the same pattern to invitation endpoints
Ensure proper validation and error handling
3.3. Permission API Refactoring
Update Role Endpoints:
Replace direct database access with permission service methods
Use getApiPermissionService() for permission operations
Ensure proper validation and error handling
4. Implement Common API Utilities
Create API Response Helpers:
typescript
CopyInsert
// src/lib/api/utils/response.ts
export function createApiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function createApiErrorResponse(error: string, status = 400, details?: any) {
  return NextResponse.json({ error, details }, { status });
}
Create API Request Validation Helpers:
typescript
CopyInsert
// src/lib/api/utils/validation.ts
export async function validateRequestBody<T>(
  request: NextRequest, 
  schema: z.ZodSchema<T>
): Promise<[T | null, ApiError | null]> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return [null, { message: 'Validation failed', details: result.error.errors }];
    }
    return [result.data, null];
  } catch (e) {
    return [null, { message: 'Invalid request body' }];
  }
}
5. Testing and Validation
Create API Integration Tests:
Test each refactored endpoint with proper mocking
Verify correct service and adapter usage
Test error handling and edge cases
Create API Compliance Checker:
Implement a static analysis tool or script to verify:
No direct database imports in API routes
Proper use of service factories
Consistent error handling patterns
