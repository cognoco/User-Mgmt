
.next/types/app/api/company/notifications/preferences/[id]/route.ts(283,7): error TS2344: Type '{ __tag__: "PATCH"; 
__param_position__: "second"; __param_type__: { params: { id: string; }; }; }' does not satisfy the constraint 
'ParamCheck<RouteContext>'.
  The types of '__param_type__.params' are incompatible between these types.
    Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, 
[Symbol.toStringTag]
.next/types/app/api/company/notifications/recipients/[id]/route.ts(244,7): error TS2344: Type '{ __tag__: "DELETE"; 
__param_position__: "second"; __param_type__: { params: { id: string; }; }; }' does not satisfy the constraint 
'ParamCheck<RouteContext>'.
  The types of '__param_type__.params' are incompatible between these types.
    Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally, 
[Symbol.toStringTag]
app/api/admin/dashboard/route.ts(4,10): error TS2459: Module '"@/types/rbac"' declares 'Role' locally, but it is not 
exported.
app/api/admin/saved-searches/[id]/route.ts(82,47): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
app/api/admin/saved-searches/[id]/route.ts(87,47): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
app/api/admin/saved-searches/route.ts(67,47): error TS2693: 'Permission' only refers to a type, but is being used as a value 
here.
app/api/admin/saved-searches/route.ts(72,47): error TS2693: 'Permission' only refers to a type, but is being used as a value 
here.
app/api/admin/users/[id]/__tests__/route.test.ts(80,20): error TS2554: Expected 1 arguments, but got 2.
app/api/admin/users/[id]/__tests__/route.test.ts(86,20): error TS2554: Expected 1 arguments, but got 2.
app/api/admin/users/[id]/__tests__/route.test.ts(94,23): error TS2554: Expected 1 arguments, but got 2.
app/api/admin/users/route.ts(62,47): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
app/api/auth/account/route.ts(61,56): error TS2345: Argument of type '{ userId: any; password: string; }' is not assignable 
to parameter of type 'string'.
app/api/auth/account/route.ts(67,19): error TS2339: Property 'success' does not exist on type 'void'.
app/api/auth/account/route.ts(68,75): error TS2339: Property 'error' does not exist on type 'void'.
app/api/auth/account/route.ts(79,36): error TS2339: Property 'error' does not exist on type 'void'.
app/api/auth/account/route.ts(83,20): error TS2339: Property 'error' does not exist on type 'void'.
app/api/auth/account/route.ts(92,20): error TS2339: Property 'error' does not exist on type 'void'.
app/api/auth/check-permission/__tests__/route.test.ts(25,3): error TS2532: Object is possibly 'undefined'.
app/api/auth/check-permissions/__tests__/route.test.ts(23,3): error TS2532: Object is possibly 'undefined'.
app/api/auth/check-role/__tests__/route.test.ts(23,3): error TS2532: Object is possibly 'undefined'.
app/api/auth/oauth/__tests__/route.test.ts(110,5): error TS2322: Type '(request: NextRequest) => 
Promise<NextResponse<unknown>>' is not assignable to type '(req: Request) => Promise<Response>'.
  Types of parameters 'request' and 'req' are incompatible.
    Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/auth/oauth/callback/__tests__/route.test.ts(13,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(70,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(90,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(104,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(118,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(133,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(154,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(173,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-check/__tests__/route.test.ts(188,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(59,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(81,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(95,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(109,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(123,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/domains/[id]/verify-initiate/__tests__/route.test.ts(135,54): error TS2353: Object literal may only specify 
known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.
app/api/company/validate/__tests__/route.test.ts(9,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/company/validate/__tests__/route.test.ts(16,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/company/validate/__tests__/route.test.ts(23,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/health/__tests__/route.test.ts(16,28): error TS2554: Expected 1 arguments, but got 0.
app/api/openapi/__tests__/route.test.ts(9,27): error TS2554: Expected 0 arguments, but got 1.
app/api/organizations/[orgId]/__tests__/route.test.ts(30,89): error TS2353: Object literal may only specify known 
properties, and 'orgId' does not exist in type 'Promise<{ orgId: string; }>'.
app/api/organizations/[orgId]/__tests__/route.test.ts(38,44): error TS2353: Object literal may only specify known 
properties, and 'orgId' does not exist in type 'Promise<{ orgId: string; }>'.
app/api/organizations/[orgId]/__tests__/route.test.ts(44,95): error TS2353: Object literal may only specify known 
properties, and 'orgId' does not exist in type 'Promise<{ orgId: string; }>'.
app/api/organizations/[orgId]/members/__tests__/route.test.ts(29,89): error TS2353: Object literal may only specify known 
properties, and 'orgId' does not exist in type 'Promise<{ orgId: string; }>'.
app/api/organizations/[orgId]/members/__tests__/route.test.ts(37,45): error TS2353: Object literal may only specify known 
properties, and 'orgId' does not exist in type 'Promise<{ orgId: string; }>'.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(45,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(66,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(77,49): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(99,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(125,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(149,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(160,49): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(185,43): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/[idpType]/config/__tests__/route.test.ts(200,41): error TS2554: Expected 1 arguments, but 
got 2.
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(46,43): error TS2345: Argument of type '{ params: { orgId: string; 
}; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(63,43): error TS2345: Argument of type '{ params: { orgId: string; 
}; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(82,43): error TS2345: Argument of type '{ params: { orgId: string; 
}; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(110,43): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(121,49): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(141,43): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(162,26): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/__tests__/route.test.ts(168,55): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(19,43): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(38,30): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(45,43): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(69,44): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(90,44): error TS2345: Argument of type '{ params: { orgId: 
string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(106,32): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(117,50): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(135,30): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(146,52): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(153,49): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/organizations/[orgId]/sso/domains/__tests__/route.test.ts(168,46): error TS2345: Argument of type '{ params: { 
orgId: string; }; }' is not assignable to parameter of type '{ params: Promise<{ orgId: string; }>; }'.
  Types of property 'params' are incompatible.
    Type '{ orgId: string; }' is missing the following properties from type 'Promise<{ orgId: string; }>': then, catch, 
finally, [Symbol.toStringTag]
app/api/permissions/__tests__/route.test.ts(19,46): error TS2339: Property 'mockResolvedValue' does not exist on type '() => 
Promise<Permission[]>'.
app/api/profile/__tests__/route.test.ts(100,7): error TS2532: Object is possibly 'undefined'.
app/api/profile/__tests__/route.test.ts(105,7): error TS2532: Object is possibly 'undefined'.
app/api/profile/__tests__/route.test.ts(131,7): error TS2532: Object is possibly 'undefined'.
app/api/profile/route.ts(101,68): error TS2559: Type '{ bio?: string | null | undefined; location?: string | null | 
undefined; website?: string | null | undefined; phoneNumber?: string | null | undefined; }' has no properties in common with 
type 'ProfileUpdatePayload'.
app/api/resources/[type]/[id]/permissions/__tests__/route.test.ts(28,5): error TS18048: 
'mockService.getPermissionsForResource' is possibly 'undefined'.
app/api/resources/[type]/[id]/permissions/__tests__/route.test.ts(28,43): error TS2339: Property 'mockResolvedValue' does 
not exist on type '(resourceType: string, resourceId: string) => Promise<ResourcePermission[]>'.
app/api/resources/relationships/route.ts(67,51): error TS2345: Argument of type '(req: NextRequest) => Promise<Response>' is 
not assignable to parameter of type 'RouteHandler'.
  Type 'Promise<Response>' is not assignable to type 'Promise<NextResponse<unknown>>'.
    Type 'Response' is missing the following properties from type 'NextResponse<unknown>': cookies, [INTERNALS]
app/api/roles/[roleId]/__tests__/route.test.ts(28,5): error TS18048: 'mockService.getRoleById' is possibly 'undefined'.
app/api/roles/[roleId]/__tests__/route.test.ts(28,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(roleId: string) => Promise<RoleWithPermissions | null>'.
app/api/roles/[roleId]/__tests__/route.test.ts(35,5): error TS18048: 'mockService.updateRole' is possibly 'undefined'.
app/api/roles/[roleId]/__tests__/route.test.ts(35,28): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(roleId: string, roleData: RoleUpdatePayload, performedBy?: string | undefined, reason?: string | undefined, ticket?: 
string | undefined) => Promise<RoleWithPermissions>'.
app/api/roles/[roleId]/__tests__/route.test.ts(43,5): error TS18048: 'mockService.updateRole' is possibly 'undefined'.
app/api/roles/[roleId]/__tests__/route.test.ts(43,28): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(roleId: string, roleData: RoleUpdatePayload, performedBy?: string | undefined, reason?: string | undefined, ticket?: 
string | undefined) => Promise<RoleWithPermissions>'.
app/api/roles/[roleId]/__tests__/route.test.ts(50,5): error TS18048: 'mockService.deleteRole' is possibly 'undefined'.
app/api/roles/[roleId]/__tests__/route.test.ts(50,28): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(roleId: string, performedBy?: string | undefined, reason?: string | undefined, ticket?: string | undefined) => 
Promise<boolean>'.
app/api/roles/[roleId]/hierarchy/__tests__/route.test.ts(21,38): error TS2554: Expected 1 arguments, but got 2.
app/api/roles/[roleId]/hierarchy/__tests__/route.test.ts(30,39): error TS2554: Expected 1 arguments, but got 2.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(28,5): error TS18048: 'mockService.getRolePermissions' is 
possibly 'undefined'.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(28,36): error TS2339: Property 'mockResolvedValue' does not exist 
on type '(roleId: string) => Promise<Permission[]>'.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(36,5): error TS18048: 'mockService.addPermissionToRole' is 
possibly 'undefined'.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(36,37): error TS2339: Property 'mockResolvedValue' does not exist 
on type '(roleId: string, permission: Permission) => Promise<PermissionAssignment>'.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(44,5): error TS18048: 'mockService.removePermissionFromRole' is 
possibly 'undefined'.
app/api/roles/[roleId]/permissions/__tests__/route.test.ts(44,42): error TS2339: Property 'mockResolvedValue' does not exist 
on type '(roleId: string, permission: Permission) => Promise<boolean>'.
app/api/roles/__tests__/route.test.ts(27,5): error TS18048: 'mockService.getAllRoles' is possibly 'undefined'.
app/api/roles/__tests__/route.test.ts(27,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => 
Promise<RoleWithPermissions[]>'.
app/api/roles/__tests__/route.test.ts(35,5): error TS18048: 'mockService.getAllRoles' is possibly 'undefined'.
app/api/roles/__tests__/route.test.ts(35,29): error TS2339: Property 'mockResolvedValue' does not exist on type '() => 
Promise<RoleWithPermissions[]>'.
app/api/roles/__tests__/route.test.ts(44,5): error TS18048: 'mockService.createRole' is possibly 'undefined'.
app/api/roles/__tests__/route.test.ts(44,28): error TS2339: Property 'mockResolvedValue' does not exist on type '(roleData: 
RoleCreationPayload, performedBy?: string | undefined, reason?: string | undefined, ticket?: string | undefined) => 
Promise<RoleWithPermissions>'.
app/api/session/__tests__/route.test.ts(43,56): error TS2304: Cannot find name 'NextResponse'.
app/api/session/__tests__/route.test.ts(66,56): error TS2304: Cannot find name 'NextResponse'.
app/api/settings/route.ts(40,63): error TS2345: Argument of type '{ language?: string | undefined; theme?: "light" | "dark" 
| "system" | undefined; notifications?: { push?: boolean | undefined; email?: boolean | undefined; marketing?: boolean | 
undefined; } | undefined; itemsPerPage?: number | undefined; timezone?: string | undefined; dateFormat?: string | undefined; 
}' is not assignable to parameter of type '{ language?: string | undefined; theme?: "light" | "dark" | "system" | undefined; 
notifications?: { push: boolean; email: boolean; marketing: boolean; } | undefined; itemsPerPage?: number | undefined; 
timezone?: string | undefined; dateFormat?: string | undefined; }'.
  Types of property 'notifications' are incompatible.
    Type '{ push?: boolean | undefined; email?: boolean | undefined; marketing?: boolean | undefined; } | undefined' is not 
assignable to type '{ push: boolean; email: boolean; marketing: boolean; } | undefined'.
      Type '{ push?: boolean | undefined; email?: boolean | undefined; marketing?: boolean | undefined; }' is not assignable 
to type '{ push: boolean; email: boolean; marketing: boolean; }'.
        Types of property 'push' are incompatible.
          Type 'boolean | undefined' is not assignable to type 'boolean'.
            Type 'undefined' is not assignable to type 'boolean'.
app/api/sso/__tests__/route.test.ts(36,27): error TS2345: Argument of type 'Request' is not assignable to parameter of type 
'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/sso/__tests__/route.test.ts(49,28): error TS2345: Argument of type 'Request' is not assignable to parameter of type 
'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/sso/__tests__/route.test.ts(57,28): error TS2345: Argument of type 'Request' is not assignable to parameter of type 
'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/subscription/__tests__/route.test.ts(8,23): error TS2554: Expected 1 arguments, but got 0.
app/api/subscription/__tests__/route.test.ts(15,28): error TS2345: Argument of type 'Request' is not assignable to parameter 
of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/subscription/__tests__/route.test.ts(23,28): error TS2345: Argument of type 'Request' is not assignable to parameter 
of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/subscription/route.ts(21,20): error TS2339: Property 'stripe_subscription_id' does not exist on type '{ id: string; 
status: SubscriptionStatus; userId: string; planId: string; startDate: string | Date; metadata?: Record<string, any> | 
undefined; endDate?: string | ... 1 more ... | undefined; renewalDate?: string | ... 1 more ... | undefined; canceledAt?: 
string | ... 1 more ... | undefined; paymentMethod?: string | ...'.
app/api/subscription/route.ts(23,68): error TS2339: Property 'stripe_subscription_id' does not exist on type '{ id: string; 
status: SubscriptionStatus; userId: string; planId: string; startDate: string | Date; metadata?: Record<string, any> | 
undefined; endDate?: string | ... 1 more ... | undefined; renewalDate?: string | ... 1 more ... | undefined; canceledAt?: 
string | ... 1 more ... | undefined; paymentMethod?: string | ...'.
app/api/subscription/route.ts(75,5): error TS2322: Type 'Status' is not assignable to type 'SubscriptionStatus | undefined'.
  Type '"active"' is not assignable to type 'SubscriptionStatus | undefined'.
app/api/team/[teamId]/route.ts(28,22): error TS18048: 'services.team' is possibly 'undefined'.
app/api/team/[teamId]/route.ts(42,24): error TS18048: 'services.team' is possibly 'undefined'.
app/api/team/[teamId]/route.ts(56,24): error TS18048: 'services.team' is possibly 'undefined'.
app/api/team/invites/__tests__/route.test.ts(82,33): error TS2345: Argument of type 'Request' is not assignable to parameter 
of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/__tests__/route.test.ts(102,56): error TS2304: Cannot find name 'NextResponse'.
app/api/team/invites/__tests__/route.test.ts(114,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/__tests__/route.test.ts(134,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/__tests__/route.test.ts(154,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/__tests__/route.test.ts(172,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/__tests__/route.test.ts(190,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(67,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(100,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(118,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(139,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(160,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(169,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/__tests__/route.test.ts(186,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/invites/accept/route.ts(52,31): error TS18048: 'auth.user' is possibly 'undefined'.
app/api/team/invites/route.ts(124,47): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
app/api/team/invites/route.ts(129,47): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
app/api/team/members/[memberId]/route.ts(70,47): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
app/api/team/members/__tests__/route.test.ts(112,7): error TS2345: Argument of type 'Promise<NextResponse<{ error: { code: 
"AUTH_ACCESS_001"; }; }>>' is not assignable to parameter of type 'NextResponse<unknown>'.
  Type 'Promise<NextResponse<{ error: { code: "AUTH_ACCESS_001"; }; }>>' is missing the following properties from type 
'NextResponse<unknown>': cookies, [INTERNALS], headers, ok, and 14 more.
app/api/team/members/__tests__/route.test.ts(251,33): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/team/members/route.ts(106,32): error TS7006: Parameter 'member' implicitly has an 'any' type.
app/api/team/members/route.ts(141,38): error TS2339: Property 'TIMEOUT' does not exist on type '{ readonly PAYMENT_FAILED: 
"BILLING_PAYMENT_FAILED"; readonly PROVIDER_ERROR: "BILLING_PROVIDER_ERROR"; readonly PERMISSION_DENIED: 
"BILLING_PERMISSION_DENIED"; readonly STATE_MISMATCH: "BILLING_STATE_MISMATCH"; ... 29 more ...; readonly CONFLICT: 
"AUTH_CONFLICT_001"; }'.
app/api/team/members/route.ts(165,24): error TS18048: 'services.team' is possibly 'undefined'.
app/api/team/members/route.ts(175,46): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
app/api/team/members/route.ts(181,46): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
app/api/team/route.ts(22,23): error TS18048: 'services.team' is possibly 'undefined'.
app/api/team/route.ts(32,24): error TS18048: 'services.team' is possibly 'undefined'.
app/api/upgradeToBusiness.test.ts(152,28): error TS2304: Cannot find name 'POST'.
app/api/upgradeToBusiness.test.ts(172,28): error TS2304: Cannot find name 'POST'.
app/api/upgradeToBusiness.test.ts(205,28): error TS2304: Cannot find name 'POST'.
app/api/upgradeToBusiness.test.ts(241,28): error TS2304: Cannot find name 'POST'.
app/api/upgradeToBusiness.test.ts(269,28): error TS2304: Cannot find name 'POST'.
app/api/upgradeToBusiness.test.ts(304,28): error TS2304: Cannot find name 'POST'.
app/api/users/[id]/permissions/resources/__tests__/route.test.ts(26,5): error TS18048: 
'mockService.getUserResourcePermissions' is possibly 'undefined'.
app/api/users/[id]/permissions/resources/__tests__/route.test.ts(26,44): error TS2339: Property 'mockResolvedValue' does not 
exist on type '(userId: string) => Promise<ResourcePermission[]>'.
app/api/users/[id]/permissions/route.ts(25,36): error TS7006: Parameter 'p' implicitly has an 'any' type.
app/api/webhooks/[webhookId]/deliveries/__tests__/route.test.ts(30,23): error TS2554: Expected 2 arguments, but got 1.
app/api/webhooks/[webhookId]/deliveries/route.ts(21,77): error TS2339: Property 'webhookId' does not exist on type 
'Promise<{ webhookId: string; }>'.
app/api/webhooks/route.ts(87,38): error TS2345: Argument of type 'ZodObject<{ name: ZodString; url: ZodString; events: 
ZodArray<ZodString, "many">; isActive: ZodDefault<ZodOptional<ZodBoolean>>; }, "strip", ZodTypeAny, { ...; }, { ...; }>' is 
not assignable to parameter of type 'ZodType<{ name: string; events: string[]; url: string; isActive: boolean; }, 
ZodTypeDef, { name: string; events: string[]; url: string; isActive: boolean; }>'.
  The types of '_input.isActive' are incompatible between these types.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
app/api/webhooks/stripe/__tests__/route.test.ts(37,36): error TS2339: Property 'mockImplementation' does not exist on type 
'(payload: string | Buffer<ArrayBufferLike>, header: string | string[] | Buffer<ArrayBufferLike>, secret: string, 
tolerance?: number | undefined, cryptoProvider?: CryptoProvider | undefined, receivedAt?: number | undefined) => Event'.
app/api/webhooks/stripe/__tests__/route.test.ts(38,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/webhooks/stripe/__tests__/route.test.ts(43,36): error TS2339: Property 'mockReturnValue' does not exist on type 
'(payload: string | Buffer<ArrayBufferLike>, header: string | string[] | Buffer<ArrayBufferLike>, secret: string, 
tolerance?: number | undefined, cryptoProvider?: CryptoProvider | undefined, receivedAt?: number | undefined) => Event'.
app/api/webhooks/stripe/__tests__/route.test.ts(49,28): error TS2345: Argument of type 'Request' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, [INTERNALS]
app/api/webhooks/stripe/route.ts(64,15): error TS2322: Type 'Status' is not assignable to type 'SubscriptionStatus | 
undefined'.
  Type '"active"' is not assignable to type 'SubscriptionStatus | undefined'.
app/api/webhooks/stripe/route.ts(66,15): error TS2322: Type 'string | null' is not assignable to type 'string | Date | 
undefined'.
  Type 'null' is not assignable to type 'string | Date | undefined'.
app/api/webhooks/stripe/route.ts(70,30): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
app/api/webhooks/stripe/route.ts(72,15): error TS2322: Type 'string | null' is not assignable to type 'string | Date | 
undefined'.
  Type 'null' is not assignable to type 'string | Date | undefined'.
app/auth/check-email/page.tsx(23,9): error TS2339: Property 'clearSuccessMessage' does not exist on type 'UseAuth'.
app/auth/login/page.tsx(17,9): error TS2322: Type '{ title: string; description: string; showRememberMe: boolean; footer: 
Element; }' is not assignable to type 'IntrinsicAttributes & LoginFormProps'.
  Property 'title' does not exist on type 'IntrinsicAttributes & LoginFormProps'.
app/auth/verify-email/page.tsx(19,7): error TS2339: Property 'clearSuccessMessage' does not exist on type 'UseAuth'.
app/company/addresses/page.tsx(16,40): error TS2339: Property 'fetchAddresses' does not exist on type 'CompanyProfileState'.
app/company/addresses/page.tsx(49,24): error TS2345: Argument of type 'Partial<CompanyAddress>' is not assignable to 
parameter of type 'CompanyAddress'.
  Types of property 'id' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.
app/company/addresses/page.tsx(100,9): error TS2322: Type '{ open: boolean; onOpenChange: Dispatch<SetStateAction<boolean>>; 
address: CompanyAddress | null; onSubmit: (data: Partial<CompanyAddress>) => Promise<...>; }' is not assignable to type 
'IntrinsicAttributes & AddressDialogProps'.
  Property 'open' does not exist on type 'IntrinsicAttributes & AddressDialogProps'.
app/page.tsx(9,20): error TS2459: Module '"@/ui/styled/layout/Features"' declares 'FeatureItem' locally, but it is not 
exported.
app/settings/api-keys/page.tsx(30,11): error TS2322: Type '(name: string, permissions: string[], expiresInDays?: number) => 
Promise<ApiKeyCreateResult>' is not assignable to type '(name: string, permissions: string[], expiresInDays?: number | 
undefined) => Promise<{ key: string; } & ApiKey>'.
  Type 'Promise<ApiKeyCreateResult>' is not assignable to type 'Promise<{ key: string; } & ApiKey>'.
    Type 'ApiKeyCreateResult' is not assignable to type '{ key: string; } & ApiKey'.
      Type 'ApiKeyCreateResult' is not assignable to type '{ key: string; }'.
        Types of property 'key' are incompatible.
          Type 'ApiKey | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
app/settings/api-keys/page.tsx(43,11): error TS2322: Type '(id: string) => Promise<{ success: boolean; key?: ApiKey; 
plaintext?: string; error?: string; }>' is not assignable to type '(id: string) => Promise<{ key: string; } & ApiKey>'.
  Type 'Promise<{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; 
}>' is not assignable to type 'Promise<{ key: string; } & ApiKey>'.
    Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; }' is 
not assignable to type '{ key: string; } & ApiKey'.
      Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; }' is 
not assignable to type '{ key: string; }'.
        Types of property 'key' are incompatible.
          Type 'ApiKey | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
app/settings/page.tsx(27,5): error TS2339: Property 'passwordForm' does not exist on type '{ preferences: UserPreferences | 
null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(28,5): error TS2339: Property 'updatePasswordForm' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(29,5): error TS2339: Property 'changePassword' does not exist on type '{ preferences: UserPreferences 
| null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(30,5): error TS2339: Property 'deleteAccountConfirmation' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(31,5): error TS2339: Property 'updateDeleteConfirmation' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(32,5): error TS2339: Property 'deleteAccount' does not exist on type '{ preferences: UserPreferences | 
null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(33,5): error TS2339: Property 'privacySettings' does not exist on type '{ preferences: UserPreferences 
| null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(34,5): error TS2339: Property 'updatePrivacySettings' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(35,5): error TS2339: Property 'securitySettings' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(36,5): error TS2339: Property 'updateSecuritySettings' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(37,5): error TS2339: Property 'sessions' does not exist on type '{ preferences: UserPreferences | 
null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(38,5): error TS2339: Property 'logoutSession' does not exist on type '{ preferences: UserPreferences | 
null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(39,5): error TS2339: Property 'connectedAccounts' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(40,5): error TS2339: Property 'disconnectAccount' does not exist on type '{ preferences: 
UserPreferences | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: 
(userId: string) => Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(41,5): error TS2339: Property 'connectAccount' does not exist on type '{ preferences: UserPreferences 
| null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(42,5): error TS2339: Property 'exportUserData' does not exist on type '{ preferences: UserPreferences 
| null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserPreferences: (userId: string) => 
Promise<UserPreferences | null>; ... 4 more ...; clearMessages: () => void; }'.
app/settings/page.tsx(89,9): error TS2322: Type '{ title: string; description: string; passwordForm: any; 
updatePasswordForm: any; handlePasswordChange: any; deleteAccountConfirmation: any; updateDeleteConfirmation: any; 
handleDeleteAccount: any; ... 10 more ...; footer: Element; }' is not assignable to type 'IntrinsicAttributes & 
StyledAccountSettingsProps'.
  Property 'passwordForm' does not exist on type 'IntrinsicAttributes & StyledAccountSettingsProps'.
app/teams/ClientPage.tsx(22,5): error TS2339: Property 'selectedTeam' does not exist on type '{ teams: Team[]; currentTeam: 
Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: (userId: string) => 
Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/ClientPage.tsx(23,5): error TS2339: Property 'setSelectedTeam' does not exist on type '{ teams: Team[]; 
currentTeam: Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: (userId: 
string) => Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/ClientPage.tsx(31,5): error TS2339: Property 'addMember' does not exist on type '{ members: TeamMember[]; 
isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => Promise<TeamMember[]>; 
addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, updateData: 
TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/ClientPage.tsx(32,5): error TS2339: Property 'removeMember' does not exist on type '{ members: TeamMember[]; 
isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => Promise<TeamMember[]>; 
addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, updateData: 
TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/ClientPage.tsx(33,5): error TS2339: Property 'updateMemberRole' does not exist on type '{ members: TeamMember[]; 
isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => Promise<TeamMember[]>; 
addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, updateData: 
TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/ClientPage.tsx(39,5): error TS2339: Property 'invitations' does not exist on type '{ teamInvitations: 
TeamInvitation[]; userInvitations: TeamInvitation[]; isLoading: boolean; error: string | null; successMessage: string | 
null; fetchTeamInvitations: (id: string) => Promise<...>; ... 5 more ...; clearMessages: () => void; }'.
app/teams/ClientPage.tsx(84,28): error TS2322: Type '{ onCreateTeam: (ownerId: string, teamData: TeamCreatePayload) => 
Promise<TeamResult>; }' is not assignable to type 'IntrinsicAttributes & StyledTeamCreatorProps'.
  Property 'onCreateTeam' does not exist on type 'IntrinsicAttributes & StyledTeamCreatorProps'.
app/teams/ClientPage.tsx(136,25): error TS2322: Type '{ teamId: any; members: TeamMember[]; onAddMember: any; 
onRemoveMember: any; onUpdateMemberRole: any; }' is not assignable to type 'IntrinsicAttributes & 
StyledTeamMemberManagerProps'.
  Property 'members' does not exist on type 'IntrinsicAttributes & StyledTeamMemberManagerProps'.
app/teams/ClientPage.tsx(159,47): error TS7006: Parameter 'invitation' implicitly has an 'any' type.
app/teams/invitations/ClientPage.tsx(22,5): error TS2339: Property 'selectedTeam' does not exist on type '{ teams: Team[]; 
currentTeam: Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: (userId: 
string) => Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/invitations/ClientPage.tsx(23,5): error TS2339: Property 'setSelectedTeam' does not exist on type '{ teams: 
Team[]; currentTeam: Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: 
(userId: string) => Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/invitations/ClientPage.tsx(29,5): error TS2339: Property 'pendingInvitations' does not exist on type '{ 
teamInvitations: TeamInvitation[]; userInvitations: TeamInvitation[]; isLoading: boolean; error: string | null; 
successMessage: string | null; fetchTeamInvitations: (id: string) => Promise<...>; ... 5 more ...; clearMessages: () => 
void; }'.
app/teams/invitations/ClientPage.tsx(30,5): error TS2339: Property 'sentInvitations' does not exist on type '{ 
teamInvitations: TeamInvitation[]; userInvitations: TeamInvitation[]; isLoading: boolean; error: string | null; 
successMessage: string | null; fetchTeamInvitations: (id: string) => Promise<...>; ... 5 more ...; clearMessages: () => 
void; }'.
app/teams/invitations/ClientPage.tsx(31,5): error TS2339: Property 'createInvitation' does not exist on type '{ 
teamInvitations: TeamInvitation[]; userInvitations: TeamInvitation[]; isLoading: boolean; error: string | null; 
successMessage: string | null; fetchTeamInvitations: (id: string) => Promise<...>; ... 5 more ...; clearMessages: () => 
void; }'.
app/teams/invitations/ClientPage.tsx(36,26): error TS2345: Argument of type 'string | null' is not assignable to parameter 
of type 'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
app/teams/invitations/ClientPage.tsx(86,11): error TS2322: Type '(invitationId: string) => Promise<{ success: boolean; 
error?: string; }>' is not assignable to type '(invitationId: string) => Promise<void>'.
  Type 'Promise<{ success: boolean; error?: string | undefined; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; error?: string | undefined; }' is not assignable to type 'void'.
app/teams/invitations/ClientPage.tsx(87,11): error TS2322: Type '(_invitationId: string) => Promise<{ success: boolean; 
error?: string; }>' is not assignable to type '(invitationId: string) => Promise<void>'.
  Type 'Promise<{ success: boolean; error?: string | undefined; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; error?: string | undefined; }' is not assignable to type 'void'.
app/teams/manage/ClientPage.tsx(24,5): error TS2339: Property 'selectedTeam' does not exist on type '{ teams: Team[]; 
currentTeam: Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: (userId: 
string) => Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/manage/ClientPage.tsx(25,5): error TS2339: Property 'setSelectedTeam' does not exist on type '{ teams: Team[]; 
currentTeam: Team | null; isLoading: boolean; error: string | null; successMessage: string | null; fetchUserTeams: (userId: 
string) => Promise<Team[]>; ... 6 more ...; setCurrentTeam: Dispatch<...>; }'.
app/teams/manage/ClientPage.tsx(32,5): error TS2339: Property 'addMember' does not exist on type '{ members: TeamMember[]; 
isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => Promise<TeamMember[]>; 
addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, updateData: 
TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/manage/ClientPage.tsx(33,5): error TS2339: Property 'removeMember' does not exist on type '{ members: 
TeamMember[]; isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => 
Promise<TeamMember[]>; addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, 
updateData: TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/manage/ClientPage.tsx(34,5): error TS2339: Property 'updateMemberRole' does not exist on type '{ members: 
TeamMember[]; isLoading: boolean; error: string | null; successMessage: string | null; fetchTeamMembers: () => 
Promise<TeamMember[]>; addTeamMember: (userId: string, role: string) => Promise<...>; updateTeamMember: (userId: string, 
updateData: TeamMemberUpdatePayload) => Promise<...>; removeTeamMember: (u...'.
app/teams/manage/ClientPage.tsx(37,22): error TS2345: Argument of type 'string | null' is not assignable to parameter of 
type 'string'.
  Type 'null' is not assignable to type 'string'.
app/teams/manage/ClientPage.tsx(112,13): error TS2322: Type '{ teamId: any; members: TeamMember[]; onAddMember: any; 
onRemoveMember: any; onUpdateMemberRole: any; footer: Element; }' is not assignable to type 'IntrinsicAttributes & 
StyledTeamMemberManagerProps'.
  Property 'members' does not exist on type 'IntrinsicAttributes & StyledTeamMemberManagerProps'.
app/teams/webhooks/page.tsx(21,11): error TS2322: Type '(payload: { name: string; events: string[]; url: string; isActive: 
boolean; }) => Promise<Webhook | undefined>' is not assignable to type '(payload: { name: string; events: string[]; url: 
string; isActive: boolean; }) => Promise<void>'.
  Type 'Promise<Webhook | undefined>' is not assignable to type 'Promise<void>'.
    Type 'Webhook | undefined' is not assignable to type 'void'.
      Type 'Webhook' is not assignable to type 'void'.
e2e/accessibility/a11yFeatures.e2e.test.ts(250,16): error TS2339: Property 'focus' does not exist on type 'Element'.
e2e/accessibility/a11yFeatures.e2e.test.ts(321,34): error TS7006: Parameter 'color' implicitly has an 'any' type.
e2e/accessibility/a11yFeatures.e2e.test.ts(358,24): error TS2365: Operator '>=' cannot be applied to types 'string' and 
'number'.
e2e/adapters/adapterRegistry.e2e.test.ts(22,33): error TS2339: Property 'resetConfiguration' does not exist on type '{ 
configure: (config: Partial<UserManagementConfig>) => UserManagementConfig; configureFeatures: (flags: 
Partial<FeatureFlags>) => FeatureFlags; ... 4 more ...; getServiceProvider: <T>(providerName: string) => T | undefined; }'.
e2e/adapters/adapterRegistry.e2e.test.ts(64,48): error TS2339: Property 'getConfiguration' does not exist on type '{ 
configure: (config: Partial<UserManagementConfig>) => UserManagementConfig; configureFeatures: (flags: 
Partial<FeatureFlags>) => FeatureFlags; ... 4 more ...; getServiceProvider: <T>(providerName: string) => T | undefined; }'.
e2e/adapters/adapterRegistry.e2e.test.ts(84,24): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(85,15): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(86,16): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(87,30): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(88,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(89,16): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(90,26): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(90,91): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(94,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(95,16): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(96,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(97,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(101,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(102,16): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(103,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(104,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(108,24): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(109,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(110,19): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(115,27): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(116,27): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(117,27): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(118,33): error TS2708: Cannot use namespace 'jest' as a value.
e2e/adapters/adapterRegistry.e2e.test.ts(121,53): error TS2739: Type '{ createAuthProvider: any; createUserProvider: any; 
createTeamProvider: any; createPermissionProvider: any; }' is missing the following properties from type 'AdapterFactory': 
createSessionProvider, createSsoProvider, createSubscriptionProvider, createApiKeyProvider
e2e/admin/adminSessionManagement.e2e.test.ts(287,39): error TS2353: Object literal may only specify known properties, and 
'hasClass' does not exist in type '{ has?: Locator | undefined; hasNot?: Locator | undefined; hasNotText?: string | RegExp | 
undefined; hasText?: string | RegExp | undefined; visible?: boolean | undefined; }'.
e2e/admin/auditLog.e2e.test.ts(4,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/admin/businessSsoStatus.e2e.test.ts(4,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/auth/full/fullAuthFlow.e2e.test.ts(2,27): error TS2307: Cannot find module '@/e2e/utils/authUtils' or its corresponding 
type declarations.
e2e/auth/mfa/backupCodes.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/auth/mfa/backupCodes.e2e.test.ts(359,40): error TS2339: Property 'playwright' does not exist on type 'Browser'.
e2e/auth/mfa/mfaEmail.spec.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/auth/mfa/mfaEmail.spec.ts(52,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(61,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(109,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(118,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(146,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(155,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaEmail.spec.ts(168,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/mfaManagement.e2e.test.ts(10,43): error TS7006: Parameter 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(45,22): error TS7006: Parameter 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(45,28): error TS7006: Parameter 'email' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(45,35): error TS7006: Parameter 'password' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(65,7): error TS7034: Variable 'page' implicitly has type 'any' in some locations 
where its type cannot be determined.
e2e/auth/mfa/mfaManagement.e2e.test.ts(79,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(84,56): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(88,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(91,24): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(95,24): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(102,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(107,56): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(115,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(123,29): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(135,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(139,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(143,29): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(150,29): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(152,13): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(158,28): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(159,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(164,26): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(170,56): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(178,28): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(186,28): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(198,26): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(202,25): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(203,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(204,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(212,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(219,25): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(225,13): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(231,56): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(239,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(247,33): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(259,31): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(260,11): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(266,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(267,13): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(272,28): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(276,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/mfaManagement.e2e.test.ts(284,27): error TS7005: Variable 'page' implicitly has an 'any' type.
e2e/auth/mfa/totpVerification.e2e.test.ts(131,19): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/auth/mfa/totpVerification.e2e.test.ts(430,40): error TS2339: Property 'length' does not exist on type '{}'.
e2e/auth/mfa/totpVerification.e2e.test.ts(431,34): error TS2339: Property 'key' does not exist on type '{}'.
e2e/auth/mfa/totpVerification.e2e.test.ts(433,11): error TS7053: Element implicitly has an 'any' type because expression of 
type 'any' can't be used to index type '{}'.
e2e/auth/mfa/totpVerification.e2e.test.ts(433,37): error TS2339: Property 'getItem' does not exist on type '{}'.
e2e/auth/mfa/totpVerification.e2e.test.ts(453,22): error TS2339: Property 'setItem' does not exist on type '{}'.
e2e/auth/personal/accountDeletion.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding 
type declarations.
e2e/auth/personal/accountDeletion.test.ts(82,56): error TS2345: Argument of type 'string | null' is not assignable to 
parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
e2e/auth/personal/accountDeletion.test.ts(93,65): error TS2304: Cannot find name 'Locator'.
e2e/auth/personal/checkDeleteButton.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding 
type declarations.
e2e/auth/personal/checkDeleteButton.test.ts(80,19): error TS18047: 'text' is possibly 'null'.
e2e/auth/personal/checkDeleteButton.test.ts(117,17): error TS18047: 'text' is possibly 'null'.
e2e/auth/personal/debugSettings.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/auth/personal/debugSettings.test.ts(84,71): error TS18047: 'text' is possibly 'null'.
e2e/auth/personal/debugSettings.test.ts(99,43): error TS18047: 'btnText' is possibly 'null'.
e2e/auth/personal/login.e2e.test.ts(168,40): error TS2339: Property 'length' does not exist on type '{}'.
e2e/auth/personal/login.e2e.test.ts(169,34): error TS2339: Property 'key' does not exist on type '{}'.
e2e/auth/personal/login.e2e.test.ts(171,11): error TS7053: Element implicitly has an 'any' type because expression of type 
'any' can't be used to index type '{}'.
e2e/auth/personal/login.e2e.test.ts(171,37): error TS2339: Property 'getItem' does not exist on type '{}'.
e2e/auth/personal/login.e2e.test.ts(193,24): error TS2339: Property 'setItem' does not exist on type '{}'.
e2e/auth/personal/logout.e2e.test.ts(99,26): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/auth/personal/logout.e2e.test.ts(103,29): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/auth/personal/logout.e2e.test.ts(107,28): error TS2339: Property 'click' does not exist on type 'Element'.
e2e/auth/personal/logout.e2e.test.ts(200,26): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/auth/personal/logout.e2e.test.ts(204,29): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/auth/personal/logout.e2e.test.ts(208,28): error TS2339: Property 'click' does not exist on type 'Element'.
e2e/auth/personal/registration.spec.ts(1520,23): error TS2339: Property 'value' does not exist on type 'HTMLElement | 
SVGElement'.
  Property 'value' does not exist on type 'HTMLElement'.
e2e/auth/personal/registration.spec.ts(1545,23): error TS2339: Property 'value' does not exist on type 'HTMLElement | 
SVGElement'.
  Property 'value' does not exist on type 'HTMLElement'.
e2e/auth/personal/sessionManagement.e2e.test.ts(2,27): error TS2307: Cannot find module '@/e2e/utils/authUtils' or its 
corresponding type declarations.
e2e/auth/sso/ssoLoginOauth.e2e.test.ts(2,80): error TS2307: Cannot find module '@/e2e/utils/userSetup' or its corresponding 
type declarations.
e2e/connectedAccounts.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/dataExport.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type declarations.
e2e/dataRetention.e2e.test.ts(4,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/debug/checkUiElements.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/i18n/internationalization.e2e.test.ts(16,25): error TS2307: Cannot find module '@/e2e/utils/authUtils' or its 
corresponding type declarations.
e2e/i18n/internationalization.e2e.test.ts(596,14): error TS2339: Property 'originalLanguage' does not exist on type 'Window 
& typeof globalThis'.
e2e/i18n/internationalization.e2e.test.ts(634,21): error TS2339: Property 'i18n' does not exist on type 'Window & typeof 
globalThis'.
e2e/i18n/internationalization.e2e.test.ts(636,14): error TS2531: Object is possibly 'null'.
e2e/i18n/internationalization.e2e.test.ts(647,18): error TS2339: Property 'originalLanguage' does not exist on type 'Window 
& typeof globalThis'.
e2e/i18n/internationalization.e2e.test.ts(649,43): error TS2339: Property 'originalLanguage' does not exist on type 'Window 
& typeof globalThis'.
e2e/profile/businessProfile.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/profile/companyValidation.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding 
type declarations.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(313,33): error TS2540: Cannot assign to 'ready' because it is 
a read-only property.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(376,53): error TS2345: Argument of type '() => Promise<{ 
supported: boolean; registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: undefined; } | { 
supported: boolean; registered: boolean; scriptURL: string | undefined; reason?: undefined; availableWorkers?: undefined; } 
| { ...; } | { ...; }> | { ...; }' is not assignable to parameter of type 'PageFunction<void, { supported: boolean; 
registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: undefined; } | { supported: boolean; 
registered: boolean; scriptURL: string | undefined; reason?: undefined; availableWorkers?: undefined; } | { ...; } | { ...; 
}>'.
  Type '() => Promise<{ supported: boolean; registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: 
undefined; } | { supported: boolean; registered: boolean; scriptURL: string | undefined; reason?: undefined; 
availableWorkers?: undefined; } | { ...; } | { ...; }> | { ...; }' is not assignable to type '(arg: void) => { supported: 
boolean; registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: undefined; } | { supported: boolean; 
registered: boolean; scriptURL: string | undefined; reason?: undefined; availableWorkers?: undefined; } | { ...; } | { ...; 
} | Promise<...>'.
    Type 'Promise<{ supported: boolean; registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: 
undefined; } | { supported: boolean; registered: boolean; scriptURL: string | undefined; reason?: undefined; 
availableWorkers?: undefined; } | { ...; } | { ...; }> | { ...; }' is not assignable to type '{ supported: boolean; 
registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: undefined; } | { supported: boolean; 
registered: boolean; scriptURL: string | undefined; reason?: undefined; availableWorkers?: undefined; } | { ...; } | { ...; 
} | Promise<...>'.
      Type '{ supported: boolean; reason: string; }' is not assignable to type '{ supported: boolean; registered: boolean; 
reason: string; scriptURL?: undefined; availableWorkers?: undefined; } | { supported: boolean; registered: boolean; 
scriptURL: string | undefined; reason?: undefined; availableWorkers?: undefined; } | { ...; } | { ...; } | Promise<...>'.
        Property 'registered' is missing in type '{ supported: boolean; reason: string; }' but required in type '{ 
supported: boolean; registered: boolean; reason: string; scriptURL?: undefined; availableWorkers?: undefined; }'.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(478,33): error TS2540: Cannot assign to 'ready' because it is 
a read-only property.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(486,14): error TS2339: Property '__testPushNotificationShown' 
does not exist on type 'Window & typeof globalThis'.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(494,20): error TS2339: Property '__testPushNotificationShown' 
does not exist on type 'Window & typeof globalThis'.
e2e/profile/notification-settings/pushNotification.e2e.test.ts(541,23): error TS2339: Property '__testPushNotificationShown' 
does not exist on type 'Window & typeof globalThis'.
e2e/profile/update.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/profile/userJourney.e2e.test.ts(2,25): error TS2307: Cannot find module '@/e2e/utils/auth' or its corresponding type 
declarations.
e2e/subscription-and-licensing/License/license.test.ts(117,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/License/license.test.ts(158,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(12,30): error TS7006: Parameter 'page' implicitly has an 
'any' type.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(21,9): error TS7031: Binding element 'email' implicitly has 
an 'any' type.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(21,16): error TS7031: Binding element 'password' implicitly 
has an 'any' type.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(25,22): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(29,25): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/subscription-and-licensing/License/licenseManagement.test.ts(54,40): error TS7006: Parameter 'page' implicitly has an 
'any' type.
e2e/subscription-and-licensing/License/teamSeatLicensing.test.ts(18,9): error TS7031: Binding element 'email' implicitly has 
an 'any' type.
e2e/subscription-and-licensing/License/teamSeatLicensing.test.ts(18,16): error TS7031: Binding element 'password' implicitly 
has an 'any' type.
e2e/subscription-and-licensing/Payment/payment.test.ts(161,19): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/Payment/payment.test.ts(165,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/Payment/paymentmethods.test.ts(11,30): error TS7006: Parameter 'page' implicitly has an 'any' 
type.
e2e/subscription-and-licensing/Payment/paymentmethods.test.ts(20,9): error TS7031: Binding element 'email' implicitly has an 
'any' type.
e2e/subscription-and-licensing/Payment/paymentmethods.test.ts(20,16): error TS7031: Binding element 'password' implicitly 
has an 'any' type.
e2e/subscription-and-licensing/Payment/paymentmethods.test.ts(24,22): error TS2339: Property 'value' does not exist on type 
'Element'.
e2e/subscription-and-licensing/Payment/paymentmethods.test.ts(28,25): error TS2339: Property 'value' does not exist on type 
'Element'.
e2e/subscription-and-licensing/paymentCheckoutFlow.e2e.test.ts(18,25): error TS2307: Cannot find module 
'@/e2e/utils/authUtils' or its corresponding type declarations.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(10,30): error TS7006: Parameter 'page' implicitly has an 
'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(10,36): error TS7006: Parameter 'email' implicitly has an 
'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(10,43): error TS7006: Parameter 'password' implicitly has 
an 'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(19,9): error TS7031: Binding element 'email' implicitly 
has an 'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(19,16): error TS7031: Binding element 'password' 
implicitly has an 'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(23,22): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(27,25): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(79,46): error TS7006: Parameter 'page' implicitly has an 
'any' type.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(148,134): error TS18047: 'featureType' is possibly 'null'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(160,11): error TS2531: Object is possibly 'null'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(161,13): error TS2531: Object is possibly 'null'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(164,11): error TS2531: Object is possibly 'null'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(264,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(329,17): error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & 
PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & 
PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.
e2e/subscription-and-licensing/Subscription/featureGating.test.ts(410,9): error TS2531: Object is possibly 'null'.
e2e/subscription-and-licensing/Subscription/subsription.test.ts(51,41): error TS2345: Argument of type '{ min: number; }' is 
not assignable to parameter of type 'number'.
e2e/subscription-and-licensing/Subscription/subsriptionflow.test.ts(12,30): error TS7006: Parameter 'page' implicitly has an 
'any' type.
e2e/subscription-and-licensing/Subscription/subsriptionflow.test.ts(21,9): error TS7031: Binding element 'email' implicitly 
has an 'any' type.
e2e/subscription-and-licensing/Subscription/subsriptionflow.test.ts(21,16): error TS7031: Binding element 'password' 
implicitly has an 'any' type.
e2e/subscription-and-licensing/Subscription/subsriptionflow.test.ts(25,22): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/subscription-and-licensing/Subscription/subsriptionflow.test.ts(29,25): error TS2339: Property 'value' does not exist on 
type 'Element'.
e2e/teamInviteFlow.e2e.test.ts(84,37): error TS7006: Parameter 'page' implicitly has an 'any' type.
e2e/teamInviteFlow.e2e.test.ts(84,43): error TS7006: Parameter 'url' implicitly has an 'any' type.
e2e/teamInviteFlow.e2e.test.ts(85,27): error TS2339: Property 'timeout' does not exist on type '{}'.
e2e/teamInviteFlow.e2e.test.ts(93,53): error TS18046: 'error' is of type 'unknown'.
e2e/teamInviteFlow.e2e.test.ts(101,61): error TS18046: 'error2' is of type 'unknown'.
e2e/teamInviteFlow.e2e.test.ts(118,44): error TS7006: Parameter 'page' implicitly has an 'any' type.
e2e/teamInviteFlow.e2e.test.ts(118,50): error TS7006: Parameter 'email' implicitly has an 'any' type.
e2e/teamInviteFlow.e2e.test.ts(122,24): error TS7006: Parameter 'inviteeEmail' implicitly has an 'any' type.
e2e/teamInviteFlow.e2e.test.ts(242,68): error TS2339: Property 'value' does not exist on type 'HTMLElement'.
e2e/teamInviteFlow.e2e.test.ts(348,31): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/teamInviteFlow.e2e.test.ts(352,31): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/teamInviteFlow.e2e.test.ts(361,28): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/teamInviteFlow.e2e.test.ts(366,27): error TS2339: Property 'value' does not exist on type 'Element'.
e2e/utils/globalSetup.ts(1,27): error TS2307: Cannot find module '@/e2e/utils/i18nSetup' or its corresponding type 
declarations.
e2e/utils/globalSetup.ts(5,34): error TS2307: Cannot find module '@/e2e/utils/userSetup' or its corresponding type 
declarations.
e2e/utils/globalSetup.ts(6,35): error TS2307: Cannot find module '@/e2e/utils/mswSupabase' or its corresponding type 
declarations.
src/adapters/__tests__/mocks/supabase.ts(401,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(408,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(410,60): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(412,84): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(417,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(442,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(448,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(453,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(458,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(463,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(468,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/mocks/supabase.ts(511,9): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/adapters/__tests__/registry.test.ts(14,7): error TS2420: Class 'TestAuthProvider' incorrectly implements interface 
'AuthService'.
  Type 'TestAuthProvider' is missing the following properties from type 'AuthService': login, register, logout, 
getCurrentUser, and 25 more.
src/adapters/__tests__/registry.test.ts(24,7): error TS2420: Class 'TestUserProvider' incorrectly implements interface 
'IUserDataProvider'.
  Type 'TestUserProvider' is missing the following properties from type 'IUserDataProvider': getUserProfile, 
updateUserProfile, getUserPreferences, updateUserPreferences, and 8 more.
src/adapters/__tests__/registry.test.ts(32,9): error TS2416: Property 'createTeam' in type 'TestTeamProvider' is not 
assignable to the same property in base type 'ITeamDataProvider'.
  Type '() => Promise<{ data: null; error: null; }>' is not assignable to type '(ownerId: string, teamData: 
TeamCreatePayload) => Promise<TeamResult>'.
    Type 'Promise<{ data: null; error: null; }>' is not assignable to type 'Promise<TeamResult>'.
      Property 'success' is missing in type '{ data: null; error: null; }' but required in type 'TeamResult'.
src/adapters/__tests__/registry.test.ts(33,9): error TS2416: Property 'getTeam' in type 'TestTeamProvider' is not assignable 
to the same property in base type 'ITeamDataProvider'.
  Type '() => Promise<{ data: null; error: null; }>' is not assignable to type '(teamId: string) => Promise<Team | null>'.
    Type 'Promise<{ data: null; error: null; }>' is not assignable to type 'Promise<Team | null>'.
      Type '{ data: null; error: null; }' is missing the following properties from type 'Team': id, name, ownerId, isActive, 
and 4 more.
src/adapters/__tests__/registry.test.ts(34,9): error TS2416: Property 'updateTeam' in type 'TestTeamProvider' is not 
assignable to the same property in base type 'ITeamDataProvider'.
  Type '() => Promise<{ data: null; error: null; }>' is not assignable to type '(teamId: string, teamData: 
TeamUpdatePayload) => Promise<TeamResult>'.
    Type 'Promise<{ data: null; error: null; }>' is not assignable to type 'Promise<TeamResult>'.
      Property 'success' is missing in type '{ data: null; error: null; }' but required in type 'TeamResult'.
src/adapters/__tests__/registry.test.ts(35,9): error TS2416: Property 'deleteTeam' in type 'TestTeamProvider' is not 
assignable to the same property in base type 'ITeamDataProvider'.
  Type '() => Promise<{ error: null; }>' is not assignable to type '(teamId: string) => Promise<{ success: boolean; error?: 
string | undefined; }>'.
    Type 'Promise<{ error: null; }>' is not assignable to type 'Promise<{ success: boolean; error?: string | undefined; }>'.
      Property 'success' is missing in type '{ error: null; }' but required in type '{ success: boolean; error?: string | 
undefined; }'.
src/adapters/__tests__/registry.test.ts(38,7): error TS2420: Class 'TestPermissionProvider' incorrectly implements interface 
'IPermissionDataProvider'.
  Type 'TestPermissionProvider' is missing the following properties from type 'IPermissionDataProvider': hasPermission, 
hasRole, getAllRoles, getRoleById, and 19 more.
src/adapters/__tests__/registry.test.ts(45,3): error TS2416: Property 'createAuthProvider' in type 'TestAdapterFactory' is 
not assignable to the same property in base type 'AdapterFactory'.
  Type '() => TestAuthProvider' is not assignable to type '() => AuthDataProvider'.
    Type 'TestAuthProvider' is missing the following properties from type 'AuthDataProvider': login, register, logout, 
getCurrentUser, and 18 more.
src/adapters/__tests__/registry.test.ts(67,47): error TS2345: Argument of type '() => TestAdapterFactory' is not assignable 
to parameter of type 'FactoryCreator'.
  Type 'TestAdapterFactory' is missing the following properties from type 'AdapterFactory': createSessionProvider, 
createSsoProvider, createSubscriptionProvider, createApiKeyProvider
src/adapters/__tests__/registry.test.ts(74,47): error TS2345: Argument of type '() => TestAdapterFactory' is not assignable 
to parameter of type 'FactoryCreator'.
  Type 'TestAdapterFactory' is missing the following properties from type 'AdapterFactory': createSessionProvider, 
createSsoProvider, createSubscriptionProvider, createApiKeyProvider
src/adapters/__tests__/registry.test.ts(77,49): error TS2345: Argument of type '() => TestAdapterFactory' is not assignable 
to parameter of type 'FactoryCreator'.
  Type 'TestAdapterFactory' is missing the following properties from type 'AdapterFactory': createSessionProvider, 
createSsoProvider, createSubscriptionProvider, createApiKeyProvider
src/adapters/__tests__/registry.test.ts(103,53): error TS2739: Type 'TestAdapterFactory' is missing the following properties 
from type 'AdapterFactory': createSessionProvider, createSsoProvider, createSubscriptionProvider, createApiKeyProvider
src/adapters/address/__tests__/supabaseAdapter.test.ts(31,48): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/address/__tests__/supabaseAdapter.test.ts(38,48): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/address/__tests__/supabaseAdapter.test.ts(45,48): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/api-keys/factory.ts(11,43): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter 
of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/audit/__tests__/supabaseAuditAdapter.test.ts(28,46): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/audit/__tests__/supabaseAuditAdapter.test.ts(48,46): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/auth/__tests__/supabaseAuthProvider.test.ts(15,47): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/auth/__tests__/supabaseAuthProvider.test.ts(26,47): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/auth/providers/oauthProvider.ts(68,14): error TS2420: Class 'BasicOAuthProvider' incorrectly implements 
interface 'OAuthDataProvider'.
  Type 'BasicOAuthProvider' is missing the following properties from type 'OAuthDataProvider': verifyPasswordResetToken, 
updatePasswordWithToken, invalidateSessions, sendMagicLink, verifyMagicLink
src/adapters/auth/providers/supabaseAuthProvider.ts(23,15): error TS2724: '"@/adapters/auth/interfaces"' has no exported 
member named 'IAuthDataProvider'. Did you mean 'AuthDataProvider'?
src/adapters/auth/providers/supabaseAuthProvider.ts(83,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/auth/providers/supabaseAuthProvider.ts(84,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/auth/providers/supabaseAuthProvider.ts(449,66): error TS2345: Argument of type '{ type: "magiclink"; token: 
string; }' is not assignable to parameter of type 'VerifyOtpParams'.
  Type '{ type: "magiclink"; token: string; }' is not assignable to type 'VerifyEmailOtpParams | VerifyTokenHashParams'.
    Property 'email' is missing in type '{ type: "magiclink"; token: string; }' but required in type 'VerifyEmailOtpParams'.
src/adapters/auth/providers/supabaseAuthProvider.ts(525,67): error TS2345: Argument of type '{ factorId: string; code: 
string; }' is not assignable to parameter of type 'MFAVerifyParams'.
  Property 'challengeId' is missing in type '{ factorId: string; code: string; }' but required in type 'MFAVerifyParams'.
src/adapters/auth/providers/supabaseAuthProvider.ts(539,21): error TS2339: Property 'token' does not exist on type '{ 
access_token: string; token_type: string; expires_in: number; refresh_token: string; user: User; }'.
src/adapters/auth/providers/supabaseAuthProvider.ts(561,9): error TS2353: Object literal may only specify known properties, 
and 'code' does not exist in type 'MFAUnenrollParams'.
src/adapters/auth/providers/supabaseAuthProvider.ts(575,9): error TS2322: Type 'User | null' is not assignable to type 'User 
| undefined'.
  Type 'null' is not assignable to type 'User | undefined'.
src/adapters/auth/providers/supabaseAuthProvider.ts(644,20): error TS18048: 'data.session.expires_at' is possibly 
'undefined'.
src/adapters/company-notification/factory.ts(1,55): error TS2307: Cannot find module 
'@/core/companyNotification/ICompanyNotificationDataProvider' or its corresponding type declarations.
src/adapters/company-notification/supabase/supabaseCompanyNotification.provider.ts(2,55): error TS2307: Cannot find module 
'@/core/companyNotification/ICompanyNotificationDataProvider' or its corresponding type declarations.
src/adapters/consent/factory.ts(18,44): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter 
of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/csrf/defaultAdapter.ts(5,14): error TS2420: Class 'DefaultCsrfProvider' incorrectly implements interface 
'ICsrfDataProvider'.
  Type 'DefaultCsrfProvider' is missing the following properties from type 'ICsrfDataProvider': generateToken, getToken, 
listTokens, updateToken, purgeExpiredTokens
src/adapters/csrf/factory.ts(6,3): error TS2739: Type 'DefaultCsrfProvider' is missing the following properties from type 
'ICsrfDataProvider': generateToken, getToken, listTokens, updateToken, purgeExpiredTokens
src/adapters/csrf/factory.ts(25,39): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter of 
type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/data-export/factory.ts(1,46): error TS2307: Cannot find module '@/core/dataExport/IDataExportDataProvider' or 
its corresponding type declarations.
src/adapters/data-export/factory.ts(18,47): error TS2345: Argument of type 'Record<string, any>' is not assignable to 
parameter of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/data-export/supabase/supabaseDataExport.provider.ts(1,46): error TS2307: Cannot find module 
'@/core/dataExport/IDataExportDataProvider' or its corresponding type declarations.
src/adapters/database/__tests__/mockRepository.test.ts(14,47): error TS2339: Property 'id' does not exist on type 
'ApplicationError | Item'.
  Property 'id' does not exist on type 'ApplicationError'.
src/adapters/database/__tests__/mockRepository.test.ts(17,47): error TS2339: Property 'id' does not exist on type 
'ApplicationError | Item'.
  Property 'id' does not exist on type 'ApplicationError'.
src/adapters/database/__tests__/mockRepository.test.ts(20,43): error TS2339: Property 'id' does not exist on type 
'ApplicationError | Item'.
  Property 'id' does not exist on type 'ApplicationError'.
src/adapters/database/__tests__/mockRepository.test.ts(22,49): error TS2339: Property 'id' does not exist on type 
'ApplicationError | Item'.
  Property 'id' does not exist on type 'ApplicationError'.
src/adapters/database/factory/index.ts(19,14): error TS2304: Cannot find name 'createSupabaseDatabaseProvider'.
src/adapters/database/factory/index.ts(21,14): error TS2304: Cannot find name 'createPrismaDatabaseProvider'.
src/adapters/database/factory/index.ts(23,14): error TS2304: Cannot find name 'createMockDatabaseProvider'.
src/adapters/database/factory/mockFactory.ts(19,9): error TS2416: Property 'createProfile' in type 'MockDatabaseProvider' is 
not assignable to the same property in base type 'DatabaseProvider'.
  Type '() => Promise<void>' is not assignable to type '(data: Omit<Profile, "id" | "createdAt" | "updatedAt">) => 
Promise<Profile>'.
    Type 'Promise<void>' is not assignable to type 'Promise<Profile>'.
      Type 'void' is not assignable to type 'Profile'.
src/adapters/database/factory/mockFactory.ts(21,9): error TS2416: Property 'updateProfile' in type 'MockDatabaseProvider' is 
not assignable to the same property in base type 'DatabaseProvider'.
  Type '() => Promise<void>' is not assignable to type '(userId: string, data: Partial<Profile>) => Promise<Profile>'.
    Type 'Promise<void>' is not assignable to type 'Promise<Profile>'.
      Type 'void' is not assignable to type 'Profile'.
src/adapters/database/factory/mockFactory.ts(24,9): error TS2416: Property 'createUserPreferences' in type 
'MockDatabaseProvider' is not assignable to the same property in base type 'DatabaseProvider'.
  Type '() => Promise<void>' is not assignable to type '(data: Omit<{ id: string; createdAt: Date; updatedAt: Date; userId: 
string; language: string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: 
boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }, "id" | ... 1 more ... | "updatedAt">) => 
Promise<...>'.
    Type 'Promise<void>' is not assignable to type 'Promise<{ id: string; createdAt: Date; updatedAt: Date; userId: string; 
language: string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }>'.
      Type 'void' is not assignable to type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: 
string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/adapters/database/factory/mockFactory.ts(26,9): error TS2416: Property 'updateUserPreferences' in type 
'MockDatabaseProvider' is not assignable to the same property in base type 'DatabaseProvider'.
  Type '() => Promise<void>' is not assignable to type '(userId: string, data: Partial<{ id: string; createdAt: Date; 
updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { push: boolean; 
email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }>) => Promise<...>'.
    Type 'Promise<void>' is not assignable to type 'Promise<{ id: string; createdAt: Date; updatedAt: Date; userId: string; 
language: string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }>'.
      Type 'void' is not assignable to type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: 
string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/adapters/database/factory/mockFactory.ts(29,9): error TS2416: Property 'createActivityLog' in type 
'MockDatabaseProvider' is not assignable to the same property in base type 'DatabaseProvider'.
  Type '() => Promise<void>' is not assignable to type '(data: Omit<{ id: string; createdAt: Date; updatedAt: Date; userId: 
string; action: string; details: Record<string, unknown> | null; ipAddress: string | null; userAgent: string | null; }, "id" 
| ... 1 more ... | "updatedAt">) => Promise<...>'.
    Type 'Promise<void>' is not assignable to type 'Promise<{ id: string; createdAt: Date; updatedAt: Date; userId: string; 
action: string; details: Record<string, unknown> | null; ipAddress: string | null; userAgent: string | null; }>'.
      Type 'void' is not assignable to type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; action: string; 
details: Record<string, unknown> | null; ipAddress: string | null; userAgent: string | null; }'.
src/adapters/database/factory/mockFactory.ts(37,3): error TS2322: Type 'MockDatabaseProvider' is not assignable to type 
'DatabaseProvider'.
  The types returned by 'createProfile(...)' are incompatible between these types.
    Type 'Promise<void>' is not assignable to type 'Promise<Profile>'.
      Type 'void' is not assignable to type 'Profile'.
src/adapters/database/mock/mockRepository.ts(34,23): error TS2322: Type '{ code: "mock/not_found"; message: string; }' is 
not assignable to type 'ApplicationError | T'.
  Types of property 'code' are incompatible.
    Type '"mock/not_found"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/mock/mockRepository.ts(42,41): error TS2322: Type '"mock/not_found"' is not assignable to type 
'ErrorCode'.
src/adapters/database/prisma/prismaRepository.ts(42,7): error TS2322: Type '{ code: "SERVER_GENERAL_003"; message: any; }' 
is not assignable to type 'ApplicationError | T'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_003"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/prisma/prismaRepository.ts(50,7): error TS2322: Type '{ code: "SERVER_GENERAL_005"; message: any; }' 
is not assignable to type 'ApplicationError | T | null'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_005"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/prisma/prismaRepository.ts(58,7): error TS2322: Type '{ code: "SERVER_GENERAL_003"; message: any; }' 
is not assignable to type 'ApplicationError | T'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_003"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/prisma/prismaRepository.ts(67,41): error TS2322: Type '"SERVER_GENERAL_006"' is not assignable to type 
'ErrorCode'.
src/adapters/database/supabase/supabaseRepository.ts(41,7): error TS2322: Type '{ code: "SERVER_GENERAL_003"; message: 
string; }' is not assignable to type 'ApplicationError | T'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_003"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/supabase/supabaseRepository.ts(55,7): error TS2322: Type '{ code: "SERVER_GENERAL_005"; message: 
string; }' is not assignable to type 'ApplicationError | T | null'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_005"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/supabase/supabaseRepository.ts(70,7): error TS2322: Type '{ code: "SERVER_GENERAL_003"; message: 
string; }' is not assignable to type 'ApplicationError | T'.
  Types of property 'code' are incompatible.
    Type '"SERVER_GENERAL_003"' is not assignable to type 'ErrorCode | undefined'.
src/adapters/database/supabase/supabaseRepository.ts(79,41): error TS2322: Type '"SERVER_GENERAL_006"' is not assignable to 
type 'ErrorCode'.
src/adapters/gdpr/factory.ts(23,41): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter of 
type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(59,20): error TS2339: Property 'id' does not exist on type '{ user: 
User; }'.
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(60,19): error TS2339: Property 'email' does not exist on type '{ user: 
User; }'.
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(61,23): error TS2339: Property 'created_at' does not exist on type '{ 
user: User; }'.
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(62,26): error TS2339: Property 'last_sign_in_at' does not exist on type 
'{ user: User; }'.
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(65,47): error TS2339: Property 'id' does not exist on type '{ user: 
User; }'.
src/adapters/gdpr/supabase/supabaseGdpr.provider.ts(66,27): error TS2339: Property 'id' does not exist on type '{ user: 
User; }'.
src/adapters/gdpr/supabaseAdapter.ts(14,14): error TS2420: Class 'SupabaseGdprAdapter' incorrectly implements interface 
'IGdprDataProvider'.
  Type 'SupabaseGdprAdapter' is missing the following properties from type 'IGdprDataProvider': requestUserExport, 
getUserExport, listUserExports, requestAccountDeletion, and 3 more.
src/adapters/gdpr/supabaseAdapter.ts(30,20): error TS2339: Property 'id' does not exist on type '{ user: User; }'.
src/adapters/gdpr/supabaseAdapter.ts(31,19): error TS2339: Property 'email' does not exist on type '{ user: User; }'.
src/adapters/gdpr/supabaseAdapter.ts(32,23): error TS2339: Property 'created_at' does not exist on type '{ user: User; }'.
src/adapters/gdpr/supabaseAdapter.ts(33,26): error TS2339: Property 'last_sign_in_at' does not exist on type '{ user: User; 
}'.
src/adapters/gdpr/supabaseAdapter.ts(36,47): error TS2339: Property 'id' does not exist on type '{ user: User; }'.
src/adapters/gdpr/supabaseAdapter.ts(37,27): error TS2339: Property 'id' does not exist on type '{ user: User; }'.
src/adapters/notification/inMemoryProvider.ts(243,20): error TS2339: Property 'error' does not exist on type 'Notification'.
src/adapters/notification/inMemoryProvider.ts(244,23): error TS2339: Property 'attempts' does not exist on type 
'Notification'.
src/adapters/notification/inMemoryProvider.ts(245,24): error TS2339: Property 'nextRetry' does not exist on type 
'Notification'.
src/adapters/oauth/factory.ts(18,42): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter of 
type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/oauth/supabase/supabaseOauth.provider.ts(14,7): error TS2322: Type 'OAuthProvider' is not assignable to type 
'Provider'.
src/adapters/organization/factory.ts(25,47): error TS2345: Argument of type 'Record<string, any>' is not assignable to 
parameter of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/permission/__tests__/supabasePermissionProvider.test.ts(24,53): error TS2345: Argument of type 'string | 
undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/permission/__tests__/supabasePermissionProvider.test.ts(25,11): error TS2322: Type '{ name: string; resource: 
string; }' is not assignable to type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(71,41): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(72,34): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(89,27): error TS2339: Property 'id' does not exist on type 'Role'.
  Property 'id' does not exist on type '"SUPER_ADMIN"'.
src/adapters/permission/supabasePermissionProvider.ts(117,9): error TS2698: Spread types may only be created from object 
types.
src/adapters/permission/supabasePermissionProvider.ts(129,9): error TS2698: Spread types may only be created from object 
types.
src/adapters/permission/supabasePermissionProvider.ts(160,7): error TS2698: Spread types may only be created from object 
types.
src/adapters/permission/supabasePermissionProvider.ts(209,7): error TS2698: Spread types may only be created from object 
types.
src/adapters/permission/supabasePermissionProvider.ts(216,7): error TS2353: Object literal may only specify known 
properties, and 'role' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(261,37): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(261,56): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(270,55): error TS2345: Argument of type '{ name: any; resource: any; 
}' is not assignable to parameter of type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(288,7): error TS2353: Object literal may only specify known 
properties, and 'role' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(331,11): error TS2353: Object literal may only specify known 
properties, and 'role' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(404,7): error TS2353: Object literal may only specify known 
properties, and 'userRole' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(443,11): error TS2353: Object literal may only specify known 
properties, and 'userRole' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(466,41): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(467,34): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(490,43): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(491,36): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(506,37): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(507,30): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(522,7): error TS2353: Object literal may only specify known 
properties, and 'permission' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(542,43): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(543,36): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(552,9): error TS2353: Object literal may only specify known 
properties, and 'permission' does not exist in type 'PermissionEvent'.
src/adapters/permission/supabasePermissionProvider.ts(572,37): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(602,41): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(618,41): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(631,5): error TS2322: Type '{ id: any; userId: any; permission: { 
name: any; resource: any; }; resourceType: any; resourceId: any; createdAt: Date; }[]' is not assignable to type 
'ResourcePermission[]'.
  Type '{ id: any; userId: any; permission: { name: any; resource: any; }; resourceType: any; resourceId: any; createdAt: 
Date; }' is not assignable to type 'ResourcePermission'.
    Types of property 'permission' are incompatible.
      Type '{ name: any; resource: any; }' is not assignable to type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(651,5): error TS2322: Type '{ id: any; userId: any; permission: { 
name: any; resource: any; }; resourceType: any; resourceId: any; createdAt: Date; }[]' is not assignable to type 
'ResourcePermission[]'.
  Type '{ id: any; userId: any; permission: { name: any; resource: any; }; resourceType: any; resourceId: any; createdAt: 
Date; }' is not assignable to type 'ResourcePermission'.
    Types of property 'permission' are incompatible.
      Type '{ name: any; resource: any; }' is not assignable to type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(671,41): error TS2339: Property 'name' does not exist on type 
'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/adapters/permission/supabasePermissionProvider.ts(765,5): error TS2322: Type '{ id: any; name: any; description: any; 
isSystemRole: any; createdAt: Date; updatedAt: Date; }' is not assignable to type 'Role'.
src/adapters/permission/supabasePermissionProvider.ts(782,5): error TS2322: Type '{ name: any; resource: any; }' is not 
assignable to type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(795,5): error TS2322: Type '{ name: any; resource: any; }' is not 
assignable to type 'Permission'.
src/adapters/permission/supabasePermissionProvider.ts(816,7): error TS2322: Type 'Date | null' is not assignable to type 
'Date | undefined'.
  Type 'null' is not assignable to type 'Date | undefined'.
src/adapters/permission/supabasePermissionProvider.ts(830,7): error TS2322: Type '{ name: any; resource: any; }' is not 
assignable to type 'Permission'.
src/adapters/registry.ts(11,10): error TS2724: '"@/core/user/IUserDataProvider"' has no exported member named 
'UserDataProvider'. Did you mean 'IUserDataProvider'?
src/adapters/registry.ts(12,10): error TS2724: '"@/core/team/ITeamDataProvider"' has no exported member named 
'TeamDataProvider'. Did you mean 'ITeamDataProvider'?
src/adapters/registry.ts(13,10): error TS2724: '"@/core/permission/IPermissionDataProvider"' has no exported member named 
'PermissionDataProvider'. Did you mean 'IPermissionDataProvider'?
src/adapters/registry.ts(14,10): error TS2724: '"@/core/gdpr/IGdprDataProvider"' has no exported member named 
'GdprDataProvider'. Did you mean 'IGdprDataProvider'?
src/adapters/registry.ts(19,10): error TS2724: '"@/core/subscription/ISubscriptionDataProvider"' has no exported member 
named 'SubscriptionDataProvider'. Did you mean 'ISubscriptionDataProvider'?
src/adapters/registry.ts(20,10): error TS2724: '"@/core/api-keys/IApiKeyDataProvider"' has no exported member named 
'ApiKeyDataProvider'. Did you mean 'IApiKeyDataProvider'?
src/adapters/registry.ts(22,42): error TS2307: Cannot find module '@/core/savedSearch/ISavedSearchDataProvider' or its 
corresponding type declarations.
src/adapters/registry.ts(25,50): error TS2307: Cannot find module 
'@/core/companyNotification/ICompanyNotificationDataProvider' or its corresponding type declarations.
src/adapters/registry.ts(27,41): error TS2307: Cannot find module '@/core/dataExport/IDataExportDataProvider' or its 
corresponding type declarations.
src/adapters/registry.ts(29,3): error TS2305: Module '"@/core/database/interfaces"' has no exported member 
'DatabaseProvider'.
src/adapters/registry.ts(30,3): error TS2305: Module '"@/core/database/interfaces"' has no exported member 'DatabaseConfig'.
src/adapters/registry.ts(32,10): error TS2305: Module '"@/core/database/interfaces/base.interface"' has no exported member 
'BaseRepository'.
src/adapters/resource-relationship/factory.ts(1,56): error TS2307: Cannot find module 
'@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/adapters/resource-relationship/factory.ts(18,57): error TS2345: Argument of type 'Record<string, any>' is not assignable 
to parameter of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/resource-relationship/supabase/supabaseResourceRelationship.provider.ts(2,56): error TS2307: Cannot find module 
'@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/adapters/resource-relationship/supabase/supabaseResourceRelationship.provider.ts(3,70): error TS2307: Cannot find module 
'@/core/resourceRelationship/models' or its corresponding type declarations.
src/adapters/saved-search/factory.ts(1,47): error TS2307: Cannot find module '@/core/savedSearch/ISavedSearchDataProvider' 
or its corresponding type declarations.
src/adapters/saved-search/factory.ts(24,48): error TS2345: Argument of type 'Record<string, any>' is not assignable to 
parameter of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/saved-search/supabase/supabaseSavedSearch.provider.ts(2,47): error TS2307: Cannot find module 
'@/core/savedSearch/ISavedSearchDataProvider' or its corresponding type declarations.
src/adapters/saved-search/supabase/supabaseSavedSearch.provider.ts(7,8): error TS2307: Cannot find module 
'@/core/savedSearch/models' or its corresponding type declarations.
src/adapters/session/factory.ts(22,44): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter 
of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/session/supabaseAdapter.ts(25,60): error TS2339: Property 'listUserSessions' does not exist on type 
'GoTrueAdminApi'.
src/adapters/session/supabaseAdapter.ts(64,54): error TS2339: Property 'deleteUserSession' does not exist on type 
'GoTrueAdminApi'.
src/adapters/storage/factory.ts(19,43): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter 
of type '{ [key: string]: any; bucket: string; supabaseUrl?: string | undefined; supabaseKey?: string | undefined; }'.
  Property 'bucket' is missing in type 'Record<string, any>' but required in type '{ [key: string]: any; bucket: string; 
supabaseUrl?: string | undefined; supabaseKey?: string | undefined; }'.
src/adapters/subscription/__tests__/supabaseAdapter.test.ts(26,55): error TS2345: Argument of type 'string | undefined' is 
not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/subscription/__tests__/supabaseAdapter.test.ts(33,55): error TS2345: Argument of type 'string | undefined' is 
not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/supabaseFactory.ts(38,15): error TS2724: '"@/adapters/oauth"' has no exported member named 'OAuthDataProvider'. 
Did you mean 'IOAuthDataProvider'?
src/adapters/supabaseFactory.ts(92,12): error TS2554: Expected 2 arguments, but got 1.
src/adapters/supabaseFactory.ts(99,12): error TS2554: Expected 2 arguments, but got 1.
src/adapters/supabaseFactory.ts(106,12): error TS2554: Expected 2 arguments, but got 1.
src/adapters/supabaseFactory.ts(120,12): error TS2554: Expected 2 arguments, but got 1.
src/adapters/supabaseFactory.ts(156,12): error TS2554: Expected 2 arguments, but got 1.
src/adapters/team/__tests__/supabaseTeamProvider.test.ts(26,47): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(64,31): error TS2339: Property 'isPublic' does not exist on type 
'TeamCreatePayload'.
src/adapters/team/supabaseTeamProvider.ts(65,30): error TS2339: Property 'settings' does not exist on type 
'TeamCreatePayload'.
src/adapters/team/supabaseTeamProvider.ts(133,31): error TS2339: Property 'isPublic' does not exist on type 
'TeamUpdatePayload'.
src/adapters/team/supabaseTeamProvider.ts(134,30): error TS2339: Property 'settings' does not exist on type 
'TeamUpdatePayload'.
src/adapters/team/supabaseTeamProvider.ts(449,38): error TS2339: Property 'invitedBy' does not exist on type 
'TeamInvitationPayload'.
src/adapters/team/supabaseTeamProvider.ts(450,38): error TS2339: Property 'expiresAt' does not exist on type 
'TeamInvitationPayload'.
src/adapters/team/supabaseTeamProvider.ts(642,18): error TS2339: Property 'filters' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(643,20): error TS2339: Property 'filters' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(644,48): error TS2339: Property 'filters' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(647,20): error TS2339: Property 'filters' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(648,47): error TS2339: Property 'filters' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(653,20): error TS18048: 'params.page' is possibly 'undefined'.
src/adapters/team/supabaseTeamProvider.ts(653,41): error TS2339: Property 'pageSize' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(654,32): error TS2339: Property 'pageSize' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(673,56): error TS2339: Property 'pageSize' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(679,9): error TS2353: Object literal may only specify known properties, and 
'pagination' does not exist in type 'TeamSearchResult'.
src/adapters/team/supabaseTeamProvider.ts(681,28): error TS2339: Property 'pageSize' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(689,9): error TS2353: Object literal may only specify known properties, and 
'pagination' does not exist in type 'TeamSearchResult'.
src/adapters/team/supabaseTeamProvider.ts(691,28): error TS2339: Property 'pageSize' does not exist on type 
'TeamSearchParams'.
src/adapters/team/supabaseTeamProvider.ts(811,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(812,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(831,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(832,7): error TS2322: Type 'Date | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(850,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/team/supabaseTeamProvider.ts(851,7): error TS2322: Type 'Date | null' is not assignable to type 'string'.
  Type 'null' is not assignable to type 'string'.
src/adapters/two-factor/factory.ts(18,46): error TS2345: Argument of type 'Record<string, any>' is not assignable to 
parameter of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/two-factor/supabase/supabaseTwoFactor.provider.ts(19,8): error TS2307: Cannot find module 
'@/core/twoFactor/models' or its corresponding type declarations.
src/adapters/two-factor/supabase/supabaseTwoFactor.provider.ts(20,45): error TS2307: Cannot find module 
'@/core/twoFactor/ITwoFactorDataProvider' or its corresponding type declarations.
src/adapters/user/__tests__/supabaseUserProvider.test.ts(34,47): error TS2345: Argument of type 'string | undefined' is not 
assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/user/supabaseUserProvider.ts(77,37): error TS2339: Property 'displayName' does not exist on type 
'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(78,28): error TS2339: Property 'bio' does not exist on type 'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(79,33): error TS2339: Property 'location' does not exist on type 
'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(80,32): error TS2339: Property 'website' does not exist on type 
'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(81,35): error TS2339: Property 'avatarUrl' does not exist on type 
'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(130,9): error TS2561: Object literal may only specify known properties, but 
'notifications' does not exist in type 'UserPreferences'. Did you mean to write 'pushNotifications'?
src/adapters/user/supabaseUserProvider.ts(159,38): error TS2551: Property 'notifications' does not exist on type 
'PreferencesUpdatePayload'. Did you mean 'pushNotifications'?
src/adapters/user/supabaseUserProvider.ts(160,33): error TS2339: Property 'timezone' does not exist on type 
'PreferencesUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(161,36): error TS2339: Property 'dateFormat' does not exist on type 
'PreferencesUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(162,36): error TS2339: Property 'timeFormat' does not exist on type 
'PreferencesUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(221,46): error TS2353: Object literal may only specify known properties, and 
'avatarUrl' does not exist in type 'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(246,32): error TS2339: Property 'avatarUrl' does not exist on type 'UserProfile'.
src/adapters/user/supabaseUserProvider.ts(254,32): error TS2339: Property 'avatarUrl' does not exist on type 'UserProfile'.
src/adapters/user/supabaseUserProvider.ts(271,46): error TS2353: Object literal may only specify known properties, and 
'avatarUrl' does not exist in type 'ProfileUpdatePayload'.
src/adapters/user/supabaseUserProvider.ts(297,37): error TS2339: Property 'emailVisible' does not exist on type 
'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(298,36): error TS2339: Property 'nameVisible' does not exist on type 
'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(299,35): error TS2339: Property 'bioVisible' does not exist on type 
'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(300,40): error TS2339: Property 'locationVisible' does not exist on type 
'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(301,39): error TS2339: Property 'websiteVisible' does not exist on type 
'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(317,11): error TS2353: Object literal may only specify known properties, and 
'emailVisible' does not exist in type 'ProfileVisibility'.
src/adapters/user/supabaseUserProvider.ts(349,18): error TS2339: Property 'filters' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(350,20): error TS2339: Property 'filters' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(351,54): error TS2339: Property 'filters' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(354,20): error TS2339: Property 'filters' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(355,48): error TS2339: Property 'filters' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(360,20): error TS18048: 'params.page' is possibly 'undefined'.
src/adapters/user/supabaseUserProvider.ts(360,41): error TS2339: Property 'pageSize' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(361,32): error TS2339: Property 'pageSize' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(380,56): error TS2339: Property 'pageSize' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(386,9): error TS2353: Object literal may only specify known properties, and 
'pagination' does not exist in type 'UserSearchResult'.
src/adapters/user/supabaseUserProvider.ts(388,28): error TS2339: Property 'pageSize' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(396,9): error TS2353: Object literal may only specify known properties, and 
'pagination' does not exist in type 'UserSearchResult'.
src/adapters/user/supabaseUserProvider.ts(398,28): error TS2339: Property 'pageSize' does not exist on type 
'UserSearchParams'.
src/adapters/user/supabaseUserProvider.ts(574,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/user/supabaseUserProvider.ts(575,7): error TS2322: Type 'Date' is not assignable to type 'string'.
src/adapters/user/supabaseUserProvider.ts(591,7): error TS2561: Object literal may only specify known properties, but 
'notifications' does not exist in type 'UserPreferences'. Did you mean to write 'pushNotifications'?
src/adapters/webhooks/__tests__/supabaseWebhookProvider.test.ts(26,50): error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/webhooks/__tests__/supabaseWebhookProvider.test.ts(32,50): error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/webhooks/__tests__/supabaseWebhookProvider.test.ts(39,50): error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/webhooks/__tests__/supabaseWebhookProvider.test.ts(52,50): error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/webhooks/__tests__/supabaseWebhookProvider.test.ts(59,50): error TS2345: Argument of type 'string | undefined' 
is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/adapters/webhooks/factory.ts(38,44): error TS2345: Argument of type 'Record<string, any>' is not assignable to parameter 
of type '{ [key: string]: any; supabaseUrl: string; supabaseKey: string; }'.
  Type 'Record<string, any>' is missing the following properties from type '{ [key: string]: any; supabaseUrl: string; 
supabaseKey: string; }': supabaseUrl, supabaseKey
src/adapters/webhooks/supabase/supabaseWebhook.provider.ts(214,5): error TS2741: Property 'name' is missing in type '{ id: 
any; userId: any; url: any; events: any; secret: any; isActive: any; createdAt: any; updatedAt: any; }' but required in type 
'Webhook'.
src/components/ui/errors/__tests__/ErrorBoundary.test.tsx(32,10): error TS2786: 'ProblemChild' cannot be used as a JSX 
component.
  Its type '() => void' is not a valid JSX element type.
    Type '() => void' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'.
      Type 'void' is not assignable to type 'ReactNode | Promise<ReactNode>'.
src/components/ui/errors/__tests__/ErrorDisplay.test.tsx(47,13): error TS2741: Property 'message' is missing in type '{}' 
but required in type 'SpecializedProps'.
src/components/ui/errors/__tests__/ErrorDisplay.test.tsx(53,13): error TS2741: Property 'message' is missing in type '{}' 
but required in type 'SpecializedProps'.
src/components/ui/errors/__tests__/ErrorDisplay.test.tsx(56,13): error TS2741: Property 'message' is missing in type '{}' 
but required in type 'SpecializedProps'.
src/components/ui/errors/ErrorBoundary.tsx(81,8): error TS2769: No overload matches this call.
  Overload 1 of 2, '(props: P, context?: any): string | number | bigint | boolean | ReactElement<unknown, string | 
JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following 
error.
    Type 'P' is not assignable to type 'IntrinsicAttributes & P'.
      Type 'P' is not assignable to type 'IntrinsicAttributes'.
  Overload 2 of 2, '(props: P): string | number | bigint | boolean | ReactElement<unknown, string | 
JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<...> | Component<...> | null | undefined', gave the following 
error.
    Type 'P' is not assignable to type 'IntrinsicAttributes & P'.
      Type 'P' is not assignable to type 'IntrinsicAttributes'.
src/components/ui/QueryError.tsx(29,5): error TS2322: Type '(() => void | Promise<void>) | undefined' is not assignable to 
type '(() => Promise<void>) | undefined'.
  Type '() => void | Promise<void>' is not assignable to type '() => Promise<void>'.
    Type 'void | Promise<void>' is not assignable to type 'Promise<void>'.
      Type 'void' is not assignable to type 'Promise<void>'.
src/core/access-control/__tests__/evaluator.test.ts(2,10): error TS2305: Module '"@/core/access-control/index"' has no 
exported member 'AccessEvaluator'.
src/core/access-control/__tests__/evaluator.test.ts(2,27): error TS2305: Module '"@/core/access-control/index"' has no 
exported member 'AccessRule'.
src/core/access-control/index.ts(1,15): error TS2307: Cannot find module '@/core/accessControl/models' or its corresponding 
type declarations.
src/core/access-control/index.ts(2,15): error TS2307: Cannot find module '@/core/accessControl/evaluator' or its 
corresponding type declarations.
src/core/api-keys/index.ts(4,1): error TS2308: Module '@/core/api-keys/models' has already exported a member named 'ApiKey'. 
Consider explicitly re-exporting to resolve the ambiguity.
src/core/auth/__tests__/businessPolicies.test.tsx(25,27): error TS2339: Property 'eq' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(26,27): error TS2339: Property 'single' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(27,27): error TS2339: Property 'then' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(38,27): error TS2339: Property 'eq' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(39,27): error TS2339: Property 'single' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(40,27): error TS2339: Property 'then' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/core/auth/__tests__/businessPolicies.test.tsx(77,5): error TS2741: Property 'sso_enabled' is missing in type '{ id: 
string; name: string; domain: string; security_settings: { session_timeout_mins: number; max_sessions_per_user: number; 
enforce_ip_restrictions: boolean; allowed_ip_ranges: string[]; enforce_device_restrictions: boolean; allowed_device_types: 
string[]; require_reauth_for_sensitive: boolean; sensitive_actions: ...' but required in type 'Organization'.
src/core/auth/__tests__/businessPolicies.test.tsx(89,23): error TS7017: Element implicitly has an 'any' type because type 
'typeof globalThis' has no index signature.
src/core/auth/__tests__/businessPolicies.test.tsx(290,23): error TS2554: Expected 1 arguments, but got 0.
src/core/auth/__tests__/businessPolicies.test.tsx(303,18): error TS2339: Property 'mockImplementation' does not exist on 
type '<FnName extends string, Fn extends GenericFunction>(fn: FnName, args?: Fn["Args"] | undefined, options?: { head?: 
boolean | undefined; get?: boolean | undefined; count?: "exact" | "planned" | "estimated" | undefined; } | undefined) => 
PostgrestFilterBuilder<...>'.
src/core/auth/__tests__/businessPolicies.test.tsx(344,18): error TS2339: Property 'mockImplementation' does not exist on 
type '<FnName extends string, Fn extends GenericFunction>(fn: FnName, args?: Fn["Args"] | undefined, options?: { head?: 
boolean | undefined; get?: boolean | undefined; count?: "exact" | "planned" | "estimated" | undefined; } | undefined) => 
PostgrestFilterBuilder<...>'.
src/core/auth/__tests__/businessPolicies.test.tsx(369,38): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(credentials: SignInWithPasswordCredentials) => Promise<AuthTokenResponsePassword>'.
src/core/common/__tests__/errors.test.ts(122,21): error TS2304: Cannot find name 'DataExportError'.
src/core/common/__tests__/errors.test.ts(122,37): error TS2304: Cannot find name 'EXPORT_ERROR'.
src/core/common/__tests__/errors.test.ts(124,12): error TS2304: Cannot find name 'isDataExportError'.
src/core/common/__tests__/errors.test.ts(125,27): error TS2304: Cannot find name 'EXPORT_ERROR'.
src/core/common/errors.ts(200,11): error TS2304: Cannot find name 'RELATIONSHIP_ERROR'.
src/core/common/errors.ts(207,11): error TS2304: Cannot find name 'RELATIONSHIP_ERROR'.
src/core/common/errors.ts(214,11): error TS2304: Cannot find name 'RELATIONSHIP_ERROR'.
src/core/common/errors.ts(221,11): error TS2304: Cannot find name 'RELATIONSHIP_ERROR'.
src/core/company-notification/index.ts(1,15): error TS2307: Cannot find module '@/core/companyNotification/interfaces' or 
its corresponding type declarations.
src/core/company-notification/index.ts(2,15): error TS2307: Cannot find module 
'@/core/companyNotification/ICompanyNotificationDataProvider' or its corresponding type declarations.
src/core/config/clientConfig.ts(68,15): error TS2484: Export declaration conflicts with exported declaration of 
'ClientConfig'.
src/core/config/interfaces.ts(15,39): error TS2307: Cannot find module '@/core/twoFactor/interfaces' or its corresponding 
type declarations.
src/core/config/interfaces.ts(28,50): error TS2307: Cannot find module '@/core/resourceRelationship/interfaces' or its 
corresponding type declarations.
src/core/config/interfaces.ts(59,32): error TS2307: Cannot find module '@/core/companyNotification/interfaces' or its 
corresponding type declarations.
src/core/config/interfaces.ts(167,39): error TS2307: Cannot find module '@/core/companyNotification/interfaces' or its 
corresponding type declarations.
src/core/config/runtimeConfig.ts(85,15): error TS2484: Export declaration conflicts with exported declaration of 
'RuntimeConfig'.
src/core/data-export/index.ts(1,15): error TS2307: Cannot find module '@/core/dataExport/interfaces' or its corresponding 
type declarations.
src/core/data-export/index.ts(2,15): error TS2307: Cannot find module '@/core/dataExport/IDataExportDataProvider' or its 
corresponding type declarations.
src/core/database/interfaces/user.interface.ts(11,18): error TS2320: Interface 'UserDatabaseInterface' cannot simultaneously 
extend types 'BaseDatabaseInterface<UserProfile>' and 'IUserRepository'.
  Named property 'findById' of types 'BaseDatabaseInterface<UserProfile>' and 'IUserRepository' are not identical.
src/core/initialization/initializeAdapters.ts(34,52): error TS2307: Cannot find module 
'@/adapters/resourceRelationship/factory' or its corresponding type declarations.
src/core/initialization/initializeAdapters.ts(35,52): error TS2307: Cannot find module 
'@/services/resourceRelationship/defaultResourceRelationship.service' or its corresponding type declarations.
src/core/initialization/initializeAdapters.ts(232,18): error TS2339: Property 'serviceProviders' does not exist on type '{}'.
src/core/initialization/initializeAdapters.ts(234,5): error TS2739: Type '{ redirects: { afterLogin: string; afterLogout: 
string; afterRegistration: string; afterPasswordReset: string; }; }' is missing the following properties from type 
'UserManagementOptions': baseUrl, api, ui, security
src/core/permission/__tests__/permissions.test.ts(52,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(72,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(98,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(110,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(125,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(155,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(170,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(187,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(202,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/__tests__/permissions.test.ts(217,29): error TS2693: 'Permission' only refers to a type, but is being 
used as a value here.
src/core/permission/events.ts(28,18): error TS2300: Duplicate identifier 'PermissionEvent'.
src/core/permission/events.ts(104,13): error TS2300: Duplicate identifier 'PermissionEvent'.
src/core/permission/interfaces.ts(191,14): error TS2304: Cannot find name 'ResourcePermission'.
src/core/permission/interfaces.ts(217,55): error TS2304: Cannot find name 'ResourcePermission'.
src/core/permission/interfaces.ts(223,14): error TS2304: Cannot find name 'ResourcePermission'.
src/core/permission/IPermissionDataProvider.ts(178,14): error TS2304: Cannot find name 'ResourcePermission'.
src/core/permission/IPermissionDataProvider.ts(203,55): error TS2304: Cannot find name 'ResourcePermission'.
src/core/permission/IPermissionDataProvider.ts(211,14): error TS2304: Cannot find name 'ResourcePermission'.
src/core/platform/__tests__/browser.spec.ts(18,18): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(19,18): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(20,21): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(21,16): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(22,14): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(27,18): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(28,18): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(29,21): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(30,16): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(31,14): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/browser.spec.ts(35,7): error TS2578: Unused '@ts-expect-error' directive.
src/core/platform/__tests__/browser.spec.ts(37,7): error TS2578: Unused '@ts-expect-error' directive.
src/core/platform/__tests__/browser.spec.ts(43,7): error TS2578: Unused '@ts-expect-error' directive.
src/core/platform/__tests__/browser.spec.ts(45,7): error TS2578: Unused '@ts-expect-error' directive.
src/core/platform/__tests__/browser.spec.ts(47,7): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/node.spec.ts(21,5): error TS2578: Unused '@ts-expect-error' directive.
src/core/platform/__tests__/platform.spec.ts(13,3): error TS2459: Module '".."' declares 'ServerStorage' locally, but it is 
not exported.
src/core/platform/__tests__/platform.spec.ts(90,24): error TS2708: Cannot use namespace 'jest' as a value.
src/core/platform/__tests__/platform.spec.ts(103,24): error TS2708: Cannot use namespace 'jest' as a value.
src/core/profile-verification/index.ts(1,15): error TS2307: Cannot find module '@/core/profileVerification/interfaces' or 
its corresponding type declarations.
src/core/resource-relationship/index.ts(1,15): error TS2307: Cannot find module '@/core/resourceRelationship/interfaces' or 
its corresponding type declarations.
src/core/resource-relationship/index.ts(2,15): error TS2307: Cannot find module 
'@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/core/resource-relationship/index.ts(3,15): error TS2307: Cannot find module '@/core/resourceRelationship/models' or its 
corresponding type declarations.
src/core/role/interfaces.ts(8,15): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, but it is not 
exported.
src/core/saved-search/index.ts(1,15): error TS2307: Cannot find module '@/core/savedSearch/interfaces' or its corresponding 
type declarations.
src/core/saved-search/index.ts(2,15): error TS2307: Cannot find module '@/core/savedSearch/models' or its corresponding type 
declarations.
src/core/saved-search/index.ts(3,15): error TS2307: Cannot find module '@/core/savedSearch/ISavedSearchDataProvider' or its 
corresponding type declarations.
src/core/webhooks/interfaces.ts(9,10): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 
'export type'.
src/hooks/__tests__/useKeyboardShortcuts.test.tsx(21,60): error TS2353: Object literal may only specify known properties, 
and 'target' does not exist in type 'KeyboardEventInit'.
src/hooks/admin/__tests__/useRoleHierarchy.test.tsx(13,39): error TS2345: Argument of type '{ isLoading: false; error: null; 
fetchApi: Mock<Procedure>; }' is not assignable to parameter of type '{ isLoading: boolean; error: string | null; fetchApi: 
<T>(url: string, options?: RequestInit) => Promise<T | null>; apiPost: <T>(url: string, body?: any) => Promise<T | null>; 
apiPatch: <T>(url: string, body?: any) => Promise<...>; apiDelete: <T>(url: string) => Promise<...>; }'.
  Type '{ isLoading: false; error: null; fetchApi: Mock<Procedure>; }' is missing the following properties from type '{ 
isLoading: boolean; error: string | null; fetchApi: <T>(url: string, options?: RequestInit | undefined) => Promise<T | 
null>; apiPost: <T>(url: string, body?: any) => Promise<...>; apiPatch: <T>(url: string, body?: any) => Promise<...>; 
apiDelete: <T>(url: string) => Promise<...>; }': apiPost, apiPatch, apiDelete
src/hooks/api-keys/__tests__/useApiKeys.test.tsx(32,58): error TS2345: Argument of type 
'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/core/api-keys/types").ApiKey[]' is not assignable to 
parameter of type 'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/core/api-keys/models").ApiKey[]'.
  Type 'ApiKey' is missing the following properties from type 'ApiKey': userId, prefix, scopes, isRevoked
src/hooks/api-keys/__tests__/useApiKeys.test.tsx(54,59): error TS2345: Argument of type 'ApiKey & { key: string; }' is not 
assignable to parameter of type 'ApiKeyCreateResult'.
  Property 'success' is missing in type 'ApiKey & { key: string; }' but required in type 'ApiKeyCreateResult'.
src/hooks/api-keys/useApiKeys.ts(22,40): error TS2554: Expected 1 arguments, but got 0.
src/hooks/api-keys/useApiKeys.ts(23,18): error TS2345: Argument of type 'ApiKey[]' is not assignable to parameter of type 
'SetStateAction<ApiKey[]>'.
  Type 'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/core/api-keys/models").ApiKey[]' is not 
assignable to type 'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/core/api-keys/types").ApiKey[]'.
    Type 'ApiKey' is missing the following properties from type 'ApiKey': keyPrefix, permissions, isActive
src/hooks/api-keys/useApiKeys.ts(43,11): error TS2554: Expected 2 arguments, but got 3.
src/hooks/api-keys/useApiKeys.ts(45,20): error TS2345: Argument of type '(prev: ApiKey[]) => (ApiKeyCreateResult | 
ApiKey)[]' is not assignable to parameter of type 'SetStateAction<ApiKey[]>'.
  Type '(prev: ApiKey[]) => (ApiKeyCreateResult | ApiKey)[]' is not assignable to type '(prevState: ApiKey[]) => ApiKey[]'.
    Type '(ApiKeyCreateResult | ApiKey)[]' is not assignable to type 'ApiKey[]'.
      Type 'ApiKeyCreateResult | ApiKey' is not assignable to type 'ApiKey'.
        Type 'ApiKeyCreateResult' is missing the following properties from type 'ApiKey': id, name, keyPrefix, permissions, 
and 2 more.
src/hooks/api-keys/useApiKeys.ts(62,29): error TS2554: Expected 2 arguments, but got 1.
src/hooks/api-keys/useApiKeys.ts(79,41): error TS2554: Expected 2 arguments, but got 1.
src/hooks/api-keys/useApiKeys.ts(80,20): error TS2345: Argument of type '(prev: ApiKey[]) => ({ success: boolean; key?: 
ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; } | ApiKey)[]' is not assignable to 
parameter of type 'SetStateAction<ApiKey[]>'.
  Type '(prev: ApiKey[]) => ({ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | 
undefined; } | ApiKey)[]' is not assignable to type '(prevState: ApiKey[]) => ApiKey[]'.
    Type '({ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; } | 
ApiKey)[]' is not assignable to type 'ApiKey[]'.
      Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; } | 
ApiKey' is not assignable to type 'ApiKey'.
        Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; }' 
is missing the following properties from type 'ApiKey': id, name, keyPrefix, permissions, and 2 more.
src/hooks/audit/__tests__/useAuditLogs.test.tsx(34,87): error TS2353: Object literal may only specify known properties, and 
'entityType' does not exist in type 'AuditLogEntry'.
src/hooks/audit/useAuditLogs.ts(36,45): error TS2554: Expected 1 arguments, but got 3.
src/hooks/audit/useAuditLogs.ts(37,5): error TS2769: No overload matches this call.
  Overload 1 of 3, '(options: DefinedInitialDataOptions<unknown, Error, unknown, (string | number | AuditLogFilters)[]>, 
queryClient?: QueryClient | undefined): DefinedUseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'keepPreviousData' does not exist in type 
'DefinedInitialDataOptions<unknown, Error, unknown, (string | number | AuditLogFilters)[]>'.
  Overload 2 of 3, '(options: UndefinedInitialDataOptions<{ logs: AuditLogEntry[]; count: number; }, Error, { logs: 
AuditLogEntry[]; count: number; }, (string | number | AuditLogFilters)[]>, queryClient?: QueryClient | undefined): 
UseQueryResult<...>', gave the following error.
    Object literal may only specify known properties, and 'keepPreviousData' does not exist in type 
'UndefinedInitialDataOptions<{ logs: AuditLogEntry[]; count: number; }, Error, { logs: AuditLogEntry[]; count: number; }, 
(string | number | AuditLogFilters)[]>'.
  Overload 3 of 3, '(options: UseQueryOptions<{ logs: AuditLogEntry[]; count: number; }, Error, { logs: AuditLogEntry[]; 
count: number; }, (string | number | AuditLogFilters)[]>, queryClient?: QueryClient | undefined): UseQueryResult<...>', gave 
the following error.
    Object literal may only specify known properties, and 'keepPreviousData' does not exist in type 'UseQueryOptions<{ logs: 
AuditLogEntry[]; count: number; }, Error, { logs: AuditLogEntry[]; count: number; }, (string | number | AuditLogFilters)[]>'.
src/hooks/audit/useAuditLogs.ts(46,24): error TS2345: Argument of type '{ format: "json" | "csv" | "xlsx" | "pdf" | 
undefined; action?: string; entityType?: string; userId?: string; startDate?: Date; endDate?: Date; search?: string; }' is 
not assignable to parameter of type 'AuditLogQuery'.
  Type '{ format: "json" | "csv" | "xlsx" | "pdf" | undefined; action?: string | undefined; entityType?: string | undefined; 
userId?: string | undefined; startDate?: Date | undefined; endDate?: Date | undefined; search?: string | undefined; }' is 
missing the following properties from type 'AuditLogQuery': page, limit
src/hooks/audit/useAuditLogs.ts(49,17): error TS2339: Property 'logs' does not exist on type '{}'.
src/hooks/audit/useAuditLogs.ts(50,18): error TS2339: Property 'total' does not exist on type '{}'.
src/hooks/auth/__tests__/useAuth.integration.test.ts(12,3): error TS2740: Type '{ login: Mock<Procedure>; register: 
Mock<Procedure>; logout: Mock<Procedure>; getCurrentUser: Mock<Procedure>; ... 11 more ...; onAuthStateChanged: Mock<...>; 
}' is missing the following properties from type 'AuthService': verifyPasswordResetToken, updatePasswordWithToken, 
sendMagicLink, verifyMagicLink, and 9 more.
src/hooks/auth/__tests__/useAuth.integration.test.ts(33,3): error TS2740: Type '{ login: Mock<Procedure>; register: 
Mock<Procedure>; logout: Mock<Procedure>; getCurrentUser: Mock<Procedure>; ... 9 more ...; onAuthStateChanged: Mock<...>; }' 
is missing the following properties from type 'AuthDataProvider': verifyPasswordResetToken, updatePasswordWithToken, 
invalidateSessions, sendMagicLink, and 4 more.
src/hooks/auth/__tests__/useAuth.integration.test.ts(70,28): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/auth/__tests__/useAuth.integration.test.ts(91,28): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/auth/__tests__/useAuth.integration.test.ts(118,28): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/auth/__tests__/useAuth.integration.test.ts(124,28): error TS2554: Expected 2-3 arguments, but got 1.
src/hooks/auth/__tests__/useAuth.test.ts(8,7): error TS2740: Type '{ login: Mock<Procedure>; register: Mock<Procedure>; 
logout: Mock<Procedure>; getCurrentUser: Mock<Procedure>; ... 11 more ...; onAuthStateChanged: Mock<...>; }' is missing the 
following properties from type 'AuthService': verifyPasswordResetToken, updatePasswordWithToken, sendMagicLink, 
verifyMagicLink, and 9 more.
src/hooks/auth/__tests__/useAuth.test.ts(34,36): error TS2339: Property 'mockResolvedValue' does not exist on type '() => 
Promise<User | null>'.
src/hooks/auth/__tests__/useAuth.test.ts(35,37): error TS2339: Property 'mockReturnValue' does not exist on type '() => 
boolean'.
src/hooks/auth/__tests__/useAuth.test.ts(36,40): error TS2339: Property 'mockImplementation' does not exist on type 
'(callback: (user: User | null) => void) => () => void'.
src/hooks/auth/__tests__/useLogin.test.ts(8,7): error TS2740: Type '{ login: Mock<Procedure>; register: Mock<Procedure>; 
logout: Mock<Procedure>; getCurrentUser: Mock<Procedure>; ... 11 more ...; onAuthStateChanged: Mock<...>; }' is missing the 
following properties from type 'AuthService': verifyPasswordResetToken, updatePasswordWithToken, sendMagicLink, 
verifyMagicLink, and 9 more.
src/hooks/auth/useAuth.ts(318,20): error TS2339: Property 'error' does not exist on type 'void'.
src/hooks/auth/useAuth.ts(319,27): error TS2339: Property 'error' does not exist on type 'void'.
src/hooks/auth/useAuth.ts(320,27): error TS2339: Property 'success' does not exist on type 'void'.
src/hooks/auth/useAuth.ts(324,9): error TS2322: Type 'void' is not assignable to type '{ success: boolean; error?: string | 
undefined; }'.
src/hooks/auth/useAuth.ts(382,55): error TS2559: Type 'boolean' has no properties in common with type 'RequestContext'.
src/hooks/auth/useAuth.ts(460,17): error TS2339: Property 'message' does not exist on type 'AuthResult'.
src/hooks/auth/useAuth.ts(635,26): error TS2339: Property 'onAuthEvent' does not exist on type 'AuthService'.
src/hooks/auth/useAuth.ts(635,39): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/hooks/auth/useAuth.ts(646,26): error TS2339: Property 'onAuthEvent' does not exist on type 'AuthService'.
src/hooks/auth/useLogin.ts(68,36): error TS2339: Property 'message' does not exist on type 'AuthResult'.
src/hooks/csrf/__tests__/useCsrf.test.tsx(17,36): error TS2353: Object literal may only specify known properties, and 
'generateToken' does not exist in type 'CsrfService'.
src/hooks/csrf/__tests__/useCsrf.test.tsx(24,20): error TS2339: Property 'generateToken' does not exist on type 
'CsrfService'.
src/hooks/csrf/__tests__/useCsrf.test.tsx(30,36): error TS2353: Object literal may only specify known properties, and 
'generateToken' does not exist in type 'CsrfService'.
src/hooks/csrf/__tests__/useCsrf.test.tsx(42,36): error TS2353: Object literal may only specify known properties, and 
'generateToken' does not exist in type 'CsrfService'.
src/hooks/csrf/useCsrf.ts(14,53): error TS2339: Property 'generateToken' does not exist on type 'CsrfService'.
src/hooks/errors/useErrorHandling.ts(2,28): error TS2724: '"@/core/common/errors"' has no exported member named 
'SERVER_ERROR'. Did you mean 'ServiceError'?
src/hooks/notification/__tests__/useNotifications.test.tsx(32,7): error TS2739: Type '{ initialize: Mock<Procedure>; 
sendNotification: Mock<Procedure>; sendBulkNotification: Mock<Procedure>; scheduleNotification: Mock<...>; ... 13 more ...; 
onNotificationEvent: Mock<...>; }' is missing the following properties from type 'NotificationService': updateTemplate, 
deleteTemplate
src/hooks/permission/useRoleHierarchy.ts(11,15): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, but it 
is not exported.
src/hooks/permission/useRoleHierarchy.ts(41,11): error TS2353: Object literal may only specify known properties, and 'id' 
does not exist in type 'ExtendedRoleHierarchyNode'.
src/hooks/permission/useRoleHierarchy.ts(52,11): error TS2353: Object literal may only specify known properties, and 'id' 
does not exist in type 'ExtendedRoleHierarchyNode'.
src/hooks/resource/useResourceHierarchy.ts(3,50): error TS2307: Cannot find module '@/core/resourceRelationship/interfaces' 
or its corresponding type declarations.
src/hooks/resource/useResourceHierarchy.ts(19,21): error TS7006: Parameter 'c' implicitly has an 'any' type.
src/hooks/team/__tests__/useTeamInvite.test.tsx(67,29): error TS2339: Property 'isSuccess' does not exist on type '{ 
isLoading: boolean; error: string | null; successMessage: string | null; inviteToTeam: (teamId: string, invitationData: 
TeamInvitationPayload) => Promise<TeamInvitationResult>; clearMessages: () => void; }'.
src/hooks/team/__tests__/useTeamInvite.test.tsx(88,29): error TS2551: Property 'isError' does not exist on type '{ 
isLoading: boolean; error: string | null; successMessage: string | null; inviteToTeam: (teamId: string, invitationData: 
TeamInvitationPayload) => Promise<TeamInvitationResult>; clearMessages: () => void; }'. Did you mean 'error'?
src/hooks/team/__tests__/useTeamInvite.test.tsx(107,29): error TS2551: Property 'isError' does not exist on type '{ 
isLoading: boolean; error: string | null; successMessage: string | null; inviteToTeam: (teamId: string, invitationData: 
TeamInvitationPayload) => Promise<TeamInvitationResult>; clearMessages: () => void; }'. Did you mean 'error'?
src/hooks/team/useRoles.ts(97,18): error TS2339: Property 'success' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(97,36): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(99,53): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(100,31): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(102,23): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(103,25): error TS2339: Property 'error' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(104,25): error TS2339: Property 'error' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(128,18): error TS2339: Property 'success' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(128,36): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(131,61): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(136,33): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(140,23): error TS2339: Property 'role' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(141,25): error TS2339: Property 'error' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(142,25): error TS2339: Property 'error' does not exist on type 'RoleWithPermissions'.
src/hooks/team/useRoles.ts(227,18): error TS2339: Property 'success' does not exist on type 'UserRole'.
src/hooks/team/useRoles.ts(230,25): error TS2339: Property 'error' does not exist on type 'UserRole'.
src/hooks/team/useRoles.ts(231,25): error TS2339: Property 'error' does not exist on type 'UserRole'.
src/hooks/team/useRoles.ts(273,68): error TS2304: Cannot find name 'UserRole'.
src/hooks/usePermission.ts(5,43): error TS2749: 'PermissionValues' refers to a value, but is being used as a type here. Did 
you mean 'typeof PermissionValues'?
src/hooks/usePermission.ts(5,62): error TS2749: 'PermissionValues' refers to a value, but is being used as a type here. Did 
you mean 'typeof PermissionValues'?
src/hooks/webhooks/__tests__/useWebhooks.test.tsx(55,54): error TS2345: Argument of type '{ name: string; url: string; 
events: never[]; }' is not assignable to parameter of type '{ name: string; events: string[]; url: string; isActive: 
boolean; }'.
  Property 'isActive' is missing in type '{ name: string; url: string; events: never[]; }' but required in type '{ name: 
string; events: string[]; url: string; isActive: boolean; }'.
src/lib/api-utils/__tests__/apiHandler.test.ts(17,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(29,40): error TS2322: Type 'string[]' is not assignable to type 
'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(37,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(50,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(63,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(76,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(89,7): error TS2322: Type 'string[]' is not assignable to type 'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api-utils/__tests__/apiHandler.test.ts(142,40): error TS2322: Type 'string[]' is not assignable to type 
'HttpMethod[]'.
  Type 'string' is not assignable to type 'HttpMethod'.
src/lib/api/__tests__/authMiddleware.test.ts(14,45): error TS2345: Argument of type '{ authService: any; }' is not 
assignable to parameter of type 'AuthMiddlewareConfig'.
  Property 'requireAuth' is missing in type '{ authService: any; }' but required in type 'AuthMiddlewareConfig'.
src/lib/api/__tests__/authMiddleware.test.ts(16,32): error TS2345: Argument of type 'Mock<Procedure>' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Mock<Procedure>' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, and 23 
more.
src/lib/api/__tests__/authMiddleware.test.ts(18,23): error TS2349: This expression is not callable.
  Type 'Promise<AuthContext>' has no call signatures.
src/lib/api/__tests__/authMiddleware.test.ts(25,45): error TS2345: Argument of type '{ authService: any; }' is not 
assignable to parameter of type 'AuthMiddlewareConfig'.
  Property 'requireAuth' is missing in type '{ authService: any; }' but required in type 'AuthMiddlewareConfig'.
src/lib/api/__tests__/authMiddleware.test.ts(27,32): error TS2345: Argument of type 'Mock<Procedure>' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Mock<Procedure>' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, and 23 
more.
src/lib/api/__tests__/authMiddleware.test.ts(29,23): error TS2349: This expression is not callable.
  Type 'Promise<AuthContext>' has no call signatures.
src/lib/api/__tests__/authMiddleware.test.ts(40,45): error TS2345: Argument of type '{ authService: any; permissionService: 
any; requiredPermissions: string[]; }' is not assignable to parameter of type 'AuthMiddlewareConfig'.
  Property 'requireAuth' is missing in type '{ authService: any; permissionService: any; requiredPermissions: string[]; }' 
but required in type 'AuthMiddlewareConfig'.
src/lib/api/__tests__/authMiddleware.test.ts(46,32): error TS2345: Argument of type 'Mock<Procedure>' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Mock<Procedure>' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, and 23 
more.
src/lib/api/__tests__/authMiddleware.test.ts(48,23): error TS2349: This expression is not callable.
  Type 'Promise<AuthContext>' has no call signatures.
src/lib/api/__tests__/authMiddleware.test.ts(59,45): error TS2345: Argument of type '{ authService: any; permissionService: 
any; requiredPermissions: string[]; }' is not assignable to parameter of type 'AuthMiddlewareConfig'.
  Property 'requireAuth' is missing in type '{ authService: any; permissionService: any; requiredPermissions: string[]; }' 
but required in type 'AuthMiddlewareConfig'.
src/lib/api/__tests__/authMiddleware.test.ts(65,32): error TS2345: Argument of type 'Mock<Procedure>' is not assignable to 
parameter of type 'NextRequest'.
  Type 'Mock<Procedure>' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua, and 23 
more.
src/lib/api/__tests__/authMiddleware.test.ts(67,23): error TS2349: This expression is not callable.
  Type 'Promise<AuthContext>' has no call signatures.
src/lib/api/axios.ts(5,29): error TS2339: Property 'apiBaseUrl' does not exist on type 'ClientEnvironmentConfig'.
src/lib/api/axios.ts(66,16): error TS2339: Property 'apiBaseUrl' does not exist on type 'ClientEnvironmentConfig'.
src/lib/api/client.ts(5,18): error TS2430: Interface 'RequestOptions' incorrectly extends interface 'RequestInit'.
  Types of property 'priority' are incompatible.
    Type 'number | undefined' is not assignable to type 'RequestPriority | undefined'.
      Type 'number' is not assignable to type 'RequestPriority | undefined'.
src/lib/api/common/errorCodes.ts(112,3): error TS2353: Object literal may only specify known properties, and 
'[USER_ERROR_CODES.NOT_FOUND]' does not exist in type 'Record<ErrorCode, number>'.
src/lib/api/errorHandler.ts(39,3): error TS2353: Object literal may only specify known properties, and 
'[USER_ERROR_CODES.NOT_FOUND]' does not exist in type 'Record<ErrorCode, ErrorCategory>'.
src/lib/api/index.ts(1,10): error TS2305: Module '"@/lib/api/client"' has no exported member 'default'.
src/lib/api/routeHandler.ts(86,13): error TS2353: Object literal may only specify known properties, and 'rateLimitOptions' 
does not exist in type 'ProtectedRouteOptions'.
src/lib/auth/__tests__/mfa/emailVerification.test.tsx(38,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.EMAIL; }' is not assignable 
to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/emailVerification.test.tsx(83,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.EMAIL; }' is not assignable 
to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/emailVerification.test.tsx(115,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.EMAIL; }' is not assignable 
to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/emailVerification.test.tsx(146,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.EMAIL; }' is not assignable 
to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/emailVerification.test.tsx(182,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.EMAIL; }' is not assignable 
to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/smsVerification.test.tsx(38,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.SMS; }' is not assignable to 
type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/smsVerification.test.tsx(83,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.SMS; }' is not assignable to 
type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/smsVerification.test.tsx(115,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.SMS; }' is not assignable to 
type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/smsVerification.test.tsx(146,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; mfaMethod: TwoFactorMethod.SMS; }' is not assignable to 
type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/smsVerification.test.tsx(172,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; onCancel: Mock<Procedure>; enableResendCode: true; enableRememberDevice: true; mfaMethod: 
TwoFactorMethod.SMS; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(63,33): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(102,33): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(154,33): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(191,33): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(225,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; enableResendCode: true; mfaMethod: "sms"; }' is not assignable to type 'IntrinsicAttributes & 
StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/mfa/verification.test.tsx(256,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; enableRememberDevice: true; mfaMethod: "totp"; }' is not assignable to type 'IntrinsicAttributes & 
StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(25,27): error TS2339: Property 'eq' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(26,27): error TS2339: Property 'single' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(27,27): error TS2339: Property 'then' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(38,27): error TS2339: Property 'eq' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(39,27): error TS2339: Property 'single' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(40,27): error TS2339: Property 'then' does not exist on type 
'PostgrestQueryBuilder<GenericSchema, GenericTable, "organizations", GenericRelationship[]>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(76,5): error TS2741: Property 'sso_enabled' is missing in type '{ 
id: string; name: string; domain: string; security_settings: { session_timeout_mins: number; max_sessions_per_user: number; 
enforce_ip_restrictions: boolean; allowed_ip_ranges: string[]; enforce_device_restrictions: boolean; allowed_device_types: 
string[]; require_reauth_for_sensitive: boolean; sensitive_actions: ...' but required in type 'Organization'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(88,23): error TS7017: Element implicitly has an 'any' type because 
type 'typeof globalThis' has no index signature.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(289,23): error TS2554: Expected 1 arguments, but got 0.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(302,18): error TS2339: Property 'mockImplementation' does not exist 
on type '<FnName extends string, Fn extends GenericFunction>(fn: FnName, args?: Fn["Args"] | undefined, options?: { head?: 
boolean | undefined; get?: boolean | undefined; count?: "exact" | "planned" | "estimated" | undefined; } | undefined) => 
PostgrestFilterBuilder<...>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(343,18): error TS2339: Property 'mockImplementation' does not exist 
on type '<FnName extends string, Fn extends GenericFunction>(fn: FnName, args?: Fn["Args"] | undefined, options?: { head?: 
boolean | undefined; get?: boolean | undefined; count?: "exact" | "planned" | "estimated" | undefined; } | undefined) => 
PostgrestFilterBuilder<...>'.
src/lib/auth/__tests__/session/businessPolicies.test.tsx(368,38): error TS2339: Property 'mockResolvedValueOnce' does not 
exist on type '(credentials: SignInWithPasswordCredentials) => Promise<AuthTokenResponsePassword>'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(98,23): error TS7017: Element implicitly has an 'any' type because type 
'typeof globalThis' has no index signature.
src/lib/auth/__tests__/sso/businessSso.test.tsx(117,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(155,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(194,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(231,13): error TS2339: Property 'createMockBuilder' does not exist on type 
'typeof import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/tests/mocks/supabase")'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(278,29): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/lib/auth/__tests__/sso/businessSso.test.tsx(334,26): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/lib/auth/__tests__/sso/personalSso.test.tsx(64,45): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/lib/auth/__tests__/sso/personalSso.test.tsx(65,61): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/lib/auth/__tests__/sso/personalSso.test.tsx(66,51): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type 
arguments.
src/lib/auth/getUser.ts(59,7): error TS2353: Object literal may only specify known properties, and 'name' does not exist in 
type 'User'.
src/lib/auth/hasPermission.ts(1,10): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, but it is not 
exported.
src/lib/auth/unifiedAuth.middleware.ts(82,61): error TS2551: Property 'getUserPermissions' does not exist on type 
'PermissionService'. Did you mean 'getRolePermissions'?
src/lib/config/serviceContainer.ts(141,5): error TS2739: Type 'DefaultGdprService' is missing the following properties from 
type 'GdprService': generateUserExport, deleteUserData
src/lib/config/serviceContainer.ts(287,5): error TS2322: Type 'AddressService | undefined' is not assignable to type 
'AddressService'.
  Type 'undefined' is not assignable to type 'AddressService'.
src/lib/config/serviceContainer.ts(336,3): error TS2739: Type 'DefaultGdprService' is missing the following properties from 
type 'GdprService': generateUserExport, deleteUserData
src/lib/context/SsoContext.tsx(2,15): error TS2395: Individual declarations in merged declaration 'SsoProvider' must be all 
exported or all local.
src/lib/context/SsoContext.tsx(22,14): error TS2395: Individual declarations in merged declaration 'SsoProvider' must be all 
exported or all local.
src/lib/database/__tests__/transactionManager.test.ts(32,38): error TS2345: Argument of type '"USER_GENERAL_003"' is not 
assignable to parameter of type 'ErrorCode'.
src/lib/database/__tests__/transactionManager.test.ts(46,38): error TS2345: Argument of type '"SERVER_GENERAL_003"' is not 
assignable to parameter of type 'ErrorCode'.
src/lib/database/__tests__/transactionManager.test.ts(51,38): error TS2345: Argument of type '"USER_GENERAL_003"' is not 
assignable to parameter of type 'ErrorCode'.
src/lib/exports/__tests__/resumableExport.service.test.ts(23,68): error TS2345: Argument of type '{ profile: {}; }' is not 
assignable to parameter of type 'UserExportData'.
  Type '{ profile: {}; }' is missing the following properties from type 'UserExportData': preferences, activityLogs
src/lib/exports/__tests__/resumableExport.service.test.ts(46,68): error TS2345: Argument of type '{ profile: {}; }' is not 
assignable to parameter of type 'UserExportData'.
  Type '{ profile: {}; }' is missing the following properties from type 'UserExportData': preferences, activityLogs
src/lib/exports/resumableExport.service.ts(14,3): error TS2305: Module '"@/lib/exports/export.service"' has no exported 
member 'getCompanyExportData'.
src/lib/exports/resumableExport.service.ts(15,3): error TS2305: Module '"@/lib/exports/export.service"' has no exported 
member 'getCompanyDataExportById'.
src/lib/i18n/__tests__/initializeI18n.test.ts(8,7): error TS2322: Type '"de"' is not assignable to type '"en" | "es" | "fr" 
| undefined'.
src/lib/i18n/__tests__/messages.test.ts(9,7): error TS2322: Type '"de"' is not assignable to type '"en" | "es" | "fr" | 
undefined'.
src/lib/i18n/__tests__/messages.test.ts(11,48): error TS2345: Argument of type '"de"' is not assignable to parameter of type 
'"en" | "es" | "fr"'.
src/lib/monitoring/__tests__/telemetry.test.ts(30,28): error TS2339: Property 'size' does not exist on type 'Set<string> | 
ErrorMetrics'.
  Property 'size' does not exist on type 'ErrorMetrics'.
src/lib/monitoring/__tests__/telemetry.test.ts(31,28): error TS2339: Property 'get' does not exist on type 'ErrorMetrics | 
Map<string, number>'.
  Property 'get' does not exist on type 'ErrorMetrics'.
src/lib/monitoring/__tests__/telemetry.test.ts(32,28): error TS2339: Property 'get' does not exist on type 'ErrorMetrics | 
Map<string, number>'.
  Property 'get' does not exist on type 'ErrorMetrics'.
src/lib/monitoring/__tests__/telemetry.test.ts(33,27): error TS2339: Property 'get' does not exist on type 'ErrorMetrics | 
Map<string, number>'.
  Property 'get' does not exist on type 'ErrorMetrics'.
src/lib/monitoring/__tests__/telemetry.test.ts(41,12): error TS7053: Element implicitly has an 'any' type because expression 
of type '0' can't be used to index type 'number[] | ErrorMetrics'.
  Property '0' does not exist on type 'number[] | ErrorMetrics'.
src/lib/offline/requestQueue.ts(81,26): error TS2339: Property 'maxRetries' does not exist on type 'RequestOptions'.
src/lib/payments/stripe.ts(11,3): error TS2322: Type '"2023-10-16"' is not assignable to type '"2025-05-28.basil"'.
src/lib/profile/verificationService.ts(13,18): error TS2554: Expected 2-3 arguments, but got 0.
src/lib/profile/verificationService.ts(37,6): error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { user_id: string; status: string; document_url: string | null; admin_feedback: null; 
updated_at: string; }, options?: { onConflict?: string | undefined; ignoreDuplicates?: boolean | undefined; count?: "exact" 
| ... 2 more ... | undefined; } | undefined): PostgrestFilterBuilder<...>', gave the following error.
    Type 'string[]' is not assignable to type 'string'.
  Overload 2 of 2, '(values: any[], options?: { onConflict?: string | undefined; ignoreDuplicates?: boolean | undefined; 
count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): 
PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'user_id' does not exist in type 'any[]'.
src/lib/rbac/__tests__/roleService.test.ts(43,21): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(57,23): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(66,23): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(67,23): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(75,9): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(76,9): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(91,9): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(98,23): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/__tests__/roleService.test.ts(108,9): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/lib/rbac/roleService.ts(102,34): error TS2693: 'Permission' only refers to a type, but is being used as a value here.
src/lib/security/securityPolicy.service.ts(121,39): error TS2769: No overload matches this call.
  Overload 1 of 4, '(value: string | number | Date): Date', gave the following error.
    Argument of type '{}' is not assignable to parameter of type 'string | number | Date'.
  Overload 2 of 4, '(value: string | number): Date', gave the following error.
    Argument of type '{}' is not assignable to parameter of type 'string | number'.
src/lib/services/__tests__/offlineQueue.service.test.ts(15,38): error TS2322: Type 'Promise<number>' is not assignable to 
type 'Promise<void>'.
  Type 'number' is not assignable to type 'void'.
src/lib/services/__tests__/offlineQueue.service.test.ts(16,38): error TS2322: Type 'Promise<number>' is not assignable to 
type 'Promise<void>'.
  Type 'number' is not assignable to type 'void'.
src/lib/services/__tests__/offlineQueue.service.test.ts(17,38): error TS2322: Type 'Promise<number>' is not assignable to 
type 'Promise<void>'.
  Type 'number' is not assignable to type 'void'.
src/lib/services/__tests__/offlineQueue.service.test.ts(26,49): error TS2322: Type 'Promise<number>' is not assignable to 
type 'Promise<void>'.
  Type 'number' is not assignable to type 'void'.
src/lib/services/__tests__/resourceRelationship.service.test.ts(24,27): error TS2558: Expected 0-1 type arguments, but got 2.
src/lib/services/__tests__/resourceRelationship.service.test.ts(68,27): error TS2558: Expected 0-1 type arguments, but got 2.
src/lib/services/__tests__/resourceRelationship.service.test.ts(81,27): error TS2558: Expected 0-1 type arguments, but got 2.
src/lib/services/__tests__/resourceRelationship.service.test.ts(89,27): error TS2558: Expected 0-1 type arguments, but got 2.
src/lib/services/__tests__/retention.service.test.ts(33,41): error TS2345: Argument of type '{ eq: Mock<Procedure>; }' is 
not assignable to parameter of type '{ eq: Mock<Procedure>; error: null; }'.
  Property 'error' is missing in type '{ eq: Mock<Procedure>; }' but required in type '{ eq: Mock<Procedure>; error: null; 
}'.
src/lib/services/roleHierarchy.service.ts(157,29): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/lib/services/roleHierarchy.service.ts(174,48): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/lib/stores/__tests__/auth.store.direct.test.ts(46,18): error TS2339: Property 'setState' does not exist on type '() => { 
user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; successMessage: 
string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | undefined) => 
Promise<...>; }'.
src/lib/stores/__tests__/auth.store.direct.test.ts(60,32): error TS2339: Property 'getState' does not exist on type '() => { 
user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; successMessage: 
string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | undefined) => 
Promise<...>; }'.
src/lib/stores/__tests__/auth.store.direct.test.ts(96,18): error TS2339: Property 'setState' does not exist on type '() => { 
user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; successMessage: 
string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | undefined) => 
Promise<...>; }'.
src/lib/stores/__tests__/auth.store.direct.test.ts(110,54): error TS2339: Property 'getState' does not exist on type '() => 
{ user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; 
successMessage: string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | 
undefined) => Promise<...>; }'.
src/lib/stores/__tests__/auth.store.direct.test.ts(144,18): error TS2339: Property 'setState' does not exist on type '() => 
{ user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; 
successMessage: string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | 
undefined) => Promise<...>; }'.
src/lib/stores/__tests__/auth.store.direct.test.ts(158,36): error TS2339: Property 'getState' does not exist on type '() => 
{ user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; 
successMessage: string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | 
undefined) => Promise<...>; }'.
src/lib/stores/__tests__/auth.store.minimal.test.ts(10,19): error TS2304: Cannot find name 'useAuthStore'.
src/lib/stores/__tests__/auth.store.test.ts(54,18): error TS2339: Property 'setState' does not exist on type '() => UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(92,19): error TS2339: Property 'setState' does not exist on type '() => UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(96,32): error TS2339: Property 'getState' does not exist on type '() => UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(116,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(121,73): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(122,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(124,60): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(125,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(131,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(133,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(148,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(150,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(177,22): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(179,80): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(180,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(181,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(182,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(189,37): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(192,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(211,37): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(214,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(238,22): error TS2339: Property 'setState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(244,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(247,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(262,33): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(265,37): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(275,22): error TS2339: Property 'setState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(277,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(280,22): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(282,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(290,22): error TS2339: Property 'setState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(292,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(295,22): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(297,27): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(310,7): error TS2322: Type 'Location' is not assignable to type 'string & 
Location'.
  Type 'Location' is not assignable to type 'string'.
src/lib/stores/__tests__/auth.store.test.ts(312,22): error TS2339: Property 'setState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(319,7): error TS2322: Type 'Location' is not assignable to type 'string & 
Location'.
  Type 'Location' is not assignable to type 'string'.
src/lib/stores/__tests__/auth.store.test.ts(324,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(327,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(338,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(341,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(354,28): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/auth.store.test.ts(357,34): error TS2339: Property 'getState' does not exist on type '() => 
UseAuth'.
src/lib/stores/__tests__/preferences.store.test.ts(20,7): error TS2739: Type '{ id: string; userId: string; language: 
string; theme: "dark"; notifications: { email: true; push: false; marketing: false; }; createdAt: Date; updatedAt: Date; }' 
is missing the following properties from type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: 
string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }': itemsPerPage, timezone, dateFormat
src/lib/stores/__tests__/preferences.store.test.ts(41,19): error TS2339: Property 'getState' does not exist on type '() => { 
user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; successMessage: 
string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | undefined) => 
Promise<...>; }'.
src/lib/stores/__tests__/preferences.store.test.ts(84,23): error TS2339: Property 'getState' does not exist on type '() => { 
user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; successMessage: 
string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | undefined) => 
Promise<...>; }'.
src/lib/stores/__tests__/preferences.store.test.ts(169,23): error TS2339: Property 'getState' does not exist on type '() => 
{ user: User | null; token: string | null; isLoading: boolean; isAuthenticated: boolean; error: string | null; 
successMessage: string | null; rateLimitInfo: any; mfaEnabled: boolean; ... 19 more ...; deleteAccount: (password?: string | 
undefined) => Promise<...>; }'.
src/lib/stores/__tests__/subscription.store.test.ts(71,40): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(83,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(87,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(98,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(102,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(113,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(117,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(128,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(132,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(142,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(146,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(154,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(159,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(166,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(178,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(185,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(195,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(205,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(211,36): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(214,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(223,36): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(226,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(239,51): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(243,42): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(252,38): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/__tests__/subscription.store.test.ts(256,35): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/lib/stores/auth.store.ts(32,25): error TS2339: Property 'rateLimitInfo' does not exist on type 'UseAuth'.
src/lib/stores/auth.store.ts(38,46): error TS2551: Property 'setLoading' does not exist on type 'UseAuth'. Did you mean 
'isLoading'?
src/lib/stores/auth.store.ts(40,38): error TS2551: Property 'handleSessionTimeout' does not exist on type 'UseAuth'. Did you 
mean 'onSessionTimeout'?
src/lib/stores/auth.store.ts(46,19): error TS2554: Expected 2-3 arguments, but got 1.
src/lib/stores/auth.store.ts(60,37): error TS2551: Property 'clearSuccessMessage' does not exist on type 'UseAuth'. Did you 
mean 'successMessage'?
src/lib/stores/auth.store.ts(87,7): error TS2322: Type '{ success: boolean; error?: string | undefined; }' is not assignable 
to type 'void'.
src/lib/stores/auth.store.ts(93,7): error TS2322: Type '{ success: boolean; error?: string | undefined; }' is not assignable 
to type 'void'.
src/lib/stores/auth.store.ts(99,7): error TS2322: Type '{ success: boolean; error?: string | undefined; }' is not assignable 
to type 'void'.
src/lib/stores/connectedAccounts.store.ts(13,13): error TS2353: Object literal may only specify known properties, and 
'isLoading' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | 
Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(15,13): error TS2353: Object literal may only specify known properties, and 
'accounts' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | 
Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(18,9): error TS2353: Object literal may only specify known properties, and 'error' 
does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(26,13): error TS2353: Object literal may only specify known properties, and 
'isLoading' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | 
Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(63,15): error TS2353: Object literal may only specify known properties, and 
'error' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(71,9): error TS2353: Object literal may only specify known properties, and 'error' 
does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(79,13): error TS2353: Object literal may only specify known properties, and 
'isLoading' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | 
Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(84,51): error TS2304: Cannot find name 'ConnectedAccount'.
src/lib/stores/connectedAccounts.store.ts(89,9): error TS2353: Object literal may only specify known properties, and 'error' 
does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | Partial<ConnectedAccountsState>'.
src/lib/stores/connectedAccounts.store.ts(96,11): error TS2353: Object literal may only specify known properties, and 
'error' does not exist in type '(state: ConnectedAccountsState) => ConnectedAccountsState | Partial<ConnectedAccountsState>'.
src/lib/stores/preferences.store.ts(97,40): error TS2339: Property 'destroy' does not exist on type 
'UseBoundStore<StoreApi<PreferencesInternalState>>'.
src/lib/stores/preferences.store.ts(110,33): error TS2339: Property 'destroy' does not exist on type 
'UseBoundStore<StoreApi<PreferencesInternalState>>'.
src/lib/stores/rbac.store.ts(3,21): error TS2459: Module '"@/types/rbac"' declares 'Role' locally, but it is not exported.
src/lib/stores/rbac.store.ts(3,27): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, but it is not 
exported.
src/lib/stores/subscription.store.ts(88,13): error TS2345: Argument of type '(state: SubscriptionInternalState) => { 
userSubscription: { status: "canceled"; canceledAt: string; id: string; userId: string; planId: string; startDate: string | 
Date; ... 4 more ...; paymentProviderData?: Record<...> | undefined; } | null; isLoading: false; }' is not assignable to 
parameter of type 'SubscriptionInternalState | Partial<SubscriptionInternalState> | ((state: SubscriptionInternalState) => 
SubscriptionInternalState | Partial<...>)'.
  Type '(state: SubscriptionInternalState) => { userSubscription: { status: "canceled"; canceledAt: string; id: string; 
userId: string; planId: string; startDate: string | Date; ... 4 more ...; paymentProviderData?: Record<...> | undefined; } | 
null; isLoading: false; }' is not assignable to type '(state: SubscriptionInternalState) => SubscriptionInternalState | 
Partial<SubscriptionInternalState>'.
    Type '{ userSubscription: { status: "canceled"; canceledAt: string; id: string; userId: string; planId: string; 
startDate: string | Date; metadata?: Record<string, any> | undefined; endDate?: string | ... 1 more ... | undefined; 
renewalDate?: string | ... 1 more ... | undefined; paymentMethod?: string | undefined; payment...' is not assignable to type 
'SubscriptionInternalState | Partial<SubscriptionInternalState>'.
      Type '{ userSubscription: { status: "canceled"; canceledAt: string; id: string; userId: string; planId: string; 
startDate: string | Date; metadata?: Record<string, any> | undefined; endDate?: string | ... 1 more ... | undefined; 
renewalDate?: string | ... 1 more ... | undefined; paymentMethod?: string | undefined; payment...' is not assignable to type 
'Partial<SubscriptionInternalState>'.
        Types of property 'userSubscription' are incompatible.
          Type '{ status: "canceled"; canceledAt: string; id: string; userId: string; planId: string; startDate: string | 
Date; metadata?: Record<string, any> | undefined; endDate?: string | Date | undefined; renewalDate?: string | ... 1 more ... 
| undefined; paymentMethod?: string | undefined; paymentProviderData?: Record<...> | u...' is not assignable to type '{ id: 
string; status: SubscriptionStatus; userId: string; planId: string; startDate: string | Date; metadata?: Record<string, any> 
| undefined; ... 4 more ...; paymentProviderData?: Record<...> | undefined; } | null | undefined'.
            Type '{ status: "canceled"; canceledAt: string; id: string; userId: string; planId: string; startDate: string | 
Date; metadata?: Record<string, any> | undefined; endDate?: string | Date | undefined; renewalDate?: string | ... 1 more ... 
| undefined; paymentMethod?: string | undefined; paymentProviderData?: Record<...> | u...' is not assignable to type '{ id: 
string; status: SubscriptionStatus; userId: string; planId: string; startDate: string | Date; metadata?: Record<string, any> 
| undefined; endDate?: string | ... 1 more ... | undefined; renewalDate?: string | ... 1 more ... | undefined; canceledAt?: 
string | ... 1 more ... | undefined; paymentMethod?: string | ...'.
              Types of property 'status' are incompatible.
                Type '"canceled"' is not assignable to type 'SubscriptionStatus'.
src/lib/stores/subscription.store.ts(125,3): error TS2322: Type '() => boolean | undefined' is not assignable to type '() => 
boolean'.
  Type 'boolean | undefined' is not assignable to type 'boolean'.
    Type 'undefined' is not assignable to type 'boolean'.
src/lib/stores/subscription.store.ts(194,11): error TS2339: Property 'userManagement' does not exist on type 
'UserManagementContextValue'.
src/lib/telemetry/errorMetrics.ts(107,58): error TS7053: Element implicitly has an 'any' type because expression of type 
'string' can't be used to index type '{ low: number; medium: number; high: number; critical: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ low: number; medium: number; high: number; 
critical: number; }'.
src/lib/utils/__tests__/errorFactory.test.ts(32,77): error TS2345: Argument of type '"zz"' is not assignable to parameter of 
type '"en" | "es" | "fr" | undefined'.
src/lib/utils/__tests__/errorFactory.test.ts(48,72): error TS2345: Argument of type '"zz"' is not assignable to parameter of 
type '"en" | "es" | "fr" | undefined'.
src/lib/utils/__tests__/errorFactory.test.ts(59,61): error TS2345: Argument of type '"zz"' is not assignable to parameter of 
type '"en" | "es" | "fr" | undefined'.
src/lib/utils/__tests__/errorTranslator.test.ts(57,19): error TS2339: Property 'stack' does not exist on type '{ requestId?: 
string | undefined; code: ErrorCode; message: string; }'.
src/lib/utils/errorFactory.ts(48,42): error TS2345: Argument of type 'Record<string, string | number>' is not assignable to 
parameter of type 'Record<string, string>'.
  'string' index signatures are incompatible.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
src/lib/utils/errorFactory.ts(124,5): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/lib/utils/errorFactory.ts(144,35): error TS2345: Argument of type '"USER_GENERAL_001"' is not assignable to parameter of 
type 'ErrorCode'.
src/lib/utils/errorFactory.ts(145,22): error TS2345: Argument of type '"USER_GENERAL_001"' is not assignable to parameter of 
type 'ErrorCode'.
src/lib/utils/errorTranslator.ts(52,73): error TS2345: Argument of type 'string' is not assignable to parameter of type 
'"en" | "es" | "fr" | undefined'.
src/lib/utils/errorTranslator.ts(55,85): error TS2345: Argument of type 'string' is not assignable to parameter of type 
'"en" | "es" | "fr" | undefined'.
src/lib/utils/index.ts(11,1): error TS2308: Module '@/lib/utils/errorFactory' has already exported a member named 
'enhanceError'. Consider explicitly re-exporting to resolve the ambiguity.
src/lib/webauthn/webauthn.service.ts(8,3): error TS2724: '"@simplewebauthn/types"' has no exported member named 
'RegistrationCredentialJSON'. Did you mean 'RegistrationCredential'?
src/lib/webauthn/webauthn.service.ts(9,3): error TS2724: '"@simplewebauthn/types"' has no exported member named 
'AuthenticationCredentialJSON'. Did you mean 'AuthenticationCredential'?
src/lib/webauthn/webauthn.service.ts(31,53): error TS2345: Argument of type '{ rpName: string; rpID: string; userID: string; 
attestationType: "none"; excludeCredentials: any; authenticatorSelection: { userVerification: "preferred"; residentKey: 
"preferred"; }; }' is not assignable to parameter of type 'GenerateRegistrationOptionsOpts'.
  Property 'userName' is missing in type '{ rpName: string; rpID: string; userID: string; attestationType: "none"; 
excludeCredentials: any; authenticatorSelection: { userVerification: "preferred"; residentKey: "preferred"; }; }' but 
required in type 'GenerateRegistrationOptionsOpts'.
src/lib/webauthn/webauthn.service.ts(73,5): error TS2353: Object literal may only specify known properties, and 'credential' 
does not exist in type 'VerifyRegistrationResponseOpts'.
src/lib/webauthn/webauthn.service.ts(174,5): error TS2353: Object literal may only specify known properties, and 
'credential' does not exist in type 'VerifyAuthenticationResponseOpts'.
src/lib/webhooks/__tests__/webhookSender.test.ts(53,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(59,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(63,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(delivery: WebhookDelivery) => Promise<void>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(73,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(76,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(delivery: WebhookDelivery) => Promise<void>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(86,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(89,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(delivery: WebhookDelivery) => Promise<void>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(98,29): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string, webhookId: string, query?: number | WebhookDeliveryQuery | undefined) => Promise<{ deliveries: 
WebhookDelivery[]; pagination?: PaginationMeta | undefined; }>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(105,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(116,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(119,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(delivery: WebhookDelivery) => Promise<void>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(129,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(132,29): error TS2339: Property 'mockResolvedValue' does not exist on type 
'(delivery: WebhookDelivery) => Promise<void>'.
src/lib/webhooks/__tests__/webhookSender.test.ts(143,27): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '(userId: string) => Promise<Webhook[]>'.
src/lib/webhooks/webhookSender.ts(238,5): error TS2740: Type '{ deliveries: WebhookDelivery[]; pagination?: PaginationMeta | 
undefined; }' is missing the following properties from type 'WebhookDelivery[]': length, pop, push, concat, and 35 more.
src/middleware/__tests__/createMiddlewareChain.test.ts(40,8): error TS2307: Cannot find module '@/config/apiRoutes.config' 
or its corresponding type declarations.
src/middleware/__tests__/csrf.test.ts(9,5): error TS2698: Spread types may only be created from object types.
src/middleware/__tests__/errorHandling.test.ts(24,26): error TS2345: Argument of type '"test/error"' is not assignable to 
parameter of type 'ErrorCode'.
src/middleware/__tests__/index.test.ts(130,17): error TS2353: Object literal may only specify known properties, and 'origin' 
does not exist in type 'CorsOptions'.
src/middleware/__tests__/permissions.test.ts(61,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(81,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(108,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(121,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(138,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(175,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(190,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(207,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(222,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/permissions.test.ts(237,29): error TS2693: 'Permission' only refers to a type, but is being used as 
a value here.
src/middleware/__tests__/routeAuth.test.ts(52,113): error TS2693: 'Permission' only refers to a type, but is being used as a 
value here.
src/middleware/auditLog.ts(148,8): error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: Record<string, unknown>, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | 
undefined): PostgrestFilterBuilder<GenericSchema, Record<string, unknown>, null, "audit_logs", GenericRelationship[]>', gave 
the following error.
    Argument of type 'AuditLogEntry[]' is not assignable to parameter of type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'AuditLogEntry[]'.
  Overload 2 of 2, '(values: Record<string, unknown>[], options?: { count?: "exact" | "planned" | "estimated" | undefined; 
defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<GenericSchema, Record<...>, null, "audit_logs", 
GenericRelationship[]>', gave the following error.
    Type 'AuditLogEntry' is not assignable to type 'Record<string, unknown>'.
      Index signature for type 'string' is missing in type 'AuditLogEntry'.
src/middleware/createMiddlewareChain.ts(113,34): error TS2345: Argument of type '{ optional?: boolean | undefined; 
includeUser?: boolean | undefined; requiredPermissions?: string[] | undefined; requiredRoles?: string[] | undefined; }' is 
not assignable to parameter of type 'RouteAuthOptions'.
  Types of property 'requiredPermissions' are incompatible.
    Type 'string[] | undefined' is not assignable to type 'Permission[] | undefined'.
      Type 'string[]' is not assignable to type 'Permission[]'.
        Type 'string' is not assignable to type 'Permission'.
src/middleware/permissions.ts(53,41): error TS2339: Property 'getSession' does not exist on type 'AuthService'.
src/middleware/protectedRoute.ts(39,9): error TS2345: Argument of type '{ requiredPermissions: string[]; } | {}' is not 
assignable to parameter of type 'RouteAuthOptions | undefined'.
  Type '{ requiredPermissions: string[]; }' is not assignable to type 'RouteAuthOptions'.
    Types of property 'requiredPermissions' are incompatible.
      Type 'string[]' is not assignable to type 'Permission[]'.
        Type 'string' is not assignable to type 'Permission'.
src/middleware/registry.ts(16,1): error TS2308: Module '@/middleware/index' has already exported a member named 
'withSecurity'. Consider explicitly re-exporting to resolve the ambiguity.
src/middleware/securityHeaders.ts(51,7): error TS2739: Type '{ contentSecurityPolicy: { directives: CSPDirectives; }; 
xFrameOptions: string; xContentTypeOptions: true; referrerPolicy: string; strictTransportSecurity: { enabled: true; maxAge: 
number; includeSubDomains: true; preload: true; }; xXSSProtection: string; xPermittedCrossDomainPolicies: string; 
xDNSPrefetchControl: t...' is missing the following properties from type 'Required<SecurityHeadersOptions>': 
additionalHeaders, onError
src/scripts/fixInitialization.ts(88,7): error TS2353: Object literal may only specify known properties, and 'apiClient' does 
not exist in type 'WebhookServiceConfig'.
src/scripts/fixInitialization.ts(121,7): error TS2739: Type '{ redirects: { afterLogin: string; afterLogout: string; 
afterRegistration: string; afterPasswordReset: string; }; }' is missing the following properties from type 
'UserManagementOptions': baseUrl, api, ui, security
src/services/address/defaultAddress.service.ts(71,17): error TS2339: Property 'map' does not exist on type '{ addresses: 
CompanyAddress[]; count: number; }'.
src/services/address/defaultAddress.service.ts(71,21): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/services/address/defaultAddress.service.ts(77,24): error TS2339: Property 'find' does not exist on type '{ addresses: 
CompanyAddress[]; count: number; }'.
src/services/address/defaultAddress.service.ts(77,29): error TS7006: Parameter 'a' implicitly has an 'any' type.
src/services/admin/defaultAdmin.service.ts(46,9): error TS2416: Property 'searchUsers' in type 'DefaultAdminService' is not 
assignable to the same property in base type 'AdminService'.
  Type '(params: SearchUsersParams) => Promise<SearchResult>' is not assignable to type '(params: SearchUsersParams) => 
Promise<{ users: any[]; pagination: PaginationMeta; }>'.
    Type 'Promise<SearchResult>' is not assignable to type 'Promise<{ users: any[]; pagination: PaginationMeta; }>'.
      Type 'SearchResult' is not assignable to type '{ users: any[]; pagination: PaginationMeta; }'.
        Types of property 'pagination' are incompatible.
          Type '{ page: number; limit: number; totalCount: number; totalPages: number; }' is missing the following 
properties from type 'PaginationMeta': pageSize, totalItems, hasNextPage, hasPreviousPage
src/services/admin/defaultAdmin.service.ts(55,36): error TS2352: Conversion of type '{ users: UserProfile[]; pagination: 
PaginationMeta; }' to type 'SearchResult' may be a mistake because neither type sufficiently overlaps with the other. If 
this was intentional, convert the expression to 'unknown' first.
  Types of property 'pagination' are incompatible.
    Type 'PaginationMeta' is missing the following properties from type '{ page: number; limit: number; totalCount: number; 
totalPages: number; }': limit, totalCount
src/services/admin/defaultAdmin.service.ts(56,12): error TS2352: Conversion of type '{ users: UserProfile[]; pagination: 
PaginationMeta; }' to type 'SearchResult' may be a mistake because neither type sufficiently overlaps with the other. If 
this was intentional, convert the expression to 'unknown' first.
  Types of property 'pagination' are incompatible.
    Type 'PaginationMeta' is missing the following properties from type '{ page: number; limit: number; totalCount: number; 
totalPages: number; }': limit, totalCount
src/services/admin/factory.ts(46,7): error TS2322: Type 'DefaultAdminService' is not assignable to type 'AdminService'.
  The types returned by 'searchUsers(...)' are incompatible between these types.
    Type 'Promise<SearchResult>' is not assignable to type 'Promise<{ users: any[]; pagination: PaginationMeta; }>'.
      Type 'SearchResult' is not assignable to type '{ users: any[]; pagination: PaginationMeta; }'.
        Types of property 'pagination' are incompatible.
          Type '{ page: number; limit: number; totalCount: number; totalPages: number; }' is missing the following 
properties from type 'PaginationMeta': pageSize, totalItems, hasNextPage, hasPreviousPage
src/services/admin/factory.ts(50,3): error TS2322: Type 'AdminService | null' is not assignable to type 'AdminService'.
  Type 'null' is not assignable to type 'AdminService'.
src/services/admin/index.ts(10,3): error TS2322: Type 'DefaultAdminService' is not assignable to type 'AdminService'.
  The types returned by 'searchUsers(...)' are incompatible between these types.
    Type 'Promise<SearchResult>' is not assignable to type 'Promise<{ users: any[]; pagination: PaginationMeta; }>'.
      Type 'SearchResult' is not assignable to type '{ users: any[]; pagination: PaginationMeta; }'.
        Types of property 'pagination' are incompatible.
          Type '{ page: number; limit: number; totalCount: number; totalPages: number; }' is missing the following 
properties from type 'PaginationMeta': pageSize, totalItems, hasNextPage, hasPreviousPage
src/services/api-keys/defaultApiKeys.service.ts(20,5): error TS2740: Type 'ApiKeyListResult' is missing the following 
properties from type 'ApiKey[]': length, pop, push, concat, and 35 more.
src/services/api-keys/defaultApiKeys.service.ts(56,26): error TS2339: Property 'find' does not exist on type 
'ApiKeyListResult'.
src/services/api-keys/defaultApiKeys.service.ts(56,31): error TS7006: Parameter 'k' implicitly has an 'any' type.
src/services/auth/__tests__/auth.store.test.ts(10,3): error TS2322: Type '{ login: Mock<Procedure> | ((credentials: 
LoginPayload) => Promise<AuthResult>); register: Mock<Procedure> | ((userData: RegistrationPayload) => Promise<AuthResult>); 
... 19 more ...; handleSessionTimeout?: (() => void) | undefined; }' is not assignable to type 'AuthDataProvider'.
  Types of property 'verifyPasswordResetToken' are incompatible.
    Type '((token: string) => Promise<{ valid: boolean; user?: User | undefined; token?: string | undefined; error?: string 
| undefined; }>) | undefined' is not assignable to type '(token: string) => Promise<{ valid: boolean; user?: User | 
undefined; token?: string | undefined; error?: string | undefined; }>'.
      Type 'undefined' is not assignable to type '(token: string) => Promise<{ valid: boolean; user?: User | undefined; 
token?: string | undefined; error?: string | undefined; }>'.
src/services/auth/__tests__/businessSso.test.tsx(96,23): error TS7017: Element implicitly has an 'any' type because type 
'typeof globalThis' has no index signature.
src/services/auth/__tests__/businessSso.test.tsx(115,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/services/auth/__tests__/businessSso.test.tsx(153,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/services/auth/__tests__/businessSso.test.tsx(192,24): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/services/auth/__tests__/businessSso.test.tsx(229,13): error TS2339: Property 'createMockBuilder' does not exist on type 
'typeof import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/tests/mocks/supabase")'.
src/services/auth/__tests__/businessSso.test.tsx(276,29): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/services/auth/__tests__/businessSso.test.tsx(332,26): error TS2322: Type '{ orgId: string; }' is not assignable to type 
'IntrinsicAttributes & BusinessSSOAuthProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOAuthProps'.
src/services/auth/__tests__/factory.test.ts(39,25): error TS2740: Type 'MockAuthService' is missing the following properties 
from type 'AuthService': verifyPasswordResetToken, updatePasswordWithToken, sendMagicLink, verifyMagicLink, and 8 more.
src/services/auth/__tests__/mocks/auth.store.mock.ts(50,3): error TS2322: Type 'Mock<() => Promise<{ accessToken: string; 
refreshToken: string; expiresAt: number; }>>' is not assignable to type '() => Promise<boolean>'.
  Type 'Promise<{ accessToken: string; refreshToken: string; expiresAt: number; }>' is not assignable to type 
'Promise<boolean>'.
    Type '{ accessToken: string; refreshToken: string; expiresAt: number; }' is not assignable to type 'boolean'.
src/services/auth/__tests__/mocks/auth.store.mock.ts(194,3): error TS2304: Cannot find name 'useAuthStore'.
src/services/auth/__tests__/mocks/auth.store.mock.ts(195,3): error TS2304: Cannot find name 'useAuthStore'.
src/services/auth/__tests__/mocks/auth.store.mock.ts(196,3): error TS2304: Cannot find name 'useAuthStore'.
src/services/auth/__tests__/mocks/auth.store.mock.ts(197,3): error TS2304: Cannot find name 'useAuthStore'.
src/services/auth/__tests__/mocks/auth.store.mock.ts(199,10): error TS2304: Cannot find name 'useAuthStore'.
src/services/auth/__tests__/mocks/mockAuthService.ts(16,14): error TS2420: Class 'MockAuthService' incorrectly implements 
interface 'AuthService'.
  Type 'MockAuthService' is missing the following properties from type 'AuthService': verifyPasswordResetToken, 
updatePasswordWithToken, sendMagicLink, verifyMagicLink, and 8 more.
src/services/auth/__tests__/mocks/mockAuthService.ts(36,7): error TS2353: Object literal may only specify known properties, 
and 'name' does not exist in type 'User'.
src/services/auth/__tests__/mocks/mockAuthService.ts(54,7): error TS2353: Object literal may only specify known properties, 
and 'name' does not exist in type 'User'.
src/services/auth/__tests__/mocks/mockAuthService.ts(54,22): error TS2339: Property 'name' does not exist on type 
'RegistrationPayload'.
src/services/auth/__tests__/mocks/mockAuthService.ts(100,21): error TS2339: Property 'emailVerified' does not exist on type 
'User'.
src/services/auth/__tests__/mocks/mockAuthService.ts(117,5): error TS2741: Property 'success' is missing in type '{ secret: 
string; qrCode: string; }' but required in type 'MFASetupResponse'.
src/services/auth/defaultAuth.service.ts(48,14): error TS2420: Class 'DefaultAuthService' incorrectly implements interface 
'AuthService'.
  Type 'DefaultAuthService' is missing the following properties from type 'AuthService': getUserAccount, 
checkMfaRequirements, verifyMfaCode, resendMfaEmailCode, resendMfaSmsCode
src/services/auth/factory.ts(88,7): error TS2739: Type 'DefaultAuthService' is missing the following properties from type 
'AuthService': getUserAccount, checkMfaRequirements, verifyMfaCode, resendMfaEmailCode, resendMfaSmsCode
src/services/auth/factory.ts(103,11): error TS2739: Type 'DefaultAuthService' is missing the following properties from type 
'AuthService': getUserAccount, checkMfaRequirements, verifyMfaCode, resendMfaEmailCode, resendMfaSmsCode
src/services/auth/factory.ts(114,3): error TS2322: Type 'AuthService | null' is not assignable to type 'AuthService'.
  Type 'null' is not assignable to type 'AuthService'.
src/services/auth/index.ts(33,3): error TS2739: Type 'DefaultAuthService' is missing the following properties from type 
'AuthService': getUserAccount, checkMfaRequirements, verifyMfaCode, resendMfaEmailCode, resendMfaSmsCode
src/services/common/serviceErrorHandler.ts(33,40): error TS2554: Expected 1 arguments, but got 2.
src/services/common/serviceErrorHandler.ts(78,39): error TS2345: Argument of type '{ [P in allKeys<V>]?: string[] | 
undefined; }' is not assignable to parameter of type 'Record<string, string>'.
  Type 'string[] | undefined' is not assignable to type 'string'.
    Type 'undefined' is not assignable to type 'string'.
src/services/common/serviceErrorHandler.ts(79,21): error TS2345: Argument of type 
'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/lib/utils/errorFactory").ApplicationError' is not 
assignable to parameter of type 
'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/core/common/errors").ApplicationError'.
  Type 'ApplicationError' is missing the following properties from type 'ApplicationError': httpStatus, severity, expected, 
toJSON, toJSONString
src/services/common/serviceErrorHandler.ts(80,5): error TS2322: Type '{ success: false; error: ApplicationError; }' is not 
assignable to type 'T | { success: false; error: ApplicationError; }'.
  Types of property 'error' are incompatible.
    Type 'ApplicationError' is missing the following properties from type 'ApplicationError': httpStatus, severity, 
expected, toJSON, toJSONString
src/services/company-notification/defaultCompanyNotification.service.ts(8,49): error TS2307: Cannot find module 
'@/core/companyNotification/interfaces' or its corresponding type declarations.
src/services/company-notification/factory.ts(2,49): error TS2307: Cannot find module '@/core/companyNotification/interfaces' 
or its corresponding type declarations.
src/services/company-notification/index.ts(3,49): error TS2307: Cannot find module '@/core/companyNotification/interfaces' 
or its corresponding type declarations.
src/services/consent/factory.ts(43,5): error TS2322: Type 'ConsentService | undefined' is not assignable to type 
'ConsentService | null'.
  Type 'undefined' is not assignable to type 'ConsentService | null'.
src/services/csrf/__tests__/browserCsrf.service.test.ts(11,11): error TS2740: Type '{ generateToken: Mock<() => 
Promise<string>>; }' is missing the following properties from type 'ICsrfDataProvider': createToken, validateToken, 
revokeToken, getToken, and 3 more.
src/services/csrf/__tests__/browserCsrf.service.test.ts(22,11): error TS2740: Type '{ generateToken: Mock<() => 
Promise<never>>; }' is missing the following properties from type 'ICsrfDataProvider': createToken, validateToken, 
revokeToken, getToken, and 3 more.
src/services/csrf/__tests__/defaultCsrf.service.test.ts(7,11): error TS2739: Type '{ createToken: Mock<() => Promise<{ 
success: boolean; token: { token: string; }; }>>; validateToken: Mock<() => Promise<{ valid: boolean; }>>; revokeToken: 
Mock<() => Promise<...>>; }' is missing the following properties from type 'ICsrfDataProvider': generateToken, getToken, 
listTokens, updateToken, purgeExpiredTokens
src/services/csrf/browserCsrf.service.ts(4,14): error TS2420: Class 'BrowserCsrfService' incorrectly implements interface 
'CsrfService'.
  Type 'BrowserCsrfService' is missing the following properties from type 'CsrfService': createToken, validateToken, 
revokeToken
src/services/data-export/defaultDataExport.service.ts(1,35): error TS2307: Cannot find module '@/core/dataExport/interfaces' 
or its corresponding type declarations.
src/services/data-export/factory.ts(4,35): error TS2307: Cannot find module '@/core/dataExport/interfaces' or its 
corresponding type declarations.
src/services/data-export/index.ts(3,40): error TS2307: Cannot find module '@/core/dataExport/interfaces' or its 
corresponding type declarations.
src/services/gdpr/defaultGdpr.service.ts(6,15): error TS2724: '"@/core/gdpr/IGdprDataProvider"' has no exported member named 
'GdprDataProvider'. Did you mean 'IGdprDataProvider'?
src/services/gdpr/defaultGdpr.service.ts(8,14): error TS2420: Class 'DefaultGdprService' incorrectly implements interface 
'GdprService'.
  Type 'DefaultGdprService' is missing the following properties from type 'GdprService': generateUserExport, deleteUserData
src/services/gdpr/factory.ts(37,5): error TS2739: Type 'DefaultGdprService' is missing the following properties from type 
'GdprService': generateUserExport, deleteUserData
src/services/gdpr/factory.ts(40,3): error TS2322: Type 'GdprService | null' is not assignable to type 'GdprService'.
  Type 'null' is not assignable to type 'GdprService'.
src/services/gdpr/index.ts(3,15): error TS2724: '"@/core/gdpr/IGdprDataProvider"' has no exported member named 
'GdprDataProvider'. Did you mean 'IGdprDataProvider'?
src/services/gdpr/index.ts(10,3): error TS2739: Type 'DefaultGdprService' is missing the following properties from type 
'GdprService': generateUserExport, deleteUserData
src/services/health/factory.ts(1,10): error TS2305: Module '"@/core/health/interfaces"' has no exported member 
'IHealthService'.
src/services/health/factory.ts(7,35): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 
'number | undefined'.
src/services/notification/defaultNotification.handler.ts(88,17): error TS2339: Property 'actions' does not exist on type 
'NotificationOptions'.
src/services/notification/defaultNotification.handler.ts(110,19): error TS2339: Property 'image' does not exist on type 
'NotificationOptions'.
src/services/notification/index.ts(11,15): error TS2724: '"@/core/notification/INotificationDataProvider"' has no exported 
member named 'NotificationDataProvider'. Did you mean 'INotificationDataProvider'?
src/services/permission/__tests__/mocks/mockPermissionService.ts(21,14): error TS2420: Class 'MockPermissionService' 
incorrectly implements interface 'PermissionService'.
  Type 'MockPermissionService' is missing the following properties from type 'PermissionService': assignResourcePermission, 
removeResourcePermission, hasResourcePermission, getUserResourcePermissions, and 2 more.
src/services/permission/__tests__/mocks/mockPermissionService.ts(31,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(32,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(33,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(34,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(35,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(36,7): error TS2322: Type '{ name: string; description: 
string; }' is not assignable to type 'Permission'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(64,39): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(64,59): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(76,49): error TS2339: Property 'name' does not exist on 
type 'Role'.
  Property 'name' does not exist on type '"SUPER_ADMIN"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(94,7): error TS2322: Type 'string' is not assignable to 
type 'Date'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(95,7): error TS2322: Type 'string' is not assignable to 
type 'Date'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(104,7): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(118,7): error TS2322: Type 'string' is not assignable to 
type 'Date'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(131,7): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(153,7): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(179,7): error TS2322: Type 'string | undefined' is not 
assignable to type 'Date | undefined'.
  Type 'string' is not assignable to type 'Date'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(198,7): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(217,9): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(226,36): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(226,56): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(235,43): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(235,63): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(244,72): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(244,92): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(256,7): error TS2353: Object literal may only specify known 
properties, and 'assignedAt' does not exist in type 'PermissionAssignment'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(261,7): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(273,87): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(273,107): error TS2339: Property 'name' does not exist on 
type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/services/permission/__tests__/mocks/mockPermissionService.ts(283,9): error TS2353: Object literal may only specify known 
properties, and 'payload' does not exist in type 'PermissionEvent'.
src/services/permission/__tests__/service/defaultPermission.service.test.ts(37,16): error TS2352: Conversion of type '{ 
getEffectivePermissions: Mock<Procedure>; }' to type 'ResourcePermissionResolver' may be a mistake because neither type 
sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ getEffectivePermissions: Mock<Procedure>; }' is missing the following properties from type 
'ResourcePermissionResolver': relationshipService, db, getResourceAncestors, hasPermission
src/services/permission/defaultPermission.service.ts(25,15): error TS2724: '"@/core/permission/IPermissionDataProvider"' has 
no exported member named 'PermissionDataProvider'. Did you mean 'IPermissionDataProvider'?
src/services/permission/defaultPermission.service.ts(191,9): error TS2353: Object literal may only specify known properties, 
and 'role' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(245,9): error TS2353: Object literal may only specify known properties, 
and 'role' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(290,9): error TS2353: Object literal may only specify known properties, 
and 'roleId' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(379,9): error TS2353: Object literal may only specify known properties, 
and 'userRole' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(388,32): error TS2339: Property 'roleCache' does not exist on type 
'typeof DefaultPermissionService'.
src/services/permission/defaultPermission.service.ts(423,9): error TS2353: Object literal may only specify known properties, 
and 'userId' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(434,32): error TS2339: Property 'roleCache' does not exist on type 
'typeof DefaultPermissionService'.
src/services/permission/defaultPermission.service.ts(503,9): error TS2353: Object literal may only specify known properties, 
and 'roleId' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(546,9): error TS2353: Object literal may only specify known properties, 
and 'roleId' does not exist in type 'PermissionEvent'.
src/services/permission/defaultPermission.service.ts(772,9): error TS2353: Object literal may only specify known properties, 
and 'roles' does not exist in type 'PermissionEvent'.
src/services/permission/index.ts(12,15): error TS2724: '"@/core/permission/IPermissionDataProvider"' has no exported member 
named 'PermissionDataProvider'. Did you mean 'IPermissionDataProvider'?
src/services/permission/permission.service.ts(2,15): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, 
but it is not exported.
src/services/permission/permission.service.ts(2,27): error TS2305: Module '"@/types/rbac"' has no exported member 
'PermissionGroup'.
src/services/permission/permission.service.ts(2,44): error TS2459: Module '"@/types/rbac"' declares 'Role' locally, but it 
is not exported.
src/services/profile-verification/defaultProfileVerification.service.ts(3,49): error TS2307: Cannot find module 
'@/core/profileVerification/interfaces' or its corresponding type declarations.
src/services/profile-verification/factory.ts(1,49): error TS2307: Cannot find module '@/core/profileVerification/interfaces' 
or its corresponding type declarations.
src/services/profile-verification/index.ts(3,49): error TS2307: Cannot find module '@/core/profileVerification/interfaces' 
or its corresponding type declarations.
src/services/resource-relationship/__tests__/defaultResourceRelationship.service.test.ts(3,56): error TS2307: Cannot find 
module '@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/services/resource-relationship/defaultResourceRelationship.service.ts(1,50): error TS2307: Cannot find module 
'@/core/resourceRelationship/interfaces' or its corresponding type declarations.
src/services/resource-relationship/defaultResourceRelationship.service.ts(2,56): error TS2307: Cannot find module 
'@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/services/resource-relationship/defaultResourceRelationship.service.ts(3,70): error TS2307: Cannot find module 
'@/core/resourceRelationship/models' or its corresponding type declarations.
src/services/resource-relationship/factory.ts(10,50): error TS2307: Cannot find module 
'@/core/resourceRelationship/interfaces' or its corresponding type declarations.
src/services/resource-relationship/factory.ts(11,56): error TS2307: Cannot find module 
'@/core/resourceRelationship/IResourceRelationshipDataProvider' or its corresponding type declarations.
src/services/resource-relationship/index.ts(1,15): error TS2307: Cannot find module 
'@/services/resourceRelationship/factory' or its corresponding type declarations.
src/services/resource-relationship/index.ts(2,15): error TS2307: Cannot find module 
'@/services/resourceRelationship/defaultResourceRelationship.service' or its corresponding type declarations.
src/services/role/index.ts(5,3): error TS2459: Module '"@/services/role/role.service"' declares 'Role' locally, but it is 
not exported.
src/services/role/index.ts(6,3): error TS2459: Module '"@/services/role/role.service"' declares 'RoleCreateData' locally, 
but it is not exported.
src/services/role/index.ts(7,3): error TS2459: Module '"@/services/role/role.service"' declares 'RoleUpdateData' locally, 
but it is not exported.
src/services/role/index.ts(8,3): error TS2459: Module '"@/services/role/role.service"' declares 'UserRoleAssignment' 
locally, but it is not exported.
src/services/role/index.ts(9,3): error TS2459: Module '"@/services/role/role.service"' declares 'RoleHierarchyNode' locally, 
but it is not exported.
src/services/role/role.service.ts(11,15): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, but it is not 
exported.
src/services/saved-search/defaultSavedSearch.service.ts(6,8): error TS2307: Cannot find module '@/core/savedSearch' or its 
corresponding type declarations.
src/services/saved-search/factory.ts(1,41): error TS2307: Cannot find module '@/core/savedSearch' or its corresponding type 
declarations.
src/services/session/enforceSessionPolicies.service.ts(62,22): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(63,39): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(72,25): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(73,24): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(74,24): error TS2551: Property 'created_at' does not exist on type 
'SessionInfo'. Did you mean 'createdAt'?
src/services/session/enforceSessionPolicies.service.ts(75,25): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(76,24): error TS2339: Property 'user_metadata' does not exist on type 
'SessionInfo'.
src/services/session/enforceSessionPolicies.service.ts(77,24): error TS2551: Property 'created_at' does not exist on type 
'SessionInfo'. Did you mean 'createdAt'?
src/services/session/enforceSessionPolicies.service.ts(82,34): error TS2339: Property 'id' does not exist on type 'Session'.
src/services/storage/factory.ts(1,15): error TS2305: Module '"@/core/storage/interfaces"' has no exported member 
'IStorageService'.
src/services/storage/factory.ts(7,40): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 
'StorageAdapter'.
src/services/team/__tests__/defaultTeam.service.test.ts(3,15): error TS2724: '"@/core/team/ITeamDataProvider"' has no 
exported member named 'TeamDataProvider'. Did you mean 'ITeamDataProvider'?
src/services/team/__tests__/mocks/mockTeamService.ts(41,7): error TS2353: Object literal may only specify known properties, 
and 'isPublic' does not exist in type 'Team'.
src/services/team/__tests__/mocks/mockTeamService.ts(41,26): error TS2339: Property 'isPublic' does not exist on type 
'TeamCreatePayload'.
src/services/team/__tests__/mocks/mockTeamService.ts(48,11): error TS2739: Type '{ id: string; teamId: string; userId: 
string; role: string; joinedAt: string; name: string; email: string; avatarUrl: null; isCurrentUser: false; canRemove: true; 
canUpdateRole: true; }' is missing the following properties from type 'TeamMember': isActive, updatedAt
src/services/team/__tests__/mocks/mockTeamService.ts(147,11): error TS2739: Type '{ id: string; teamId: string; userId: 
string; role: string; joinedAt: string; name: string; email: string; avatarUrl: null; isCurrentUser: false; canRemove: true; 
canUpdateRole: true; }' is missing the following properties from type 'TeamMember': isActive, updatedAt
src/services/team/__tests__/mocks/mockTeamService.ts(267,11): error TS2741: Property 'status' is missing in type '{ id: 
string; teamId: string; email: string; role: string; invitedBy: any; createdAt: string; expiresAt: string; }' but required 
in type 'TeamInvitation'.
src/services/team/__tests__/mocks/mockTeamService.ts(272,33): error TS2339: Property 'invitedBy' does not exist on type 
'TeamInvitationPayload'.
src/services/team/__tests__/mocks/mockTeamService.ts(379,16): error TS2339: Property 'isPublic' does not exist on type 
'TeamSearchParams'.
src/services/team/__tests__/mocks/mockTeamService.ts(380,57): error TS2339: Property 'isPublic' does not exist on type 
'Team'.
src/services/team/__tests__/mocks/mockTeamService.ts(380,77): error TS2339: Property 'isPublic' does not exist on type 
'TeamSearchParams'.
src/services/team/__tests__/mocks/mockTeamService.ts(397,16): error TS2678: Type '"updatedAt"' is not comparable to type 
'"createdAt" | "name" | "memberCount" | undefined'.
src/services/team/__tests__/mocks/mockTeamService.ts(495,40): error TS2739: Type '{ id: string; teamId: string; userId: 
string; role: string; joinedAt: string; name: string; email: string; avatarUrl: null; isCurrentUser: false; canRemove: true; 
canUpdateRole: true; }' is missing the following properties from type 'TeamMember': isActive, updatedAt
src/services/team/apiTeam.service.ts(3,28): error TS2305: Module '"@/core/team/models"' has no exported member 'TeamInvite'.
src/services/team/apiTeam.service.ts(3,40): error TS2305: Module '"@/core/team/models"' has no exported member 
'CreateTeamPayload'.
src/services/team/apiTeam.service.ts(3,59): error TS2305: Module '"@/core/team/models"' has no exported member 
'UpdateTeamPayload'.
src/services/team/apiTeam.service.ts(32,9): error TS2416: Property 'createTeam' in type 'ApiTeamService' is not assignable 
to the same property in base type 'TeamService'.
  Type '(payload: CreateTeamPayload) => Promise<Team>' is not assignable to type '(ownerId: string, teamData: 
TeamCreatePayload) => Promise<TeamResult>'.
    Type 'Promise<Team>' is not assignable to type 'Promise<TeamResult>'.
      Property 'success' is missing in type 'Team' but required in type 'TeamResult'.
src/services/team/apiTeam.service.ts(49,9): error TS2416: Property 'updateTeam' in type 'ApiTeamService' is not assignable 
to the same property in base type 'TeamService'.
  Type '(teamId: string, payload: UpdateTeamPayload) => Promise<Team>' is not assignable to type '(teamId: string, teamData: 
TeamUpdatePayload) => Promise<TeamResult>'.
    Type 'Promise<Team>' is not assignable to type 'Promise<TeamResult>'.
      Property 'success' is missing in type 'Team' but required in type 'TeamResult'.
src/services/team/apiTeam.service.ts(65,9): error TS2416: Property 'deleteTeam' in type 'ApiTeamService' is not assignable 
to the same property in base type 'TeamService'.
  Type '(teamId: string) => Promise<void>' is not assignable to type '(teamId: string) => Promise<{ success: boolean; 
error?: string | undefined; }>'.
    Type 'Promise<void>' is not assignable to type 'Promise<{ success: boolean; error?: string | undefined; }>'.
      Type 'void' is not assignable to type '{ success: boolean; error?: string | undefined; }'.
src/services/team/apiTeam.service.ts(90,9): error TS2416: Property 'addTeamMember' in type 'ApiTeamService' is not 
assignable to the same property in base type 'TeamService'.
  Type '(teamId: string, userId: string) => Promise<TeamMember>' is not assignable to type '(teamId: string, userId: string, 
role: string) => Promise<TeamMemberResult>'.
    Type 'Promise<TeamMember>' is not assignable to type 'Promise<TeamMemberResult>'.
      Property 'success' is missing in type 'TeamMember' but required in type 'TeamMemberResult'.
src/services/team/apiTeam.service.ts(107,9): error TS2416: Property 'removeTeamMember' in type 'ApiTeamService' is not 
assignable to the same property in base type 'TeamService'.
  Type '(teamId: string, userId: string) => Promise<void>' is not assignable to type '(teamId: string, userId: string) => 
Promise<{ success: boolean; error?: string | undefined; }>'.
    Type 'Promise<void>' is not assignable to type 'Promise<{ success: boolean; error?: string | undefined; }>'.
      Type 'void' is not assignable to type '{ success: boolean; error?: string | undefined; }'.
src/services/team/apiTeam.service.ts(121,9): error TS2416: Property 'inviteToTeam' in type 'ApiTeamService' is not 
assignable to the same property in base type 'TeamService'.
  Type '(teamId: string, email: string) => Promise<TeamInvite>' is not assignable to type '(teamId: string, invitationData: 
TeamInvitationPayload) => Promise<TeamInvitationResult>'.
    Types of parameters 'email' and 'invitationData' are incompatible.
      Type 'TeamInvitationPayload' is not assignable to type 'string'.
src/services/team/apiTeam.service.ts(163,3): error TS2740: Type 'ApiTeamService' is missing the following properties from 
type 'TeamService': getTeam, getUserTeams, updateTeamMember, transferOwnership, and 10 more.
src/services/team/defaultTeam.service.ts(26,15): error TS2724: '"@/core/team/ITeamDataProvider"' has no exported member 
named 'TeamDataProvider'. Did you mean 'ITeamDataProvider'?
src/services/team/defaultTeam.service.ts(74,45): error TS2304: Cannot find name 'teamId'.
src/services/team/defaultTeam.service.ts(118,22): error TS2339: Property 'NOT_FOUND' does not exist on type '{ readonly 
AUTHENTICATION_FAILED: AUTH_ERROR.AUTH_001; readonly INVALID_CREDENTIALS: AUTH_ERROR.AUTH_002; readonly SESSION_EXPIRED: 
AUTH_ERROR.AUTH_003; readonly MFA_REQUIRED: AUTH_ERROR.AUTH_004; ... 23 more ...; readonly EXPORT_NOT_FOUND: 
EXPORT_ERROR.EXPORT_003; }'.
src/services/team/index.server.ts(3,10): error TS2305: Module '"@/services/team/factory"' has no exported member 
'createTeamService'.
src/services/team/index.server.ts(4,15): error TS2305: Module '"@/services/team/factory"' has no exported member 
'TeamServiceConfig'.
src/services/two-factor/factory.ts(72,3): error TS2322: Type 'TwoFactorService | null' is not assignable to type 
'TwoFactorService'.
  Type 'null' is not assignable to type 'TwoFactorService'.
src/services/user/__tests__/mocks/mockUserService.ts(85,5): error TS2322: Type '{ updatedAt: string; username?: string; 
firstName?: string; lastName?: string; company?: { name?: string; size?: string; industry?: string; website?: string; 
logoUrl?: string; position?: string; department?: string; vatId?: string; address?: { street?: string; city?: string; 
state?: string; postalCode?: string; coun...' is not assignable to type 'UserProfile'.
  Types of property 'company' are incompatible.
    Type '{ name?: string | undefined; size?: string | undefined; industry?: string | undefined; website?: string | 
undefined; logoUrl?: string | undefined; position?: string | undefined; department?: string | undefined; vatId?: string | 
undefined; address?: { ...; } | undefined; } | undefined' is not assignable to type '{ name: string; size?: string | 
undefined; industry?: string | undefined; website?: string | undefined; logoUrl?: string | undefined; position?: string | 
undefined; department?: string | undefined; vatId?: string | undefined; address?: { ...; } | undefined; } | undefined'.
      Type '{ name?: string | undefined; size?: string | undefined; industry?: string | undefined; website?: string | 
undefined; logoUrl?: string | undefined; position?: string | undefined; department?: string | undefined; vatId?: string | 
undefined; address?: { ...; } | undefined; }' is not assignable to type '{ name: string; size?: string | undefined; 
industry?: string | undefined; website?: string | undefined; logoUrl?: string | undefined; position?: string | undefined; 
department?: string | undefined; vatId?: string | undefined; address?: { ...; } | undefined; }'.
        Types of property 'name' are incompatible.
          Type 'string | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
src/services/user/__tests__/repositoryUser.service.test.ts(23,65): error TS2740: Type 'MockAuthService' is missing the 
following properties from type 'AuthService': verifyPasswordResetToken, updatePasswordWithToken, sendMagicLink, 
verifyMagicLink, and 8 more.
src/services/user/defaultUser.service.ts(11,15): error TS2724: '"@/core/user/IUserDataProvider"' has no exported member 
named 'UserDataProvider'. Did you mean 'IUserDataProvider'?
src/services/user/defaultUser.service.ts(78,22): error TS2339: Property 'NOT_FOUND' does not exist on type '{ readonly 
AUTHENTICATION_FAILED: AUTH_ERROR.AUTH_001; readonly INVALID_CREDENTIALS: AUTH_ERROR.AUTH_002; readonly SESSION_EXPIRED: 
AUTH_ERROR.AUTH_003; readonly MFA_REQUIRED: AUTH_ERROR.AUTH_004; ... 23 more ...; readonly EXPORT_NOT_FOUND: 
EXPORT_ERROR.EXPORT_003; }'.
src/services/user/defaultUser.service.ts(322,55): error TS7006: Parameter 'profile' implicitly has an 'any' type.
src/services/user/index.ts(12,15): error TS2724: '"@/core/user/IUserDataProvider"' has no exported member named 
'UserDataProvider'. Did you mean 'IUserDataProvider'?
src/services/webhooks/__tests__/webhookService.test.ts(30,27): error TS2339: Property 'mockResolvedValueOnce' does not exist 
on type '(userId: string) => Promise<Webhook[]>'.
src/services/webhooks/__tests__/webhookService.test.ts(33,29): error TS2339: Property 'mockResolvedValue' does not exist on 
type '(delivery: WebhookDelivery) => Promise<void>'.
src/services/webhooks/WebhookService.ts(61,5): error TS2740: Type '{ deliveries: WebhookDelivery[]; pagination?: 
PaginationMeta | undefined; }' is missing the following properties from type 'WebhookDelivery[]': length, pop, push, concat, 
and 35 more.
src/tests/factories/mockMiddleware.ts(4,37): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/factories/mockMiddleware.ts(4,50): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/tests/factories/mockMiddleware.ts(4,55): error TS7006: Parameter '_ctx' implicitly has an 'any' type.
src/tests/factories/mockMiddleware.ts(4,61): error TS7006: Parameter 'data' implicitly has an 'any' type.
src/tests/integration/adminUsersFlow.test.tsx(44,13): error TS2741: Property 'children' is missing in type '{}' but required 
in type 'AdminUsersProps'.
src/tests/integration/adminUsersFlow.test.tsx(95,13): error TS2741: Property 'children' is missing in type '{ fetchUsers: () 
=> Promise<{ id: string; email: string; role: string; created_at: string; isActive: boolean; isVerified: boolean; userType: 
UserType; username: string; firstName: string; lastName: string; ... 5 more ...; metadata: {}; }[]>; handleRoleChange: 
(user: any, newRole: string) => Promise<...>; }' but required in type 'AdminUsersProps'.
src/tests/integration/apiErrorMessages.test.tsx(9,10): error TS2614: Module '"@/ui/styled/auth/LoginForm"' has no exported 
member 'LoginForm'. Did you mean to use 'import LoginForm from "@/ui/styled/auth/LoginForm"' instead?
src/tests/integration/apiErrorMessages.test.tsx(12,7): error TS7034: Variable 'user' implicitly has type 'any' in some 
locations where its type cannot be determined.
src/tests/integration/apiErrorMessages.test.tsx(24,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(25,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(59,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(63,16): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/apiErrorMessages.test.tsx(67,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(68,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(69,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(70,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(94,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(95,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(98,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(99,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(102,13): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(115,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(118,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(136,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(139,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(158,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(159,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(168,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(172,14): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/apiErrorMessages.test.tsx(177,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(178,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(179,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(180,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(189,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(193,14): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/apiErrorMessages.test.tsx(202,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(203,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(212,11): error TS7005: Variable 'user' implicitly has an 'any' type.
src/tests/integration/apiErrorMessages.test.tsx(216,14): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/backup.integration.test.tsx(72,28): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/backup.integration.test.tsx(86,28): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/emptyStates.test.tsx(28,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(29,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(56,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(75,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(76,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(95,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(106,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(107,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(142,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(153,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(154,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(166,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(168,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/emptyStates.test.tsx(191,5): error TS2722: Cannot invoke an object which is possibly 'undefined'.
src/tests/integration/emptyStates.test.tsx(199,7): error TS1308: 'await' expressions are only allowed within async functions 
and at the top levels of modules.
src/tests/integration/errorRecoveryFlow.test.tsx(108,30): error TS2322: Type '{ formId: string; }' is not assignable to type 
'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: ReactNode; title?: string | undefined; }'.
  Property 'formId' does not exist on type 'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: 
ReactNode; title?: string | undefined; }'.
src/tests/integration/errorRecoveryFlow.test.tsx(141,30): error TS2322: Type '{ formId: string; }' is not assignable to type 
'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: ReactNode; title?: string | undefined; }'.
  Property 'formId' does not exist on type 'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: 
ReactNode; title?: string | undefined; }'.
src/tests/integration/errorRecoveryFlow.test.tsx(157,51): error TS2322: Type '{ formId: string; }' is not assignable to type 
'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: ReactNode; title?: string | undefined; }'.
  Property 'formId' does not exist on type 'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: 
ReactNode; title?: string | undefined; }'.
src/tests/integration/errorRecoveryFlow.test.tsx(165,14): error TS2554: Expected 1 arguments, but got 0.
src/tests/integration/errorRecoveryFlow.test.tsx(165,28): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '{ <Row extends Record<string, unknown>>(values: Row, options?: { count?: "exact" | "planned" | "estimated" | 
undefined; } | undefined): PostgrestFilterBuilder<GenericSchema, Record<string, unknown>, null, string, 
GenericRelationship[]>; <Row extends Record<...>>(values: Row[], options?: { ...; } | undefined): Postgr...'.
src/tests/integration/errorRecoveryFlow.test.tsx(182,32): error TS2322: Type '{ formId: string; }' is not assignable to type 
'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: ReactNode; title?: string | undefined; }'.
  Property 'formId' does not exist on type 'IntrinsicAttributes & { onSubmit: (data: any) => Promise<void>; children?: 
ReactNode; title?: string | undefined; }'.
src/tests/integration/errorRecoveryFlow.test.tsx(190,14): error TS2554: Expected 1 arguments, but got 0.
src/tests/integration/errorRecoveryFlow.test.tsx(190,28): error TS2339: Property 'mockResolvedValueOnce' does not exist on 
type '{ <Row extends Record<string, unknown>>(values: Row, options?: { count?: "exact" | "planned" | "estimated" | 
undefined; } | undefined): PostgrestFilterBuilder<GenericSchema, Record<string, unknown>, null, string, 
GenericRelationship[]>; <Row extends Record<...>>(values: Row[], options?: { ...; } | undefined): Postgr...'.
src/tests/integration/exportImportFlow.test.tsx(89,14): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/exportImportFlow.test.tsx(393,14): error TS1308: 'await' expressions are only allowed within async 
functions and at the top levels of modules.
src/tests/integration/loginMfa.integration.test.tsx(30,10): error TS2614: Module '"@/ui/styled/auth/LoginForm"' has no 
exported member 'LoginForm'. Did you mean to use 'import LoginForm from "@/ui/styled/auth/LoginForm"' instead?
src/tests/integration/loginMfa.integration.test.tsx(117,33): error TS2322: Type '{ accessToken: string; mfaMethod: "email"; 
onSuccess: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/loginMfa.integration.test.tsx(130,33): error TS2322: Type '{ accessToken: string; mfaMethod: "sms"; 
onSuccess: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/notificationFlow.test.tsx(23,10): error TS2614: Module '"@/ui/styled/common/NotificationCenter"' has 
no exported member 'NotificationCenter'. Did you mean to use 'import NotificationCenter from 
"@/ui/styled/common/NotificationCenter"' instead?
src/tests/integration/notificationFlow.test.tsx(31,19): error TS2352: Conversion of type '{ preferences: { notifications: { 
email: true; push: false; marketing: false; }; }; isLoading: false; error: null; fetchPreferences: Mock<Procedure>; 
updatePreferences: Mock<Procedure>; }' to type 'PreferencesState' may be a mistake because neither type sufficiently 
overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'preferences' are incompatible.
    Type '{ notifications: { email: true; push: false; marketing: false; }; }' is missing the following properties from type 
'{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; 
notifications: { push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: 
string; }': id, createdAt, updatedAt, userId, and 5 more.
src/tests/integration/notificationFlow.test.tsx(328,7): error TS2322: Type 'Mock<() => Promise<{ notifications: { id: 
string; userId: string; channel: string; title: string; message: string; category: string; isRead: boolean; createdAt: 
string; }[]; total: number; page: number; limit: number; totalPages: number; unreadCount: number; }>>' is not assignable to 
type '(userId: string, filter?: NotificationFilter | undefined) => Promise<NotificationBatch>'.
  Type 'Promise<{ notifications: { id: string; userId: string; channel: string; title: string; message: string; category: 
string; isRead: boolean; createdAt: string; }[]; total: number; page: number; limit: number; totalPages: number; 
unreadCount: number; }>' is not assignable to type 'Promise<NotificationBatch>'.
    Type '{ notifications: { id: string; userId: string; channel: string; title: string; message: string; category: string; 
isRead: boolean; createdAt: string; }[]; total: number; page: number; limit: number; totalPages: number; unreadCount: 
number; }' is not assignable to type 'NotificationBatch'.
      Types of property 'notifications' are incompatible.
        Type '{ id: string; userId: string; channel: string; title: string; message: string; category: string; isRead: 
boolean; createdAt: string; }[]' is not assignable to type 'Notification[]'.
          Type '{ id: string; userId: string; channel: string; title: string; message: string; category: string; isRead: 
boolean; createdAt: string; }' is missing the following properties from type 'Notification': priority, status
src/tests/integration/notificationPreferences.integration.test.tsx(48,34): error TS2345: Argument of type '{ preferences: { 
notifications: { email: boolean; push: boolean; marketing: boolean; }; }; isLoading: boolean; error: null; fetchPreferences: 
Mock<Procedure>; updatePreferences: Mock<...>; }' is not assignable to parameter of type 'PreferencesState'.
  Types of property 'preferences' are incompatible.
    Type '{ notifications: { email: boolean; push: boolean; marketing: boolean; }; }' is missing the following properties 
from type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | 
"system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; 
dateFormat: string; }': id, createdAt, updatedAt, userId, and 5 more.
src/tests/integration/notificationPreferences.integration.test.tsx(87,34): error TS2345: Argument of type '{ preferences: { 
notifications: { email: boolean; push: boolean; marketing: boolean; }; }; isLoading: boolean; error: null; fetchPreferences: 
Mock<Procedure>; updatePreferences: Mock<...>; }' is not assignable to parameter of type 'PreferencesState'.
  Types of property 'preferences' are incompatible.
    Type '{ notifications: { email: boolean; push: boolean; marketing: boolean; }; }' is missing the following properties 
from type '{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | 
"system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; 
dateFormat: string; }': id, createdAt, updatedAt, userId, and 5 more.
src/tests/integration/passwordResetFlow.test.tsx(64,10): error TS2614: Module '"@/ui/styled/auth/ForgotPasswordForm"' has no 
exported member 'ForgotPasswordForm'. Did you mean to use 'import ForgotPasswordForm from 
"@/ui/styled/auth/ForgotPasswordForm"' instead?
src/tests/integration/registrationFlow.integration.test.tsx(7,10): error TS2614: Module 
'"@/ui/styled/auth/EmailVerification"' has no exported member 'EmailVerification'. Did you mean to use 'import 
EmailVerification from "@/ui/styled/auth/EmailVerification"' instead?
src/tests/integration/registrationFlow.integration.test.tsx(109,21): error TS2554: Expected 1 arguments, but got 0.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(13,10): error TS2305: Module '"@/core/auth/models"' has no 
exported member 'TwoFactorMethod'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(30,9): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(30,14): error TS2339: Property 'code' does not exist on type 
'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'code' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(35,16): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(35,21): error TS2339: Property 'code' does not exist on type 
'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'code' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(40,16): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(40,21): error TS2339: Property 'code' does not exist on type 
'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'code' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(54,9): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(54,14): error TS2339: Property 'email' does not exist on type 
'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'email' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(59,16): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(59,21): error TS2339: Property 'phone' does not exist on type 
'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'phone' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(68,15): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(68,20): error TS2339: Property 'method' does not exist on 
type 'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'method' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(281,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(308,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(335,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(394,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; enableResendCode: true; }' is not assignable to type 'IntrinsicAttributes & 
StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(417,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; enableResendCode: true; }' is not assignable to type 'IntrinsicAttributes & 
StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(440,13): error TS18049: 'body' is possibly 'null' or 
'undefined'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(440,18): error TS2339: Property 'method' does not exist on 
type 'string | number | boolean | Record<string, any> | DefaultRequestMultipartBody'.
  Property 'method' does not exist on type 'string'.
src/tests/integration/ssoMfaErrorHandling.integration.test.tsx(456,9): error TS2322: Type '{ accessToken: string; onSuccess: 
Mock<Procedure>; mfaMethod: any; }' is not assignable to type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
  Property 'accessToken' does not exist on type 'IntrinsicAttributes & StyledMFAVerificationFormProps'.
src/tests/integration/supabaseIntegration.test.ts(4,1): error TS2304: Cannot find name 'SupabaseClient'.
src/tests/integration/themeSettingsFlow.test.tsx(4,46): error TS2307: Cannot find module 'src/tests/utils/test-utils' or its 
corresponding type declarations.
src/tests/integration/userAuthFlow.test.tsx(11,10): error TS2614: Module '"@/ui/styled/auth/LoginForm"' has no exported 
member 'LoginForm'. Did you mean to use 'import LoginForm from "@/ui/styled/auth/LoginForm"' instead?
src/tests/mocks/debugAuth.tsx(10,20): error TS7006: Parameter 'token' implicitly has an 'any' type.
src/tests/mocks/debugAuth.tsx(27,35): error TS2339: Property 'requireAdmin' does not exist on type '{}'.
src/tests/mocks/debugAuth.tsx(33,15): error TS2339: Property 'requireAdmin' does not exist on type '{}'.
src/tests/mocks/debugAuth.tsx(35,47): error TS2339: Property 'requireAdmin' does not exist on type '{}'.
src/tests/mocks/notification.service.mock.ts(2,36): error TS2724: '"@/core/notification/interfaces"' has no exported member 
named 'NotificationBatch'. Did you mean 'NotificationState'?
src/tests/mocks/notification.service.mock.ts(2,55): error TS2724: '"@/core/notification/interfaces"' has no exported member 
named 'NotificationChannel'. Did you mean 'NotificationHandler'?
src/tests/mocks/redis.tsx(83,36): error TS7006: Parameter 'redis' implicitly has an 'any' type.
src/tests/mocks/supabase.ts(401,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(408,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(410,60): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(412,84): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(417,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(442,11): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(448,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(453,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(458,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(463,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(468,13): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabase.ts(511,9): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/supabaseAuthProvider.mock.ts(52,9): error TS2322: Type 'Date' is not assignable to type 'string'.
src/tests/mocks/supabaseAuthProvider.mock.ts(53,9): error TS2322: Type 'Date' is not assignable to type 'string'.
src/tests/mocks/supabaseAuthProvider.mock.ts(59,31): error TS2322: Type 'User | null' is not assignable to type 'User | 
undefined'.
  Type 'null' is not assignable to type 'User | undefined'.
src/tests/mocks/supabaseAuthProvider.mock.ts(80,61): error TS2741: Property 'success' is missing in type '{ secret: string; 
qrCode: string; }' but required in type 'MFASetupResponse'.
src/tests/mocks/supabaseAuthProvider.mock.ts(83,78): error TS2741: Property 'success' is missing in type '{ secret: string; 
qrCode: string; }' but required in type 'MFASetupResponse'.
src/tests/mocks/testMocks.ts(2,10): error TS2305: Module '"@/core/auth/models"' has no exported member 'AuthState'.
src/tests/mocks/testMocks.ts(7,7): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/mocks/testMocks.ts(35,16): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(36,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(37,17): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(38,24): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(39,25): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(40,32): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(41,22): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(42,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(49,30): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(50,24): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(51,18): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(52,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(53,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(54,20): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(55,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(56,31): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(57,23): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/testMocks.ts(58,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/mocks/user.service.mock.ts(4,3): error TS2459: Module '"@/core/user/interfaces"' declares 'UserProfile' locally, 
but it is not exported.
src/tests/mocks/user.service.mock.ts(5,3): error TS2459: Module '"@/core/user/interfaces"' declares 'ProfileUpdatePayload' 
locally, but it is not exported.
src/tests/mocks/user.service.mock.ts(6,3): error TS2459: Module '"@/core/user/interfaces"' declares 'UserProfileResult' 
locally, but it is not exported.
src/tests/mocks/user.service.mock.ts(7,3): error TS2459: Module '"@/core/user/interfaces"' declares 'ProfileVisibility' 
locally, but it is not exported.
src/tests/mocks/user.service.mock.ts(8,3): error TS2459: Module '"@/core/user/interfaces"' declares 'UserSearchParams' 
locally, but it is not exported.
src/tests/mocks/user.service.mock.ts(9,3): error TS2459: Module '"@/core/user/interfaces"' declares 'UserSearchResult' 
locally, but it is not exported.
src/tests/smoke/login.smoke.test.tsx(4,10): error TS2614: Module '"@/ui/styled/auth/LoginForm"' has no exported member 
'LoginForm'. Did you mean to use 'import LoginForm from "@/ui/styled/auth/LoginForm"' instead?
src/tests/utils/apiTestingUtils.ts(13,5): error TS2339: Property 'method' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(14,5): error TS2339: Property 'body' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(15,5): error TS2339: Property 'query' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(16,5): error TS2339: Property 'headers' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(17,5): error TS2339: Property 'cookies' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(18,5): error TS2339: Property 'authUser' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(19,5): error TS2339: Property 'url' does not exist on type '{}'.
src/tests/utils/apiTestingUtils.ts(54,35): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(64,13): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
src/tests/utils/apiTestingUtils.ts(84,31): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(100,32): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(116,31): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(131,34): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(147,41): error TS7006: Parameter 'handler' implicitly has an 'any' type.
src/tests/utils/apiTestingUtils.ts(147,50): error TS7006: Parameter 'user' implicitly has an 'any' type.
src/tests/utils/componentTestingUtils.ts(25,56): error TS2345: Argument of type '{ data: { user: AuthUser | null; }; error: 
null; }' is not assignable to parameter of type 'UserResponse'.
  The types of 'data.user' are incompatible between these types.
    Type 'User | null' is not assignable to type 'User'.
      Type 'null' is not assignable to type 'User'.
src/tests/utils/componentTestingUtils.ts(33,23): error TS2352: Conversion of type '{ unsubscribe: Mock<Procedure>; }' to 
type 'Subscription' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, 
convert the expression to 'unknown' first.
  Type '{ unsubscribe: Mock<Procedure>; }' is missing the following properties from type 'Subscription': id, callback
src/tests/utils/componentTestingUtils.ts(131,49): error TS2345: Argument of type '(table: string) => { select: 
Mock<Procedure>; eq: Mock<Procedure>; } | { select: Mock<Procedure>; eq?: undefined; }' is not assignable to parameter of 
type 'NormalizedProcedure<{ <TableName extends string, Table extends GenericTable>(relation: TableName): 
PostgrestQueryBuilder<GenericSchema, Table, TableName, Table extends { ...; } ? R : unknown>; <ViewName extends string, View 
extends GenericView>(relation: ViewName): PostgrestQueryBuilder<...>; }>'.
  Type '{ select: Mock<Procedure>; eq: Mock<Procedure>; } | { select: Mock<Procedure>; eq?: undefined; }' is not assignable 
to type 'PostgrestQueryBuilder<GenericSchema, GenericView, string, GenericRelationship[]>'.
    Type '{ select: Mock<Procedure>; eq: Mock<Procedure>; }' is missing the following properties from type 
'PostgrestQueryBuilder<GenericSchema, GenericView, string, GenericRelationship[]>': url, headers, insert, upsert, and 2 more.
src/tests/utils/hookTestingUtils.tsx(159,15): error TS2349: This expression is not callable.
  Not all constituents of type '((prevState: T) => T) | (T & Function)' are callable.
    Type 'T & Function' has no call signatures.
src/tests/utils/integrationTestingUtils.ts(30,15): error TS2739: Type '{}' is missing the following properties from type 
'User': id, app_metadata, user_metadata, aud, created_at
src/tests/utils/integrationTestingUtils.ts(34,58): error TS2345: Argument of type '{ data: { user: null; }; error: null; }' 
is not assignable to parameter of type 'UserResponse'.
  The types of 'data.user' are incompatible between these types.
    Type 'null' is not assignable to type 'User'.
src/tests/utils/integrationTestingUtils.ts(93,51): error TS2345: Argument of type '(requestedTable: string) => { select: 
Mock<Procedure>; insert: Mock<Procedure>; update: Mock<Procedure>; upsert: Mock<Procedure>; ... 6 more ...; then: (callback: 
(result: { data: unknown[]; error: null; }) => unknown) => Promise<...>; }' is not assignable to parameter of type 
'NormalizedProcedure<{ <TableName extends string, Table extends GenericTable>(relation: TableName): 
PostgrestQueryBuilder<GenericSchema, Table, TableName, Table extends { ...; } ? R : unknown>; <ViewName extends string, View 
extends GenericView>(relation: ViewName): PostgrestQueryBuilder<...>; }>'.
  Type '{ select: Mock<Procedure>; insert: Mock<Procedure>; update: Mock<Procedure>; upsert: Mock<Procedure>; delete: 
Mock<...>; ... 5 more ...; then: (callback: (result: { ...; }) => unknown) => Promise<...>; }' is missing the following 
properties from type 'PostgrestQueryBuilder<GenericSchema, GenericView, string, GenericRelationship[]>': url, headers
src/tests/utils/integrationTestingUtils.ts(95,32): error TS2345: Argument of type 'unknown' is not assignable to parameter 
of type 'any[] | Record<string, unknown>'.
src/tests/utils/integrationTestingUtils.ts(130,53): error TS18046: 'value' is of type 'unknown'.
src/tests/utils/integrationTestingUtils.ts(131,53): error TS18046: 'value' is of type 'unknown'.
src/tests/utils/integrationTestingUtils.ts(132,39): error TS18046: 'value' is of type 'unknown'.
src/tests/utils/redisMock.tsx(83,36): error TS7006: Parameter 'redis' implicitly has an 'any' type.
src/tests/utils/requestHelpers.ts(26,40): error TS2345: Argument of type 'RequestInit' is not assignable to parameter of 
type 'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/node_modules/next/dist/server/web/spec-extension/requ
est").RequestInit'.
  Types of property 'signal' are incompatible.
    Type 'AbortSignal | null | undefined' is not assignable to type 'AbortSignal | undefined'.
      Type 'null' is not assignable to type 'AbortSignal | undefined'.
src/tests/utils/storeTestingUtils.ts(10,3): error TS2304: Cannot find name 'useAuthStore'.
src/tests/utils/storeTestingUtils.ts(11,27): error TS2339: Property 'reset' does not exist on type 'UserState'.
src/tests/utils/storeTestingUtils.ts(12,26): error TS2339: Property 'reset' does not exist on type 'TwoFactorState'.
src/tests/utils/storeTestingUtils.ts(13,37): error TS2339: Property 'reset' does not exist on type 'CompanyProfileState'.
src/tests/utils/storeTestingUtils.ts(14,24): error TS2339: Property 'getState' does not exist on type '() => 
SubscriptionState'.
src/tests/utils/storeTestingUtils.ts(15,19): error TS2339: Property 'getState' does not exist on type '() => { fetchProfile: 
() => Promise<void>; error: string | null; profile: Profile | null; isLoading: boolean; clearError: () => void; 
uploadCompanyLogo: (fileOrBase64: string | File) => Promise<...>; ... 10 more ...; requestVerification: (document?: File | 
undefined) => Promise<...>; }'.
src/tests/utils/storeTestingUtils.ts(16,34): error TS2339: Property 'reset' does not exist on type 'PreferencesState'.
src/tests/utils/supabaseAuthUtils.ts(72,9): error TS2739: Type '{ name: string; message: string; }' is missing the following 
properties from type 'AuthError': code, status, __isAuthError
src/tests/utils/testMocks.ts(2,10): error TS2305: Module '"@/core/auth/models"' has no exported member 'AuthState'.
src/tests/utils/testMocks.ts(7,7): error TS2707: Generic type 'Mock<T>' requires between 0 and 1 type arguments.
src/tests/utils/testMocks.ts(35,16): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(36,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(37,17): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(38,24): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(39,25): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(40,32): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(41,22): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(42,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(49,30): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(50,24): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(51,18): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(52,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(53,19): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(54,20): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(55,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(56,31): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(57,23): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testMocks.ts(58,21): error TS2558: Expected 0-1 type arguments, but got 2.
src/tests/utils/testServiceSetup.ts(72,5): error TS2322: Type '"private"' is not assignable to type 'UserType | undefined'.
src/tests/utils/testServiceSetup.ts(86,27): error TS2345: Argument of type '{ id: string; name: string; description: string; 
ownerId: string; createdAt: string; updatedAt: string; isPublic: boolean; }' is not assignable to parameter of type 'Team'.
  Type '{ id: string; name: string; description: string; ownerId: string; createdAt: string; updatedAt: string; isPublic: 
boolean; }' is missing the following properties from type 'Team': isActive, visibility, memberLimit
src/tests/utils/testServiceSetup.ts(103,33): error TS2345: Argument of type '{ id: string; name: string; description: 
string; createdAt: string; updatedAt: string; permissions: { name: string; description: string; }[]; }' is not assignable to 
parameter of type 'RoleWithPermissions'.
  Types of property 'permissions' are incompatible.
    Type '{ name: string; description: string; }[]' is not assignable to type 'Permission[]'.
      Type '{ name: string; description: string; }' is not assignable to type 'Permission'.
src/tests/utils/testServiceSetup.ts(111,5): error TS2561: Object literal may only specify known properties, but 'assignedAt' 
does not exist in type 'UserRole'. Did you mean to write 'assignedBy'?
src/tests/utils/testWrapper.tsx(45,24): error TS2740: Type 'MockAuthService' is missing the following properties from type 
'AuthService': verifyPasswordResetToken, updatePasswordWithToken, sendMagicLink, verifyMagicLink, and 8 more.
src/types/auth.ts(2,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(3,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(4,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(5,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(6,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(7,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(8,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(9,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.
src/types/auth.ts(19,9): error TS2304: Cannot find name 'User'.
src/types/auth.ts(25,18): error TS2304: Cannot find name 'RateLimitInfo'.
src/types/auth.ts(30,17): error TS2304: Cannot find name 'LoginPayload'.
src/types/auth.ts(30,42): error TS2552: Cannot find name 'AuthResult'. Did you mean 'XPathResult'?
src/types/auth.ts(31,20): error TS2304: Cannot find name 'RegistrationPayload'.
src/types/auth.ts(31,52): error TS2552: Cannot find name 'AuthResult'. Did you mean 'XPathResult'?
src/types/auth.ts(35,53): error TS2552: Cannot find name 'AuthResult'. Did you mean 'XPathResult'?
src/types/auth.ts(40,19): error TS2304: Cannot find name 'User'.
src/types/auth.ts(42,27): error TS2304: Cannot find name 'MFASetupResponse'.
src/types/auth.ts(43,40): error TS2304: Cannot find name 'MFAVerifyResponse'.
src/types/auth.ts(44,41): error TS2304: Cannot find name 'AuthResult'.
src/types/database.ts(94,18): error TS2430: Interface 'Profile' incorrectly extends interface '{ id: string; createdAt: 
Date; updatedAt: Date; userId: string; userType: "private" | "corporate"; avatarUrl: string | null; bio: string | null; 
location: string | null; website: string | null; ... 10 more ...; address?: { ...; } | ... 1 more ... | undefined; }'.
  Types of property 'id' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.
src/types/jestTypes.ts(2,67): error TS2694: Namespace 'global.jest' has no exported member 'Mock'.
src/types/rbac.ts(44,10): error TS2749: 'RoleSchema' refers to a value, but is being used as a type here. Did you mean 
'typeof RoleSchema'?
src/ui/headless/account/DeleteAccountDialog.tsx(51,13): error TS2554: Expected 1 arguments, but got 0.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(16,67): error TS2740: Type '{ id: string; firstName: string; }' is 
missing the following properties from type 'User': lastName, email, status, role, and 2 more.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(33,43): error TS2493: Tuple type '[]' of length '0' has no element 
at index '0'.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(35,13): error TS18048: 'args' is possibly 'undefined'.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(36,7): error TS18048: 'args' is possibly 'undefined'.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(37,13): error TS18048: 'args' is possibly 'undefined'.
src/ui/headless/admin/__tests__/UserRoleAssigner.test.tsx(38,13): error TS18048: 'args' is possibly 'undefined'.
src/ui/headless/admin/RoleManagementPanel.tsx(36,12): error TS2749: 'RoleSchema' refers to a value, but is being used as a 
type here. Did you mean 'typeof RoleSchema'?
src/ui/headless/admin/RoleManagementPanel.tsx(41,54): error TS2749: 'RoleSchema' refers to a value, but is being used as a 
type here. Did you mean 'typeof RoleSchema'?
src/ui/headless/admin/RoleManagementPanel.tsx(49,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(49,30): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(50,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(50,34): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(51,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(51,34): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(52,30): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(52,30): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(53,35): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(53,35): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(54,35): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/admin/RoleManagementPanel.tsx(54,35): error TS2554: Expected 0 arguments, but got 1.
src/ui/headless/admin/RoleManagementPanel.tsx(58,15): error TS2339: Property 'filter' does not exist on type 'RBACState'.
src/ui/headless/admin/RoleManagementPanel.tsx(61,57): error TS2749: 'RoleSchema' refers to a value, but is being used as a 
type here. Did you mean 'typeof RoleSchema'?
src/ui/headless/admin/RoleManagementPanel.tsx(63,18): error TS2339: Property 'filter' does not exist on type 'RBACState'.
src/ui/headless/admin/RoleManagementPanel.tsx(63,32): error TS2749: 'RoleSchema' refers to a value, but is being used as a 
type here. Did you mean 'typeof RoleSchema'?
src/ui/headless/admin/RoleManagementPanel.tsx(68,13): error TS2349: This expression is not callable.
  Type 'RBACState' has no call signatures.
src/ui/headless/admin/RoleManagementPanel.tsx(74,13): error TS2349: This expression is not callable.
  Type 'RBACState' has no call signatures.
src/ui/headless/admin/RoleManagementPanel.tsx(79,5): error TS2740: Type 'RBACState' is missing the following properties from 
type 'RoleSchema[]': length, pop, push, concat, and 35 more.
src/ui/headless/admin/RoleManagementPanel.tsx(80,5): error TS2740: Type 'RBACState' is missing the following properties from 
type '{ id: string; createdAt: string; userId: string; roleId: string; assignedBy: string; role?: { id: string; createdAt: 
Date; updatedAt: Date; name: string; description: string; isSystemRole?: boolean | undefined; } | undefined; expiresAt?: 
string | undefined; roleName?: string | undefined; }[]': length, pop, push, concat, and 35 more.
src/ui/headless/admin/RoleManagementPanel.tsx(81,5): error TS2322: Type 'RBACState' is not assignable to type 'boolean'.
src/ui/headless/admin/RoleManagementPanel.tsx(82,5): error TS2322: Type 'RBACState' is not assignable to type 'string'.
src/ui/headless/api-keys/ApiKeyDetail.tsx(21,32): error TS2322: Type '() => Promise<{ success: boolean; key?: ApiKey; 
plaintext?: string; error?: string; }>' is not assignable to type '() => Promise<{ key: string; } & ApiKey>'.
  Type 'Promise<{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; 
}>' is not assignable to type 'Promise<{ key: string; } & ApiKey>'.
    Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; }' is 
not assignable to type '{ key: string; } & ApiKey'.
      Type '{ success: boolean; key?: ApiKey | undefined; plaintext?: string | undefined; error?: string | undefined; }' is 
not assignable to type '{ key: string; }'.
        Types of property 'key' are incompatible.
          Type 'ApiKey | undefined' is not assignable to type 'string'.
            Type 'undefined' is not assignable to type 'string'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(23,11): error TS2322: Type '{ onSubmit: Mock<Procedure>; 
onError: Mock<Procedure>; serverError: { type: string; message: string; }; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(50,11): error TS2322: Type '{ onSubmit: Mock<Procedure>; 
onError: Mock<Procedure>; serverError: { type: string; message: string; }; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(74,32): error TS2322: Type '{ onSubmit: Mock<Procedure>; 
onError: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(94,32): error TS2322: Type '{ onSubmit: Mock<Procedure>; 
onError: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(118,32): error TS2322: Type '{ onSubmit: Mock<Procedure>; 
onError: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes'.
  Property 'onSubmit' does not exist on type 'IntrinsicAttributes'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(154,11): error TS2322: Type '{ companyData: { id: string; 
name: string; size: string; industry: string; }; onSubmit: Mock<Procedure>; onSuggestCompanyName: Mock<Procedure>; }' is not 
assignable to type 'IntrinsicAttributes & CompanyProfileFormProps'.
  Property 'companyData' does not exist on type 'IntrinsicAttributes & CompanyProfileFormProps'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(191,11): error TS2322: Type '{ companyData: { id: string; 
name: string; size: string; industry: string; isVerified: boolean; }; onSubmit: Mock<Procedure>; }' is not assignable to 
type 'IntrinsicAttributes & CompanyProfileFormProps'.
  Property 'companyData' does not exist on type 'IntrinsicAttributes & CompanyProfileFormProps'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(224,11): error TS2322: Type '{ companyData: { id: string; 
name: string; size: string; industry: string; }; onSubmit: Mock<Procedure>; }' is not assignable to type 
'IntrinsicAttributes & CompanyProfileFormProps'.
  Property 'companyData' does not exist on type 'IntrinsicAttributes & CompanyProfileFormProps'.
src/ui/headless/audit/__tests__/BusinessFormErrorHandling.test.tsx(276,11): error TS2322: Type '{ companyData: { id: string; 
name: string; size: string; industry: string; updatedAt: string; }; onSubmit: Mock<Procedure>; }' is not assignable to type 
'IntrinsicAttributes & CompanyProfileFormProps'.
  Property 'companyData' does not exist on type 'IntrinsicAttributes & CompanyProfileFormProps'.
src/ui/headless/audit/PermissionAuditDashboard.tsx(11,24): error TS2322: Type 'AuditLog[]' is not assignable to type 
'AuditLogEntry[]'.
  Property 'createdAt' is missing in type 'AuditLog' but required in type 'AuditLogEntry'.
src/ui/headless/auth/__tests__/loginForm.test.tsx(97,6): error TS2741: Property 'onSubmit' is missing in type '{ render: 
(rp: { handleSubmit: (e: FormEvent<Element>) => void; emailValue: string; setEmailValue: (value: string) => void; 
passwordValue: string; setPasswordValue: (value: string) => void; ... 6 more ...; handleBlur: (field: "email" | "password") 
=> void; }) => Element; }' but required in type 'LoginFormProps'.
src/ui/headless/auth/__tests__/MFASetup.integration.test.tsx(6,10): error TS2614: Module '"@/hooks/auth/useMFA"' has no 
exported member 'useAuth'. Did you mean to use 'import useAuth from "@/hooks/auth/useMFA"' instead?
src/ui/headless/auth/AccountDeletion.tsx(82,15): error TS2339: Property 'userType' does not exist on type 'User'.
src/ui/headless/auth/AccountDeletion.tsx(100,33): error TS2339: Property 'userType' does not exist on type 'User'.
src/ui/headless/auth/BackupCodesDisplay.tsx(73,11): error TS2339: Property 'generateBackupCodes' does not exist on type 
'UseAuth'.
src/ui/headless/auth/BusinessSSOAuth.tsx(110,11): error TS2339: Property 'businessSSOAuth' does not exist on type 'UseAuth'.
src/ui/headless/auth/BusinessSSOAuth.tsx(240,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/BusinessSSOSetup.tsx(132,11): error TS2339: Property 'configureSSOProvider' does not exist on type 
'UseAuth'.
src/ui/headless/auth/BusinessSSOSetup.tsx(132,33): error TS2339: Property 'getSSOProviders' does not exist on type 'UseAuth'.
src/ui/headless/auth/BusinessSSOSetup.tsx(132,50): error TS2339: Property 'testSSOConfiguration' does not exist on type 
'UseAuth'.
src/ui/headless/auth/BusinessSSOSetup.tsx(195,17): error TS2345: Argument of type '(prev: { config?: Record<string, string> 
| undefined; form?: string | undefined; }) => { config: { [x: string]: string | undefined; }; form?: string | undefined; }' 
is not assignable to parameter of type 'SetStateAction<{ config?: Record<string, string> | undefined; form?: string | 
undefined; }>'.
  Type '(prev: { config?: Record<string, string> | undefined; form?: string | undefined; }) => { config: { [x: string]: 
string | undefined; }; form?: string | undefined; }' is not assignable to type '(prevState: { config?: Record<string, 
string> | undefined; form?: string | undefined; }) => { config?: Record<string, string> | undefined; form?: string | 
undefined; }'.
    Call signature return types '{ config: { [x: string]: string | undefined; }; form?: string | undefined; }' and '{ 
config?: Record<string, string> | undefined; form?: string | undefined; }' are incompatible.
      The types of 'config' are incompatible between these types.
        Type '{ [x: string]: string | undefined; }' is not assignable to type 'Record<string, string>'.
          'string' index signatures are incompatible.
            Type 'string | undefined' is not assignable to type 'string'.
              Type 'undefined' is not assignable to type 'string'.
src/ui/headless/auth/BusinessSSOSetup.tsx(254,19): error TS2345: Argument of type '(prev: { config?: Record<string, string> 
| undefined; form?: string | undefined; }) => { config: { [x: string]: string | undefined; }; form?: string | undefined; }' 
is not assignable to parameter of type 'SetStateAction<{ config?: Record<string, string> | undefined; form?: string | 
undefined; }>'.
  Type '(prev: { config?: Record<string, string> | undefined; form?: string | undefined; }) => { config: { [x: string]: 
string | undefined; }; form?: string | undefined; }' is not assignable to type '(prevState: { config?: Record<string, 
string> | undefined; form?: string | undefined; }) => { config?: Record<string, string> | undefined; form?: string | 
undefined; }'.
    Call signature return types '{ config: { [x: string]: string | undefined; }; form?: string | undefined; }' and '{ 
config?: Record<string, string> | undefined; form?: string | undefined; }' are incompatible.
      The types of 'config' are incompatible between these types.
        Type '{ [x: string]: string | undefined; }' is not assignable to type 'Record<string, string>'.
          'string' index signatures are incompatible.
            Type 'string | undefined' is not assignable to type 'string'.
              Type 'undefined' is not assignable to type 'string'.
src/ui/headless/auth/BusinessSSOSetup.tsx(372,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/ChangePasswordForm.tsx(301,30): error TS2554: Expected 2 arguments, but got 1.
src/ui/headless/auth/ChangePasswordForm.tsx(306,34): error TS2339: Property 'message' does not exist on type '{ success: 
boolean; error?: string | undefined; }'.
src/ui/headless/auth/ChangePasswordForm.tsx(342,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/DomainBasedOrgMatching.tsx(130,11): error TS2339: Property 'matchOrganizationByDomain' does not exist 
on type 'UseAuth'.
src/ui/headless/auth/DomainBasedOrgMatching.tsx(261,7): error TS2322: Type 'string | null' is not assignable to type 'string 
| undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/EmailVerification.tsx(27,34): error TS2551: Property 'clearSuccessMessage' does not exist on type 
'UseAuth'. Did you mean 'successMessage'?
src/ui/headless/auth/ForgotPasswordForm.tsx(68,11): error TS2339: Property 'forgotPassword' does not exist on type 'UseAuth'.
src/ui/headless/auth/ForgotPasswordForm.tsx(178,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/IDPConfiguration.tsx(144,5): error TS2339: Property 'configureIDP' does not exist on type 'UseAuth'.
src/ui/headless/auth/IDPConfiguration.tsx(145,5): error TS2339: Property 'getIDPProviders' does not exist on type 'UseAuth'.
src/ui/headless/auth/IDPConfiguration.tsx(146,5): error TS2339: Property 'testIDPConfiguration' does not exist on type 
'UseAuth'.
src/ui/headless/auth/IDPConfiguration.tsx(147,5): error TS2339: Property 'getIDPStatus' does not exist on type 'UseAuth'.
src/ui/headless/auth/IDPConfiguration.tsx(148,5): error TS2339: Property 'deleteIDPConfiguration' does not exist on type 
'UseAuth'.
src/ui/headless/auth/IDPConfiguration.tsx(183,43): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ui/headless/auth/IDPConfiguration.tsx(231,17): error TS2345: Argument of type '(prev: { config?: Record<string, string> 
| undefined; form?: string | undefined; }) => { config: { [x: string]: string | undefined; }; form?: string | undefined; }' 
is not assignable to parameter of type 'SetStateAction<{ config?: Record<string, string> | undefined; form?: string | 
undefined; }>'.
  Type '(prev: { config?: Record<string, string> | undefined; form?: string | undefined; }) => { config: { [x: string]: 
string | undefined; }; form?: string | undefined; }' is not assignable to type '(prevState: { config?: Record<string, 
string> | undefined; form?: string | undefined; }) => { config?: Record<string, string> | undefined; form?: string | 
undefined; }'.
    Call signature return types '{ config: { [x: string]: string | undefined; }; form?: string | undefined; }' and '{ 
config?: Record<string, string> | undefined; form?: string | undefined; }' are incompatible.
      The types of 'config' are incompatible between these types.
        Type '{ [x: string]: string | undefined; }' is not assignable to type 'Record<string, string>'.
          'string' index signatures are incompatible.
            Type 'string | undefined' is not assignable to type 'string'.
              Type 'undefined' is not assignable to type 'string'.
src/ui/headless/auth/IDPConfiguration.tsx(290,19): error TS2345: Argument of type '(prev: { config?: Record<string, string> 
| undefined; form?: string | undefined; }) => { config: { [x: string]: string | undefined; }; form?: string | undefined; }' 
is not assignable to parameter of type 'SetStateAction<{ config?: Record<string, string> | undefined; form?: string | 
undefined; }>'.
  Type '(prev: { config?: Record<string, string> | undefined; form?: string | undefined; }) => { config: { [x: string]: 
string | undefined; }; form?: string | undefined; }' is not assignable to type '(prevState: { config?: Record<string, 
string> | undefined; form?: string | undefined; }) => { config?: Record<string, string> | undefined; form?: string | 
undefined; }'.
    Call signature return types '{ config: { [x: string]: string | undefined; }; form?: string | undefined; }' and '{ 
config?: Record<string, string> | undefined; form?: string | undefined; }' are incompatible.
      The types of 'config' are incompatible between these types.
        Type '{ [x: string]: string | undefined; }' is not assignable to type 'Record<string, string>'.
          'string' index signatures are incompatible.
            Type 'string | undefined' is not assignable to type 'string'.
              Type 'undefined' is not assignable to type 'string'.
src/ui/headless/auth/IDPConfiguration.tsx(433,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/LoginFormReact19.tsx(249,32): error TS2554: Expected 2-3 arguments, but got 1.
src/ui/headless/auth/LoginFormReact19.tsx(285,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/MFAManagementSection.tsx(130,5): error TS2339: Property 'getUserMFAMethods' does not exist on type 
'UseAuth'.
src/ui/headless/auth/MFAManagementSection.tsx(131,5): error TS2339: Property 'getAvailableMFAMethods' does not exist on type 
'UseAuth'.
src/ui/headless/auth/MFAManagementSection.tsx(132,5): error TS2339: Property 'disableMFAMethod' does not exist on type 
'UseAuth'.
src/ui/headless/auth/MFAManagementSection.tsx(133,5): error TS2339: Property 'regenerateMFABackupCodes' does not exist on 
type 'UseAuth'.
src/ui/headless/auth/MFAManagementSection.tsx(167,36): error TS7006: Parameter 'method' implicitly has an 'any' type.
src/ui/headless/auth/MFAManagementSection.tsx(266,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/MFASetup.tsx(9,10): error TS2614: Module '"@/hooks/auth/useMFA"' has no exported member 'useAuth'. Did 
you mean to use 'import useAuth from "@/hooks/auth/useMFA"' instead?
src/ui/headless/auth/MFAVerificationForm.tsx(147,49): error TS2345: Argument of type 'string' is not assignable to parameter 
of type 'boolean | undefined'.
src/ui/headless/auth/MFAVerificationForm.tsx(184,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/OAuthButtons.tsx(57,11): error TS2339: Property 'getOAuthProviders' does not exist on type 'UseAuth'.
src/ui/headless/auth/OAuthButtons.tsx(57,30): error TS2339: Property 'signInWithOAuth' does not exist on type 'UseAuth'.
src/ui/headless/auth/OAuthCallback.tsx(105,11): error TS2339: Property 'handleOAuthCallback' does not exist on type 
'UseAuth'.
src/ui/headless/auth/OAuthCallback.tsx(185,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/OrganizationSSO.tsx(119,5): error TS2339: Property 'getOrganizationSSOProviders' does not exist on type 
'UseAuth'.
src/ui/headless/auth/OrganizationSSO.tsx(120,5): error TS2339: Property 'getOrganizationByDomain' does not exist on type 
'UseAuth'.
src/ui/headless/auth/OrganizationSSO.tsx(121,5): error TS2339: Property 'initiateOrganizationSSO' does not exist on type 
'UseAuth'.
src/ui/headless/auth/OrganizationSSO.tsx(226,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/PasswordResetForm.tsx(186,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/PasswordResetForm.tsx(188,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/ProtectedRoute.tsx(64,81): error TS2339: Property 'hasRole' does not exist on type 'UseAuth'.
src/ui/headless/auth/ProtectedRoute.tsx(64,90): error TS2339: Property 'hasPermission' does not exist on type 'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(150,5): error TS2339: Property 'getUserAuthProviders' does not exist on 
type 'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(151,5): error TS2339: Property 'getAvailableAuthProviders' does not exist 
on type 'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(152,5): error TS2339: Property 'linkAuthProvider' does not exist on type 
'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(153,5): error TS2339: Property 'unlinkAuthProvider' does not exist on type 
'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(154,5): error TS2339: Property 'setPrimaryAuthProvider' does not exist on 
type 'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(155,5): error TS2339: Property 'verifyProviderEmail' does not exist on type 
'UseAuth'.
src/ui/headless/auth/ProviderManagementPanel.tsx(189,37): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ui/headless/auth/ProviderManagementPanel.tsx(195,47): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ui/headless/auth/ProviderManagementPanel.tsx(196,50): error TS7006: Parameter 'p' implicitly has an 'any' type.
src/ui/headless/auth/ProviderManagementPanel.tsx(390,5): error TS2322: Type 'string | null' is not assignable to type 
'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/ResetPasswordForm.tsx(209,51): error TS2554: Expected 1 arguments, but got 2.
src/ui/headless/auth/ResetPasswordForm.tsx(245,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/auth/TwoFactorSetup.tsx(76,5): error TS2339: Property 'setupTwoFactor' does not exist on type 'UseAuth'.
src/ui/headless/auth/TwoFactorSetup.tsx(77,5): error TS2339: Property 'verifyTwoFactor' does not exist on type 'UseAuth'.
src/ui/headless/auth/TwoFactorSetup.tsx(78,5): error TS2339: Property 'getUserProfile' does not exist on type 'UseAuth'.
src/ui/headless/auth/TwoFactorSetup.tsx(183,86): error TS7053: Element implicitly has an 'any' type because expression of 
type 'TwoFactorMethod' can't be used to index type '{ qrCode?: string | undefined; secret?: string | undefined; 
backupCodes?: string[] | undefined; phoneNumber?: string | undefined; email?: string | undefined; }'.
  Property 'sms' does not exist on type '{ qrCode?: string | undefined; secret?: string | undefined; backupCodes?: string[] 
| undefined; phoneNumber?: string | undefined; email?: string | undefined; }'.
src/ui/headless/auth/withRole.tsx(119,5): error TS2339: Property 'getUserRoles' does not exist on type 'UseAuth'.
src/ui/headless/auth/withRole.tsx(120,5): error TS2339: Property 'getUserPermissions' does not exist on type 'UseAuth'.
src/ui/headless/auth/withRole.tsx(191,5): error TS2322: Type 'string | null' is not assignable to type 'string | undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/common/ThemeSettings.tsx(40,23): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/headless/common/ThemeSettings.tsx(40,67): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/headless/common/ThemeSettings.tsx(52,63): error TS2353: Object literal may only specify known properties, and 
'color_scheme' does not exist in type 'Partial<{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: 
string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }>'.
src/ui/headless/common/ThemeSettings.tsx(62,23): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/headless/common/ThemeSettings.tsx(62,67): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/headless/dashboard/Dashboard.tsx(43,16): error TS2345: Argument of type '{ [x: string]: unknown; }[]' is not 
assignable to parameter of type 'SetStateAction<Item[]>'.
  Type '{ [x: string]: unknown; }[]' is not assignable to type 'Item[]'.
    Type '{ [x: string]: unknown; }' is missing the following properties from type 'Item': id, title, description
src/ui/headless/gdpr/ConsentManagement.tsx(41,7): error TS2322: Type '{ marketing: boolean; push?: boolean | undefined; 
email?: boolean | undefined; }' is not assignable to type '{ push: boolean; email: boolean; marketing: boolean; }'.
  Types of property 'push' are incompatible.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
src/ui/headless/gdpr/DataDeletionRequest.tsx(15,22): error TS2322: Type '() => Promise<boolean>' is not assignable to type 
'() => Promise<void>'.
  Type 'Promise<boolean>' is not assignable to type 'Promise<void>'.
    Type 'boolean' is not assignable to type 'void'.
src/ui/headless/gdpr/DataExportRequest.tsx(15,22): error TS2322: Type '() => Promise<string | null>' is not assignable to 
type '() => Promise<void>'.
  Type 'Promise<string | null>' is not assignable to type 'Promise<void>'.
    Type 'string | null' is not assignable to type 'void'.
      Type 'null' is not assignable to type 'void'.
src/ui/headless/index.ts(47,1): error TS2308: Module '@/ui/headless/company/NotificationPreferences' has already exported a 
member named 'NotificationPreferences'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(47,1): error TS2308: Module '@/ui/headless/company/NotificationPreferences' has already exported a 
member named 'NotificationPreferencesProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(57,1): error TS2308: Module '@/ui/headless/user/ProfileForm' has already exported a member named 
'ProfileFormProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(57,1): error TS2308: Module '@/ui/headless/user/ProfileForm' has already exported a member named 
'ProfileFormRenderProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(59,1): error TS2308: Module '@/ui/headless/user/AvatarUpload' has already exported a member named 
'AvatarUploadProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(59,1): error TS2308: Module '@/ui/headless/user/AvatarUpload' has already exported a member named 
'AvatarUploadRenderProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(63,1): error TS2308: Module '@/ui/headless/company/NotificationPreferences' has already exported a 
member named 'NotificationPreferences'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(63,1): error TS2308: Module '@/ui/headless/company/NotificationPreferences' has already exported a 
member named 'NotificationPreferencesProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(67,1): error TS2308: Module '@/ui/headless/user/Profile' has already exported a member named 
'ProfileProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(87,1): error TS2308: Module '@/ui/headless/account/AccountDeletion' has already exported a member 
named 'AccountDeletion'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(87,1): error TS2308: Module '@/ui/headless/account/AccountDeletion' has already exported a member 
named 'AccountDeletionProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(99,1): error TS2308: Module '@/ui/headless/two-factor/TwoFactorSetup' has already exported a member 
named 'TwoFactorSetup'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(99,1): error TS2308: Module '@/ui/headless/two-factor/TwoFactorSetup' has already exported a member 
named 'TwoFactorSetupProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(101,1): error TS2308: Module '@/ui/headless/auth/BusinessSSOSetup' has already exported a member 
named 'SSOProvider'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(113,1): error TS2308: Module '@/ui/headless/subscription/SubscriptionManager' has already exported 
a member named 'SubscriptionManager'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(113,1): error TS2308: Module '@/ui/headless/subscription/SubscriptionManager' has already exported 
a member named 'SubscriptionManagerProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(125,1): error TS2308: Module '@/ui/headless/profile/DataExport' has already exported a member named 
'DataExport'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(125,1): error TS2308: Module '@/ui/headless/profile/DataExport' has already exported a member named 
'DataExportProps'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/headless/index.ts(155,15): error TS2307: Cannot find module '@/ui/headless/admin/auditLogs/AdminAuditLogs' or its 
corresponding type declarations.
src/ui/headless/permission/__tests__/ResourcePermissionAssigner.test.tsx(30,43): error TS2493: Tuple type '[]' of length '0' 
has no element at index '0'.
src/ui/headless/permission/__tests__/ResourcePermissionAssigner.test.tsx(32,13): error TS18048: 'args' is possibly 
'undefined'.
src/ui/headless/permission/__tests__/ResourcePermissionAssigner.test.tsx(36,13): error TS18048: 'args' is possibly 
'undefined'.
src/ui/headless/permission/PermissionEditor.tsx(87,18): error TS2339: Property 'name' does not exist on type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(88,18): error TS2339: Property 'description' does not exist on type 
'Permission'.
  Property 'description' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(89,18): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(90,18): error TS2339: Property 'action' does not exist on type 'Permission'.
  Property 'action' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(99,36): error TS2339: Property 'resource' does not exist on type 
'Permission'.
  Property 'resource' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(108,49): error TS2339: Property 'name' does not exist on type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(108,70): error TS2339: Property 'name' does not exist on type 'Permission'.
  Property 'name' does not exist on type '"ADMIN_ACCESS"'.
src/ui/headless/permission/PermissionEditor.tsx(165,5): error TS2322: Type 'string | null' is not assignable to type 'string 
| undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/permission/PermissionEditor.tsx(166,5): error TS2322: Type 'string | null' is not assignable to type 'string 
| undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/permission/ResourcePermissionAssigner.tsx(22,11): error TS2339: Property 'assignResourcePermission' does not 
exist on type '{ permissions: Permission[]; isLoading: boolean; error: string | null; successMessage: string | null; 
fetchAllPermissions: () => Promise<Permission[]>; ... 7 more ...; checkPermission: (options: UsePermissionOptions) => 
Promise<...>; }'.
src/ui/headless/permission/ResourcePermissionAssigner.tsx(22,37): error TS2339: Property 'removeResourcePermission' does not 
exist on type '{ permissions: Permission[]; isLoading: boolean; error: string | null; successMessage: string | null; 
fetchAllPermissions: () => Promise<Permission[]>; ... 7 more ...; checkPermission: (options: UsePermissionOptions) => 
Promise<...>; }'.
src/ui/headless/permission/RoleManager.tsx(478,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/permission/RoleManager.tsx(479,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/AccountSettings.tsx(177,11): error TS2322: Type '"light" | "dark" | "system"' is not assignable to 
type '"system"'.
  Type '"light"' is not assignable to type '"system"'.
src/ui/headless/profile/AccountSettings.tsx(186,13): error TS2322: Type 'string[]' is not assignable to type 'never[]'.
  Type 'string' is not assignable to type 'never'.
src/ui/headless/profile/AccountSettings.tsx(281,20): error TS2339: Property 'error' does not exist on type '{ success: 
boolean; }'.
src/ui/headless/profile/AccountSettings.tsx(282,54): error TS2339: Property 'error' does not exist on type '{ success: 
boolean; }'.
src/ui/headless/profile/AccountSettings.tsx(343,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/AccountSettings.tsx(345,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/AvatarUpload.tsx(56,29): error TS2554: Expected 1 arguments, but got 3.
src/ui/headless/profile/AvatarUpload.tsx(80,26): error TS2345: Argument of type 'Blob' is not assignable to parameter of 
type 'string | File'.
  Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
src/ui/headless/profile/AvatarUpload.tsx(99,9): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to 
type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/ui/headless/profile/AvatarUpload.tsx(100,9): error TS2322: Type 'RefObject<HTMLImageElement | null>' is not assignable 
to type 'RefObject<HTMLImageElement>'.
  Type 'HTMLImageElement | null' is not assignable to type 'HTMLImageElement'.
    Type 'null' is not assignable to type 'HTMLImageElement'.
src/ui/headless/profile/CompanyLogoUpload.tsx(63,29): error TS2554: Expected 1 arguments, but got 3.
src/ui/headless/profile/CompanyLogoUpload.tsx(87,31): error TS2345: Argument of type 'Blob' is not assignable to parameter 
of type 'string | File'.
  Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
src/ui/headless/profile/CompanyLogoUpload.tsx(110,9): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not 
assignable to type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/ui/headless/profile/CompanyLogoUpload.tsx(111,9): error TS2322: Type 'RefObject<HTMLImageElement | null>' is not 
assignable to type 'RefObject<HTMLImageElement>'.
  Type 'HTMLImageElement | null' is not assignable to type 'HTMLImageElement'.
    Type 'null' is not assignable to type 'HTMLImageElement'.
src/ui/headless/profile/CorporateProfileSection.tsx(41,27): error TS2769: No overload matches this call.
  Overload 1 of 4, '(schema: Zod3Type<{ name: string; website?: string | undefined; industry?: string | undefined; 
position?: string | undefined; department?: string | undefined; vatId?: string | undefined; address?: { ...; } | undefined; 
size?: "1-10" | ... 5 more ... | undefined; }, { ...; }>, schemaOptions?: ParseParams | undefined, resolverOptions?: 
NonRawResolverOptions | undefined): Resolver<...>', gave the following error.
    Argument of type 'ZodType<{ name: string; website?: string | undefined; industry?: string | undefined; position?: string 
| undefined; department?: string | undefined; vatId?: string | undefined; address?: { ...; } | undefined; size?: "1-10" | 
... 5 more ... | undefined; }, ZodTypeDef, { ...; }>' is not assignable to parameter of type 'Zod3Type<{ name: string; 
website?: string | undefined; industry?: string | undefined; position?: string | undefined; department?: string | undefined; 
vatId?: string | undefined; address?: { ...; } | undefined; size?: "1-10" | ... 5 more ... | undefined; }, { ...; }>'.
      Types of property '_def' are incompatible.
        Property 'typeName' is missing in type 'ZodTypeDef' but required in type '{ typeName: string; }'.
  Overload 2 of 4, '(schema: $ZodType<unknown, FieldValues, $ZodTypeInternals<unknown, FieldValues>>, schemaOptions?: 
ParseContext<$ZodIssue> | undefined, resolverOptions?: NonRawResolverOptions | undefined): Resolver<...>', gave the 
following error.
    Argument of type 'ZodType<{ name: string; website?: string | undefined; industry?: string | undefined; position?: string 
| undefined; department?: string | undefined; vatId?: string | undefined; address?: { ...; } | undefined; size?: "1-10" | 
... 5 more ... | undefined; }, ZodTypeDef, { ...; }>' is not assignable to parameter of type '$ZodType<unknown, FieldValues, 
$ZodTypeInternals<unknown, FieldValues>>'.
      Property '_zod' is missing in type 'ZodType<{ name: string; website?: string | undefined; industry?: string | 
undefined; position?: string | undefined; department?: string | undefined; vatId?: string | undefined; address?: { ...; } | 
undefined; size?: "1-10" | ... 5 more ... | undefined; }, ZodTypeDef, { ...; }>' but required in type '$ZodType<unknown, 
FieldValues, $ZodTypeInternals<unknown, FieldValues>>'.
src/ui/headless/profile/NotificationPreferences.tsx(37,27): error TS2339: Property 'BILLING' does not exist on type 'typeof 
NotificationCategory'.
src/ui/headless/profile/NotificationPreferences.tsx(47,16): error TS2345: Argument of type '{ 
[NotificationCategory.BILLING]: { email: any; push: any; inApp: boolean; }; security: { email: any; push: any; inApp: true; 
}; team: { email: any; push: any; inApp: true; }; }' is not assignable to parameter of type 
'SetStateAction<NotificationPreferencesState>'.
  Type '{ [x: number]: { email: any; push: any; inApp: boolean; }; security: { email: any; push: any; inApp: true; }; team: 
{ email: any; push: any; inApp: true; }; }' is missing the following properties from type 'NotificationPreferencesState': 
system, account, promotional, updates, activity
src/ui/headless/profile/NotificationPreferences.tsx(50,31): error TS2339: Property 'BILLING' does not exist on type 'typeof 
NotificationCategory'.
src/ui/headless/profile/PrivacySettings.tsx(25,20): error TS2339: Property 'updatePrivacySettings' does not exist on type '{ 
profile: Profile | null; isLoading: boolean; }'.
src/ui/headless/profile/PrivacySettings.tsx(33,21): error TS18048: 'profile.privacySettings' is possibly 'undefined'.
src/ui/headless/profile/PrivacySettings.tsx(33,21): error TS2345: Argument of type '"private" | "public" | "contacts" | 
undefined' is not assignable to parameter of type 'SetStateAction<"private" | "public" | "contacts">'.
  Type 'undefined' is not assignable to type 'SetStateAction<"private" | "public" | "contacts">'.
src/ui/headless/profile/PrivacySettings.tsx(34,20): error TS18048: 'profile.privacySettings' is possibly 'undefined'.
src/ui/headless/profile/PrivacySettings.tsx(34,20): error TS2345: Argument of type 'boolean | undefined' is not assignable 
to parameter of type 'SetStateAction<boolean>'.
  Type 'undefined' is not assignable to type 'SetStateAction<boolean>'.
src/ui/headless/profile/PrivacySettings.tsx(35,20): error TS18048: 'profile.privacySettings' is possibly 'undefined'.
src/ui/headless/profile/PrivacySettings.tsx(35,20): error TS2345: Argument of type 'boolean | undefined' is not assignable 
to parameter of type 'SetStateAction<boolean>'.
  Type 'undefined' is not assignable to type 'SetStateAction<boolean>'.
src/ui/headless/profile/ProfileEditor.tsx(485,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/ProfileEditor.tsx(487,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/ProfileForm.tsx(188,38): error TS5076: '||' and '??' operations cannot be mixed without parentheses.
src/ui/headless/profile/ProfileForm.tsx(198,28): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/profile/ProfileTypeConversion.tsx(83,40): error TS2345: Argument of type '(prev: Record<string, string>) => 
{ form: string | undefined; }' is not assignable to parameter of type 'SetStateAction<Record<string, string>>'.
  Type '(prev: Record<string, string>) => { form: string | undefined; }' is not assignable to type '(prevState: 
Record<string, string>) => Record<string, string>'.
    Type '{ form: string | undefined; }' is not assignable to type 'Record<string, string>'.
      Property 'form' is incompatible with index signature.
        Type 'string | undefined' is not assignable to type 'string'.
          Type 'undefined' is not assignable to type 'string'.
src/ui/headless/profile/ProfileVerification.tsx(41,29): error TS2554: Expected 1 arguments, but got 0.
src/ui/headless/profile/SecuritySettings.tsx(52,7): error TS2322: Type '(newPolicies: OrganizationSecurityPolicy) => 
Promise<boolean>' is not assignable to type '(p: any) => Promise<void>'.
  Type 'Promise<boolean>' is not assignable to type 'Promise<void>'.
    Type 'boolean' is not assignable to type 'void'.
src/ui/headless/settings/DataExport.tsx(39,39): error TS2322: Type 'ExportFormat' is not assignable to type 'ExportFormat | 
undefined'.
src/ui/headless/shared/ConnectedAccounts.tsx(8,33): error TS2459: Module '"@/types/connectedAccounts"' declares 
'OAuthProvider' locally, but it is not exported.
src/ui/headless/shared/ConnectedAccounts.tsx(24,5): error TS2339: Property 'linkAccount' does not exist on type 
'ConnectedAccountsState'.
src/ui/headless/shared/ConnectedAccounts.tsx(25,5): error TS2339: Property 'unlinkAccount' does not exist on type 
'ConnectedAccountsState'.
src/ui/headless/shared/NotificationPreferences.tsx(24,53): error TS2322: Type '(data: Partial<{ id: string; createdAt: Date; 
updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { push: boolean; 
email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }>) => Promise<...>' is 
not assignable to type '(prefs: Partial<{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: string; 
theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: 
number; timezone: string; dateFormat: string; }>) => Promise<...>'.
  Type 'Promise<boolean>' is not assignable to type 'Promise<void>'.
    Type 'boolean' is not assignable to type 'void'.
src/ui/headless/subscription/SubscriptionBadge.tsx(17,41): error TS2322: Type '() => boolean' is not assignable to type 
'boolean'.
src/ui/headless/team/InvitationManager.tsx(408,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/InvitationManager.tsx(409,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/TeamCreator.tsx(201,7): error TS2353: Object literal may only specify known properties, and 'isPublic' 
does not exist in type 'TeamCreatePayload'.
src/ui/headless/team/TeamCreator.tsx(250,7): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/TeamCreator.tsx(252,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/TeamInviteDialog.tsx(41,5): error TS2322: Type '{ isExpired: boolean | ""; id: string; teamId: string; 
email: string; role: string; invitedBy: string; status: InvitationStatus; createdAt: string; expiresAt: string; 
respondedAt?: string | undefined; metadata?: Record<...> | undefined; }[]' is not assignable to type '(TeamInvitation & { 
isExpired: boolean; })[]'.
  Type '{ isExpired: boolean | ""; id: string; teamId: string; email: string; role: string; invitedBy: string; status: 
InvitationStatus; createdAt: string; expiresAt: string; respondedAt?: string; metadata?: Record<string, any>; }' is not 
assignable to type 'TeamInvitation & { isExpired: boolean; }'.
    Type '{ isExpired: boolean | ""; id: string; teamId: string; email: string; role: string; invitedBy: string; status: 
InvitationStatus; createdAt: string; expiresAt: string; respondedAt?: string; metadata?: Record<string, any>; }' is not 
assignable to type '{ isExpired: boolean; }'.
      Types of property 'isExpired' are incompatible.
        Type 'string | boolean' is not assignable to type 'boolean'.
          Type 'string' is not assignable to type 'boolean'.
src/ui/headless/team/TeamInviteDialog.tsx(42,5): error TS2322: Type '(_invitationId: string) => Promise<{ success: boolean; 
error?: string; }>' is not assignable to type '(id: string) => Promise<void>'.
  Type 'Promise<{ success: boolean; error?: string | undefined; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; error?: string | undefined; }' is not assignable to type 'void'.
src/ui/headless/team/TeamInviteDialog.tsx(43,5): error TS2322: Type '(invitationId: string) => Promise<{ success: boolean; 
error?: string; }>' is not assignable to type '(id: string) => Promise<void>'.
  Type 'Promise<{ success: boolean; error?: string | undefined; }>' is not assignable to type 'Promise<void>'.
    Type '{ success: boolean; error?: string | undefined; }' is not assignable to type 'void'.
src/ui/headless/team/TeamInviteDialog.tsx(44,20): error TS2322: Type 'Promise<TeamInvitation[]>' is not assignable to type 
'Promise<void>'.
  Type 'TeamInvitation[]' is not assignable to type 'void'.
src/ui/headless/team/TeamManagement.tsx(55,5): error TS2322: Type '() => Promise<TeamMember[]>' is not assignable to type 
'() => Promise<void>'.
  Type 'Promise<TeamMember[]>' is not assignable to type 'Promise<void>'.
    Type 'TeamMember[]' is not assignable to type 'void'.
src/ui/headless/team/TeamManagement.tsx(56,31): error TS2322: Type 'Promise<TeamInvitation[]>' is not assignable to type 
'Promise<void>'.
  Type 'TeamInvitation[]' is not assignable to type 'void'.
src/ui/headless/team/TeamMemberManager.tsx(157,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/TeamMemberManager.tsx(158,5): error TS2322: Type 'string | null' is not assignable to type 'string | 
undefined'.
  Type 'null' is not assignable to type 'string | undefined'.
src/ui/headless/team/TeamMembersList.tsx(62,5): error TS2322: Type '() => Promise<TeamMember[]>' is not assignable to type 
'() => Promise<void>'.
  Type 'Promise<TeamMember[]>' is not assignable to type 'Promise<void>'.
    Type 'TeamMember[]' is not assignable to type 'void'.
src/ui/headless/user/__tests__/avatarUpload.test.tsx(165,9): error TS7034: Variable 'selectedId' implicitly has type 'any' 
in some locations where its type cannot be determined.
src/ui/headless/user/__tests__/avatarUpload.test.tsx(187,14): error TS7005: Variable 'selectedId' implicitly has an 'any' 
type.
src/ui/headless/user/__tests__/profile.test.tsx(21,7): error TS2322: Type '"private"' is not assignable to type 'UserType | 
undefined'.
src/ui/headless/user/__tests__/profileForm.test.tsx(7,10): error TS2300: Duplicate identifier 'api'.
src/ui/headless/user/__tests__/profileForm.test.tsx(26,10): error TS2300: Duplicate identifier 'api'.
src/ui/headless/user/AvatarUpload.tsx(156,29): error TS2554: Expected 1 arguments, but got 3.
src/ui/headless/user/AvatarUpload.tsx(234,29): error TS2339: Property 'getState' does not exist on type '() => { 
fetchProfile: () => Promise<void>; error: string | null; profile: Profile | null; isLoading: boolean; clearError: () => 
void; uploadCompanyLogo: (fileOrBase64: string | File) => Promise<...>; ... 10 more ...; requestVerification: (document?: 
File | undefined) => Promise<...>; }'.
src/ui/headless/user/AvatarUpload.tsx(289,5): error TS2322: Type 'RefObject<HTMLInputElement | null>' is not assignable to 
type 'RefObject<HTMLInputElement>'.
  Type 'HTMLInputElement | null' is not assignable to type 'HTMLInputElement'.
    Type 'null' is not assignable to type 'HTMLInputElement'.
src/ui/headless/user/AvatarUpload.tsx(290,5): error TS2322: Type 'RefObject<HTMLImageElement | null>' is not assignable to 
type 'RefObject<HTMLImageElement>'.
  Type 'HTMLImageElement | null' is not assignable to type 'HTMLImageElement'.
    Type 'null' is not assignable to type 'HTMLImageElement'.
src/ui/headless/user/ProfileForm.tsx(78,25): error TS2339: Property 'gender' does not exist on type 'Profile'.
src/ui/headless/user/ProfileForm.tsx(79,9): error TS2322: Type 'string | { street_line1: string; street_line2?: string | 
null | undefined; city: string; state?: string | null | undefined; postal_code: string; country: string; validated?: boolean 
| null | undefined; }' is not assignable to type 'string | null | undefined'.
  Type '{ street_line1: string; street_line2?: string | null | undefined; city: string; state?: string | null | undefined; 
postal_code: string; country: string; validated?: boolean | null | undefined; }' is not assignable to type 'string'.
src/ui/headless/user/ProfileForm.tsx(80,23): error TS2339: Property 'city' does not exist on type 'Profile'.
src/ui/headless/user/ProfileForm.tsx(81,24): error TS2339: Property 'state' does not exist on type 'Profile'.
src/ui/headless/user/ProfileForm.tsx(82,26): error TS2339: Property 'country' does not exist on type 'Profile'.
src/ui/headless/user/ProfileForm.tsx(83,30): error TS2339: Property 'postal_code' does not exist on type 'Profile'.
src/ui/headless/user/ProfileForm.tsx(84,31): error TS2551: Property 'phone_number' does not exist on type 'Profile'. Did you 
mean 'phoneNumber'?
src/ui/headless/user/ProfileForm.tsx(86,28): error TS2551: Property 'is_public' does not exist on type 'Profile'. Did you 
mean 'isPublic'?
src/ui/headless/user/ProfileForm.tsx(97,27): error TS2345: Argument of type '{ bio?: string | null | undefined; website?: 
string | null | undefined; city?: string | null | undefined; state?: string | null | undefined; postal_code?: string | null 
| undefined; country?: string | ... 1 more ... | undefined; address?: string | ... 1 more ... | undefined; gender?: string | 
... 1 more ... | undefi...' is not assignable to parameter of type 'Partial<Profile>'.
  Types of property 'address' are incompatible.
    Type 'string | null | undefined' is not assignable to type '{ street_line1: string; street_line2?: string | null | 
undefined; city: string; state?: string | null | undefined; postal_code: string; country: string; validated?: boolean | null 
| undefined; } | null | undefined'.
      Type 'string' is not assignable to type '{ street_line1: string; street_line2?: string | null | undefined; city: 
string; state?: string | null | undefined; postal_code: string; country: string; validated?: boolean | null | undefined; }'.
src/ui/headless/user/ProfileForm.tsx(113,23): error TS2339: Property 'setState' does not exist on type '() => { 
fetchProfile: () => Promise<void>; error: string | null; profile: Profile | null; isLoading: boolean; clearError: () => 
void; uploadCompanyLogo: (fileOrBase64: string | File) => Promise<...>; ... 10 more ...; requestVerification: (document?: 
File | undefined) => Promise<...>; }'.
src/ui/headless/user/ProfileForm.tsx(113,32): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/headless/webhooks/WebhookForm.tsx(36,58): error TS2345: Argument of type '{ name: string; url: string; events: 
never[]; }' is not assignable to parameter of type '{ name: string; events: string[]; url: string; isActive: boolean; } | 
(() => { name: string; events: string[]; url: string; isActive: boolean; })'.
  Property 'isActive' is missing in type '{ name: string; url: string; events: never[]; }' but required in type '{ name: 
string; events: string[]; url: string; isActive: boolean; }'.
src/ui/headless/webhooks/WebhookForm.tsx(66,78): error TS2349: This expression is not callable.
  No constituent of type 'UseMutationResult<Webhook | undefined, Error, { name: string; events: string[]; url: string; 
isActive: boolean; }, unknown>' is callable.
src/ui/headless/webhooks/WebhookForm.tsx(69,15): error TS2345: Argument of type '{ name: string; url: string; events: 
never[]; }' is not assignable to parameter of type 'SetStateAction<{ name: string; events: string[]; url: string; isActive: 
boolean; }>'.
  Property 'isActive' is missing in type '{ name: string; url: string; events: never[]; }' but required in type '{ name: 
string; events: string[]; url: string; isActive: boolean; }'.
src/ui/headless/webhooks/WebhookList.tsx(42,11): error TS2349: This expression is not callable.
  No constituent of type 'UseMutationResult<{ success: boolean; error?: string | undefined; }, Error, string, unknown>' is 
callable.
src/ui/headless/webhooks/WebhookList.tsx(71,5): error TS2322: Type '() => Promise<{ success: boolean; error?: undefined; } | 
{ success: boolean; error: string; }>' is not assignable to type '() => Promise<void>'.
  Type 'Promise<{ success: boolean; error?: undefined; } | { success: boolean; error: string; }>' is not assignable to type 
'Promise<void>'.
    Type '{ success: boolean; error?: undefined; } | { success: boolean; error: string; }' is not assignable to type 'void'.
      Type '{ success: boolean; error?: undefined; }' is not assignable to type 'void'.
src/ui/headless/webhooks/WebhookManager.tsx(37,77): error TS2349: This expression is not callable.
  No constituent of type 'UseMutationResult<Webhook | undefined, Error, { name: string; events: string[]; url: string; 
isActive: boolean; }, unknown>' is callable.
src/ui/headless/webhooks/WebhookManager.tsx(42,88): error TS2349: This expression is not callable.
  No constituent of type 'UseMutationResult<Webhook | undefined, Error, { id: string; } & { name?: string | undefined; 
events?: string[] | undefined; url?: string | undefined; isActive?: boolean | undefined; regenerateSecret?: boolean | 
undefined; }, unknown>' is callable.
src/ui/headless/webhooks/WebhookManager.tsx(47,72): error TS2349: This expression is not callable.
  No constituent of type 'UseMutationResult<{ success: boolean; error?: string | undefined; }, Error, string, unknown>' is 
callable.
src/ui/styled/account/__tests__/DeleteAccountDialog.test.tsx(3,10): error TS2614: Module '"../DeleteAccountDialog"' has no 
exported member 'DeleteAccountDialog'. Did you mean to use 'import DeleteAccountDialog from "../DeleteAccountDialog"' 
instead?
src/ui/styled/account/__tests__/DeleteAccountDialog.test.tsx(22,26): error TS2304: Cannot find name 'Mock'.
src/ui/styled/admin/__tests__/RoleManagementPanel.test.tsx(18,18): error TS2749: 'RoleSchema' refers to a value, but is 
being used as a type here. Did you mean 'typeof RoleSchema'?
src/ui/styled/admin/RetentionDashboard.tsx(57,67): error TS2339: Property 'warningUsers' does not exist on type 
'RetentionMetrics'.
src/ui/styled/admin/RetentionDashboard.tsx(85,67): error TS2339: Property 'anonymizedUsers' does not exist on type 
'RetentionMetrics'.
src/ui/styled/admin/RoleManagementPanel.tsx(144,47): error TS7006: Parameter 'perm' implicitly has an 'any' type.
src/ui/styled/audit/PermissionAuditDashboard.tsx(15,12): error TS2741: Property 'renderItem' is missing in type '{ logs: 
AuditLogEntry[]; }' but required in type 'PermissionLogTimelineProps'.
src/ui/styled/auth/__tests__/EmailVerification.test.tsx(4,10): error TS2614: Module '"@/ui/styled/auth/EmailVerification"' 
has no exported member 'EmailVerification'. Did you mean to use 'import EmailVerification from 
"@/ui/styled/auth/EmailVerification"' instead?
src/ui/styled/auth/__tests__/LoginForm.test.tsx(5,10): error TS2614: Module '"@/ui/styled/auth/LoginForm"' has no exported 
member 'LoginForm'. Did you mean to use 'import LoginForm from "@/ui/styled/auth/LoginForm"' instead?
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(4,10): error TS2614: Module '"@/ui/styled/auth/ProtectedRoute"' has no 
exported member 'ProtectedRoute'. Did you mean to use 'import ProtectedRoute from "@/ui/styled/auth/ProtectedRoute"' instead?
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(76,13): error TS2339: Property 'setState' does not exist on type '() => 
UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(105,13): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(122,13): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(141,13): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(163,13): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(183,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(208,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(234,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(265,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(298,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(323,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/ProtectedRoute.test.tsx(349,15): error TS2339: Property 'setState' does not exist on type '() 
=> UseAuth'.
src/ui/styled/auth/__tests__/UpgradeToBusinessFlow.test.tsx(49,13): error TS2339: Property 'mockReturnValue' does not exist 
on type '() => UseAuth'.
src/ui/styled/auth/__tests__/UpgradeToBusinessFlow.test.tsx(54,26): error TS2339: Property 'mockReturnValue' does not exist 
on type 'UseBoundStore<StoreApi<NotificationState>>'.
src/ui/styled/auth/__tests__/UpgradeToBusinessFlow.test.tsx(275,65): error TS2322: Type '{ onCompleted: Mock<Procedure>; 
onCancel: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & UpgradeToBusinessFlowProps'.
  Property 'onCancel' does not exist on type 'IntrinsicAttributes & UpgradeToBusinessFlowProps'.
src/ui/styled/auth/__tests__/UpgradeToBusinessFlow.test.tsx(289,13): error TS2339: Property 'mockReturnValue' does not exist 
on type '() => UseAuth'.
src/ui/styled/auth/__tests__/UpgradeToBusinessFlow.test.tsx(295,65): error TS2322: Type '{ onCompleted: Mock<Procedure>; 
onCancel: Mock<Procedure>; }' is not assignable to type 'IntrinsicAttributes & UpgradeToBusinessFlowProps'.
  Property 'onCancel' does not exist on type 'IntrinsicAttributes & UpgradeToBusinessFlowProps'.
src/ui/styled/auth/DomainBasedOrgMatching.tsx(53,5): error TS2322: Type 'Resolver<{ domain: string; autoJoin?: boolean | 
undefined; enforceSSO?: boolean | undefined; }, any, { domain: string; autoJoin: boolean; enforceSSO: boolean; }>' is not 
assignable to type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: 
boolean; enforceSSO: boolean; }>'.
  Types of parameters 'options' and 'options' are incompatible.
    Type 'ResolverOptions<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }>' is not assignable to type 
'ResolverOptions<{ domain: string; autoJoin?: boolean | undefined; enforceSSO?: boolean | undefined; }>'.
      Type 'boolean | undefined' is not assignable to type 'boolean'.
        Type 'undefined' is not assignable to type 'boolean'.
src/ui/styled/auth/DomainBasedOrgMatching.tsx(283,47): error TS2345: Argument of type '(values: DomainFormValues) => 
Promise<void>' is not assignable to parameter of type 'SubmitHandler<TFieldValues>'.
  Types of parameters 'values' and 'data' are incompatible.
    Type 'TFieldValues' is not assignable to type '{ domain: string; autoJoin: boolean; enforceSSO: boolean; }'.
      Type 'FieldValues' is missing the following properties from type '{ domain: string; autoJoin: boolean; enforceSSO: 
boolean; }': domain, autoJoin, enforceSSO
src/ui/styled/auth/DomainBasedOrgMatching.tsx(285,17): error TS2322: Type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, TFieldValues>' is not assignable to type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; enforceSSO: boolean; }>'.
  The types of '_options.resolver' are incompatible between these types.
    Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues> | undefined' is not 
assignable to type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: 
boolean; enforceSSO: boolean; }> | undefined'.
      Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues>' is not assignable to 
type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; 
enforceSSO: boolean; }>'.
        Type 'TFieldValues' is not assignable to type '{ domain: string; autoJoin: boolean; enforceSSO: boolean; }'.
          Type 'FieldValues' is missing the following properties from type '{ domain: string; autoJoin: boolean; enforceSSO: 
boolean; }': domain, autoJoin, enforceSSO
src/ui/styled/auth/DomainBasedOrgMatching.tsx(303,19): error TS2322: Type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, TFieldValues>' is not assignable to type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; enforceSSO: boolean; }>'.
  The types of '_options.resolver' are incompatible between these types.
    Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues> | undefined' is not 
assignable to type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: 
boolean; enforceSSO: boolean; }> | undefined'.
      Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues>' is not assignable to 
type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; 
enforceSSO: boolean; }>'.
        Type 'TFieldValues' is not assignable to type '{ domain: string; autoJoin: boolean; enforceSSO: boolean; }'.
          Type 'FieldValues' is missing the following properties from type '{ domain: string; autoJoin: boolean; enforceSSO: 
boolean; }': domain, autoJoin, enforceSSO
src/ui/styled/auth/DomainBasedOrgMatching.tsx(324,19): error TS2322: Type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, TFieldValues>' is not assignable to type 'Control<{ domain: string; autoJoin: boolean; 
enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; enforceSSO: boolean; }>'.
  The types of '_options.resolver' are incompatible between these types.
    Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues> | undefined' is not 
assignable to type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: 
boolean; enforceSSO: boolean; }> | undefined'.
      Type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, TFieldValues>' is not assignable to 
type 'Resolver<{ domain: string; autoJoin: boolean; enforceSSO: boolean; }, any, { domain: string; autoJoin: boolean; 
enforceSSO: boolean; }>'.
        Type 'TFieldValues' is not assignable to type '{ domain: string; autoJoin: boolean; enforceSSO: boolean; }'.
          Type 'FieldValues' is missing the following properties from type '{ domain: string; autoJoin: boolean; enforceSSO: 
boolean; }': domain, autoJoin, enforceSSO
src/ui/styled/auth/LoginForm.tsx(67,11): error TS2322: Type '(user: any, token: string) => void' is not assignable to type 
'() => void'.
  Target signature provides too few arguments. Expected 2 or more, but got 0.
src/ui/styled/auth/MFAVerificationForm.tsx(92,12): error TS2740: Type '{ children: Element; }' is missing the following 
properties from type 'UseFormReturn<FieldValues, any, FieldValues>': watch, getValues, getFieldState, setError, and 12 more.
src/ui/styled/auth/OAuthCallback.tsx(51,49): error TS2345: Argument of type 'User' is not assignable to parameter of type '{ 
id: string | number; email: string; userType: UserType; isActive: boolean; isVerified: boolean; createdAt?: string | Date | 
undefined; updatedAt?: string | Date | undefined; ... 6 more ...; fullName?: string | undefined; }'.
  Type 'User' is missing the following properties from type '{ id: string | number; email: string; userType: UserType; 
isActive: boolean; isVerified: boolean; createdAt?: string | Date | undefined; updatedAt?: string | Date | undefined; ... 6 
more ...; fullName?: string | undefined; }': userType, isActive, isVerified
src/ui/styled/auth/OrganizationSSO.tsx(154,9): error TS2322: Type '{ orgId: string; onSettingsChange: (settings: { 
sso_enabled: boolean; idp_type: "saml" | "oidc" | null; }) => void; }' is not assignable to type 'IntrinsicAttributes & 
BusinessSSOSetupProps'.
  Property 'orgId' does not exist on type 'IntrinsicAttributes & BusinessSSOSetupProps'.
src/ui/styled/auth/ProtectedRoute.tsx(50,5): error TS2322: Type 'null' is not assignable to type 'Element'.
src/ui/styled/auth/ProtectedRoute.tsx(55,64): error TS2345: Argument of type 'string' is not assignable to parameter of type 
'Role'.
src/ui/styled/auth/ProtectedRoute.tsx(57,7): error TS2322: Type 'string | number | bigint | true | Iterable<ReactNode> | 
Promise<AwaitedReactNode> | Element' is not assignable to type 'Element'.
  Type 'string' is not assignable to type 'ReactElement<any, any>'.
src/ui/styled/auth/ProtectedRoute.tsx(68,21): error TS2345: Argument of type 'string' is not assignable to parameter of type 
'Permission'.
src/ui/styled/auth/ProtectedRoute.tsx(71,7): error TS2322: Type 'string | number | bigint | true | Iterable<ReactNode> | 
Promise<AwaitedReactNode> | Element' is not assignable to type 'Element'.
  Type 'string' is not assignable to type 'ReactElement<any, any>'.
src/ui/styled/auth/ProviderManagementPanel.tsx(111,30): error TS7053: Element implicitly has an 'any' type because 
expression of type 'string' can't be used to index type '{ google: { label: string; icon: string; }; github: { label: 
string; icon: string; }; microsoft: { label: string; icon: string; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ google: { label: string; icon: string; }; 
github: { label: string; icon: string; }; microsoft: { label: string; icon: string; }; }'.
src/ui/styled/auth/ProviderManagementPanel.tsx(165,75): error TS7053: Element implicitly has an 'any' type because 
expression of type 'string' can't be used to index type '{ google: { label: string; icon: string; }; github: { label: 
string; icon: string; }; microsoft: { label: string; icon: string; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ google: { label: string; icon: string; }; 
github: { label: string; icon: string; }; microsoft: { label: string; icon: string; }; }'.
src/ui/styled/auth/withRole.tsx(12,34): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/auth/withRole.tsx(12,34): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/auth/withRole.tsx(13,40): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/auth/withRole.tsx(13,40): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/auth/withRole.tsx(14,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/auth/withRole.tsx(14,41): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/auth/withRole.tsx(21,9): error TS2349: This expression is not callable.
  Type 'RBACState' has no call signatures.
src/ui/styled/auth/withRole.tsx(26,26): error TS2349: This expression is not callable.
  Type 'RBACState' has no call signatures.
src/ui/styled/auth/withRole.tsx(33,9): error TS2349: This expression is not callable.
  Type 'RBACState' has no call signatures.
src/ui/styled/common/__tests__/DataTable.a11y.test.tsx(11,35): error TS2322: Type '({ key: string; header: string; sortable: 
boolean; } | { key: string; header: string; sortable?: undefined; })[]' is not assignable to type 'Column<{ id: number; 
name: string; }>[]'.
  Type '{ key: string; header: string; sortable: boolean; } | { key: string; header: string; sortable?: undefined; }' is not 
assignable to type 'Column<{ id: number; name: string; }>'.
    Type '{ key: string; header: string; sortable: boolean; }' is not assignable to type 'Column<{ id: number; name: string; 
}>'.
      Types of property 'key' are incompatible.
        Type 'string' is not assignable to type '"id" | "name"'.
src/ui/styled/common/DataTable.tsx(108,52): error TS2339: Property 'render' does not exist on type 'Column<T>'.
src/ui/styled/common/DataTable.tsx(109,38): error TS2339: Property 'render' does not exist on type 'Column<T>'.
src/ui/styled/common/DevErrorDetailsPanel.tsx(11,15): error TS2339: Property 'details' does not exist on type 'ErrorEntry'.
src/ui/styled/common/FileManager.tsx(248,39): error TS2345: Argument of type '["fileManager.openFolder", { folder: string; 
}, "Open folder {{folder}}"]' is not assignable to parameter of type '[key: string | string[], options: TOptionsBase & 
$Dictionary & { defaultValue: string; }] | [key: string | string[], defaultValue: string, options?: (TOptionsBase & 
$Dictionary) | undefined] | [key: ...]'.
  Type '["fileManager.openFolder", { folder: string; }, "Open folder {{folder}}"]' is not assignable to type '[key: string | 
string[], defaultValue: string, options?: (TOptionsBase & $Dictionary) | undefined]'.
    Type at position 1 in source is not compatible with type at position 1 in target.
      Type '{ folder: string; }' is not assignable to type 'string'.
src/ui/styled/common/FileManager.tsx(267,39): error TS2345: Argument of type '["fileManager.download", { file: string; }, 
"Download {{file}}"]' is not assignable to parameter of type '[key: string | string[], options: TOptionsBase & $Dictionary & 
{ defaultValue: string; }] | [key: string | string[], defaultValue: string, options?: (TOptionsBase & $Dictionary) | 
undefined] | [key: ...]'.
  Type '["fileManager.download", { file: string; }, "Download {{file}}"]' is not assignable to type '[key: string | 
string[], defaultValue: string, options?: (TOptionsBase & $Dictionary) | undefined]'.
    Type at position 1 in source is not compatible with type at position 1 in target.
      Type '{ file: string; }' is not assignable to type 'string'.
src/ui/styled/common/FileManager.tsx(275,39): error TS2345: Argument of type '["fileManager.rename", { file: string; }, 
"Rename {{file}}"]' is not assignable to parameter of type '[key: string | string[], options: TOptionsBase & $Dictionary & { 
defaultValue: string; }] | [key: string | string[], defaultValue: string, options?: (TOptionsBase & $Dictionary) | 
undefined] | [key: ...]'.
  Type '["fileManager.rename", { file: string; }, "Rename {{file}}"]' is not assignable to type '[key: string | string[], 
defaultValue: string, options?: (TOptionsBase & $Dictionary) | undefined]'.
    Type at position 1 in source is not compatible with type at position 1 in target.
      Type '{ file: string; }' is not assignable to type 'string'.
src/ui/styled/common/FileManager.tsx(284,39): error TS2345: Argument of type '["fileManager.delete", { file: string; }, 
"Delete {{file}}"]' is not assignable to parameter of type '[key: string | string[], options: TOptionsBase & $Dictionary & { 
defaultValue: string; }] | [key: string | string[], defaultValue: string, options?: (TOptionsBase & $Dictionary) | 
undefined] | [key: ...]'.
  Type '["fileManager.delete", { file: string; }, "Delete {{file}}"]' is not assignable to type '[key: string | string[], 
defaultValue: string, options?: (TOptionsBase & $Dictionary) | undefined]'.
    Type at position 1 in source is not compatible with type at position 1 in target.
      Type '{ file: string; }' is not assignable to type 'string'.
src/ui/styled/common/FileManager.tsx(303,19): error TS2345: Argument of type '["fileManager.confirmDeleteMessage", { file: 
string | undefined; }, { defaultValue: "Are you sure you want to delete {{file}}?"; }]' is not assignable to parameter of 
type '[key: string | TemplateStringsArray | (string | TemplateStringsArray)[], options?: { readonly defaultValue: "Are you 
sure you want to delete {{file}}?"; } | undefined] | [key: ...] | [key: ...]'.
  Type '["fileManager.confirmDeleteMessage", { file: string | undefined; }, { defaultValue: "Are you sure you want to delete 
{{file}}?"; }]' is not assignable to type '[key: string | string[], defaultValue: string, options?: ({ readonly 
defaultValue: "Are you sure you want to delete {{file}}?"; } & $Dictionary) | undefined]'.
    Type at position 1 in source is not compatible with type at position 1 in target.
      Type '{ file: string | undefined; }' is not assignable to type 'string'.
src/ui/styled/common/FormErrorSummary.tsx(34,25): error TS2322: Type '{ children: Element; asChild: true; }' is not 
assignable to type 'IntrinsicAttributes & HTMLAttributes<HTMLParagraphElement> & RefAttributes<HTMLParagraphElement>'.
  Property 'asChild' does not exist on type 'IntrinsicAttributes & HTMLAttributes<HTMLParagraphElement> & 
RefAttributes<HTMLParagraphElement>'.
src/ui/styled/common/ThemeSettings.tsx(36,23): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/common/ThemeSettings.tsx(36,72): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/common/ThemeSettings.tsx(37,39): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/common/ThemeSettings.tsx(61,63): error TS2353: Object literal may only specify known properties, and 
'color_scheme' does not exist in type 'Partial<{ id: string; createdAt: Date; updatedAt: Date; userId: string; language: 
string; theme: "light" | "dark" | "system"; notifications: { push: boolean; email: boolean; marketing: boolean; }; 
itemsPerPage: number; timezone: string; dateFormat: string; }>'.
src/ui/styled/common/ThemeSettings.tsx(73,23): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/common/ThemeSettings.tsx(73,72): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/common/ThemeSettings.tsx(74,39): error TS2339: Property 'color_scheme' does not exist on type '{ id: string; 
createdAt: Date; updatedAt: Date; userId: string; language: string; theme: "light" | "dark" | "system"; notifications: { 
push: boolean; email: boolean; marketing: boolean; }; itemsPerPage: number; timezone: string; dateFormat: string; }'.
src/ui/styled/gdpr/DataExport.tsx(23,3): error TS2614: Module '"@/ui/headless/settings/DataExport"' has no exported member 
'ExportFormat'. Did you mean to use 'import ExportFormat from "@/ui/headless/settings/DataExport"' instead?
src/ui/styled/gdpr/DataExport.tsx(41,9): error TS2339: Property 'handleExport' does not exist on type '{ selectedFormat: 
ExportFormat; setSelectedFormat: (f: ExportFormat) => void; selectedCategories: ExportCategory[]; setSelectedCategories: (c: 
ExportCategory[]) => void; ... 6 more ...; checkStatus: () => Promise<...>; }'.
src/ui/styled/gdpr/PrivacyPreferences.tsx(13,31): error TS2322: Type '{ marketing: boolean; push?: boolean | undefined; 
email?: boolean | undefined; }' is not assignable to type '{ push: boolean; email: boolean; marketing: boolean; }'.
  Types of property 'push' are incompatible.
    Type 'boolean | undefined' is not assignable to type 'boolean'.
      Type 'undefined' is not assignable to type 'boolean'.
src/ui/styled/index.ts(33,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export 
type'.
src/ui/styled/index.ts(72,10): error TS2614: Module '"@/ui/styled/profile/DataExport"' has no exported member 'DataExport'. 
Did you mean to use 'import DataExport from "@/ui/styled/profile/DataExport"' instead?
src/ui/styled/index.ts(110,1): error TS2308: Module '@/ui/styled/two-factor/TwoFactorSetup' has already exported a member 
named 'TwoFactorSetup'. Consider explicitly re-exporting to resolve the ambiguity.
src/ui/styled/index.ts(126,3): error TS1205: Re-exporting a type when 'isolatedModules' is enabled requires using 'export 
type'.
src/ui/styled/layout/__tests__/Header.test.tsx(46,18): error TS2304: Cannot find name 'userEvent'.
src/ui/styled/notification/NotificationCenter.tsx(32,93): error TS2551: Property 'created_at' does not exist on type 
'Notification'. Did you mean 'createdAt'?
src/ui/styled/payment/InvoiceGenerator.tsx(41,23): error TS2322: Type '"success" | "destructive" | "secondary"' is not 
assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.
  Type '"success"' is not assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.
src/ui/styled/payment/PaymentHistory.tsx(35,17): error TS2322: Type '"success" | "destructive" | "secondary"' is not 
assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.
  Type '"success"' is not assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.
src/ui/styled/payment/PaymentHistory.tsx(63,17): error TS2322: Type '({ key: string; header: string; sortable: boolean; 
render?: undefined; } | { key: string; header: string; sortable: boolean; render: (status: string) => Element; })[]' is not 
assignable to type 'Column<{ date: string; amount: string; id: string; status: "succeeded" | "pending" | "failed"; 
description: string; }>[]'.
  Type '{ key: string; header: string; sortable: boolean; render?: undefined; } | { key: string; header: string; sortable: 
boolean; render: (status: string) => Element; }' is not assignable to type 'Column<{ date: string; amount: string; id: 
string; status: "succeeded" | "pending" | "failed"; description: string; }>'.
    Type '{ key: string; header: string; sortable: boolean; render?: undefined; }' is not assignable to type 'Column<{ date: 
string; amount: string; id: string; status: "succeeded" | "pending" | "failed"; description: string; }>'.
      Types of property 'key' are incompatible.
        Type 'string' is not assignable to type '"id" | "status" | "date" | "description" | "amount"'.
src/ui/styled/permission/PermissionEditor.tsx(85,89): error TS2339: Property 'name' does not exist on type 'never'.
src/ui/styled/permission/PermissionEditor.tsx(88,87): error TS2339: Property 'name' does not exist on type 'never'.
src/ui/styled/permission/RoleHierarchyTree.tsx(6,15): error TS2459: Module '"@/types/rbac"' declares 'Permission' locally, 
but it is not exported.
src/ui/styled/permission/RoleHierarchyTree.tsx(19,39): error TS2339: Property 'name' does not exist on type 'TreeNode'.
src/ui/styled/permission/RoleHierarchyTree.tsx(31,17): error TS2339: Property 'id' does not exist on type 'TreeNode'.
src/ui/styled/permission/RoleHierarchyTree.tsx(37,45): error TS2339: Property 'id' does not exist on type 'TreeNode'.
src/ui/styled/permission/RoleHierarchyTree.tsx(37,79): error TS2339: Property 'id' does not exist on type 'TreeNode'.
src/ui/styled/permission/RoleHierarchyTree.tsx(39,20): error TS2339: Property 'children' does not exist on type 'TreeNode'.
src/ui/styled/permission/RoleHierarchyTree.tsx(39,46): error TS2339: Property 'id' does not exist on type 'TreeNode'.
src/ui/styled/profile/__tests__/CompanyDataExport.test.tsx(16,5): error TS2322: Type 'MockInstance<{ <K extends keyof 
HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): HTMLElementTagNameMap[K]; <K extends keyof 
HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): 
HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: Elem...' is not assignable to type 'MockInstance<(this: 
unknown, ...args: unknown[]) => unknown>'.
  Types of property 'mock' are incompatible.
    Type 'MockContext<{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): 
HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions | 
undefined): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: Eleme...' is not assignable to type 
'MockContext<(this: unknown, ...args: unknown[]) => unknown>'.
      Type '{ <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): 
HTMLElementTagNameMap[K]; <K extends keyof HTMLElementDeprecatedTagNameMap>(tagName: K, options?: ElementCreationOptions | 
undefined): HTMLElementDeprecatedTagNameMap[K]; (tagName: string, options?: ElementCreationOp...' is not assignable to type 
'(this: unknown, ...args: unknown[]) => unknown'.
        Types of parameters 'options' and 'args' are incompatible.
          Type 'unknown' is not assignable to type 'ElementCreationOptions | undefined'.
src/ui/styled/profile/__tests__/CorporateProfileSection.test.tsx(40,13): error TS2353: Object literal may only specify known 
properties, and 'features' does not exist in type 'UserManagementConfig'.
src/ui/styled/profile/__tests__/CorporateProfileSection.test.tsx(58,3): error TS2322: Type 
'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/types/platform").Platform' is not assignable to type 
'import("C:/Dev/Projects/Products/Apps/user-management-reorganized/src/lib/services/notification.service").Platform'.
src/ui/styled/profile/__tests__/CorporateProfileSection.test.tsx(71,5): error TS2820: Type '"FREE"' is not assignable to 
type 'SubscriptionTier'. Did you mean 'SubscriptionTier.FREE'?
src/ui/styled/profile/__tests__/CorporateProfileSection.test.tsx(121,14): error TS2304: Cannot find name 
'UserManagementProvider'.
src/ui/styled/profile/__tests__/CorporateProfileSection.test.tsx(131,14): error TS2304: Cannot find name 
'UserManagementProvider'.
src/ui/styled/profile/__tests__/Profile.test.tsx(125,32): error TS2322: Type '{ user: any; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'user' does not exist on type 'IntrinsicAttributes'.
src/ui/styled/profile/__tests__/Profile.test.tsx(169,32): error TS2322: Type '{ user: any; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'user' does not exist on type 'IntrinsicAttributes'.
src/ui/styled/profile/__tests__/Profile.test.tsx(209,32): error TS2322: Type '{ user: any; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'user' does not exist on type 'IntrinsicAttributes'.
src/ui/styled/profile/__tests__/Profile.test.tsx(246,32): error TS2322: Type '{ user: any; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'user' does not exist on type 'IntrinsicAttributes'.
src/ui/styled/profile/__tests__/Profile.test.tsx(283,32): error TS2322: Type '{ user: any; }' is not assignable to type 
'IntrinsicAttributes'.
  Property 'user' does not exist on type 'IntrinsicAttributes'.
src/ui/styled/profile/__tests__/ProfileForm.test.tsx(11,21): error TS7006: Parameter 'selector' implicitly has an 'any' type.
src/ui/styled/profile/__tests__/ProfilePrivacySettings.test.tsx(39,7): error TS2353: Object literal may only specify known 
properties, and 'updatePrivacySettings' does not exist in type '{ fetchProfile: () => Promise<void>; error: string | null; 
profile: Profile | null; isLoading: boolean; clearError: () => void; uploadCompanyLogo: (fileOrBase64: string | File) => 
Promise<...>; ... 10 more ...; requestVerification: (document?: File | undefined) => Promise<...>; }'.
src/ui/styled/profile/__tests__/ProfilePrivacySettings.test.tsx(82,7): error TS2353: Object literal may only specify known 
properties, and 'updatePrivacySettings' does not exist in type '{ fetchProfile: () => Promise<void>; error: string | null; 
profile: Profile | null; isLoading: boolean; clearError: () => void; uploadCompanyLogo: (fileOrBase64: string | File) => 
Promise<...>; ... 10 more ...; requestVerification: (document?: File | undefined) => Promise<...>; }'.
src/ui/styled/profile/__tests__/ProfilePrivacySettings.test.tsx(119,7): error TS2353: Object literal may only specify known 
properties, and 'updatePrivacySettings' does not exist in type '{ fetchProfile: () => Promise<void>; error: string | null; 
profile: Profile | null; isLoading: boolean; clearError: () => void; uploadCompanyLogo: (fileOrBase64: string | File) => 
Promise<...>; ... 10 more ...; requestVerification: (document?: File | undefined) => Promise<...>; }'.
src/ui/styled/profile/__tests__/ProfilePrivacySettings.test.tsx(155,7): error TS2353: Object literal may only specify known 
properties, and 'updatePrivacySettings' does not exist in type '{ fetchProfile: () => Promise<void>; error: string | null; 
profile: Profile | null; isLoading: boolean; clearError: () => void; uploadCompanyLogo: (fileOrBase64: string | File) => 
Promise<...>; ... 10 more ...; requestVerification: (document?: File | undefined) => Promise<...>; }'.
src/ui/styled/profile/__tests__/ProfilePrivacySettings.test.tsx(187,7): error TS2353: Object literal may only specify known 
properties, and 'updatePrivacySettings' does not exist in type '{ fetchProfile: () => Promise<void>; error: string | null; 
profile: Profile | null; isLoading: boolean; clearError: () => void; uploadCompanyLogo: (fileOrBase64: string | File) => 
Promise<...>; ... 10 more ...; requestVerification: (document?: File | undefined) => Promise<...>; }'.
src/ui/styled/profile/__tests__/ProfileTypeConversion.test.tsx(61,23): error TS2533: Object is possibly 'null' or 
'undefined'.
src/ui/styled/profile/__tests__/ProfileTypeConversion.test.tsx(137,48): error TS2345: Argument of type '{ profile: any; 
isLoading: false; error: null; updateProfile: Mock<Procedure>; fetchProfile: Mock<Procedure>; updateBusinessProfile: 
Mock<Procedure>; ... 4 more ...; clearError: Mock<...>; }' is not assignable to parameter of type '{ fetchProfile: () => 
Promise<void>; error: string | null; profile: DbProfile | null; isLoading: boolean; clearError: () => void; 
uploadCompanyLogo: (fileOrBase64: File | string) => Promise<string | null>; ... 10 more ...; requestVerification: 
(document?: File) => Promise<void>; }'.
  Type '{ profile: any; isLoading: false; error: null; updateProfile: Mock<Procedure>; fetchProfile: Mock<Procedure>; 
updateBusinessProfile: Mock<Procedure>; ... 4 more ...; clearError: Mock<...>; }' is missing the following properties from 
type '{ fetchProfile: () => Promise<void>; error: string | null; profile: Profile | null; isLoading: boolean; clearError: () 
=> void; uploadCompanyLogo: (fileOrBase64: string | File) => Promise<...>; ... 10 more ...; requestVerification: (document?: 
File | undefined) => Promise<...>; }': convertToBusinessProfile, verification, verificationLoading, verificationError, and 2 
more.
src/ui/styled/profile/__tests__/ProfileTypeConversion.test.tsx(167,15): error TS2339: Property 'method' does not exist on 
type '{ request: Request; requestId: string; }'.
src/ui/styled/profile/__tests__/ProfileTypeConversion.test.tsx(168,50): error TS2339: Property 'method' does not exist on 
type '{ request: Request; requestId: string; }'.
src/ui/styled/profile/__tests__/ProfileTypeConversion.test.tsx(168,64): error TS2339: Property 'url' does not exist on type 
'{ request: Request; requestId: string; }'.
src/ui/styled/profile/DataExport.tsx(22,36): error TS2339: Property 'handleExport' does not exist on type '{ selectedFormat: 
ExportFormat; setSelectedFormat: (f: ExportFormat) => void; selectedCategories: ExportCategory[]; setSelectedCategories: (c: 
ExportCategory[]) => void; ... 6 more ...; checkStatus: () => Promise<...>; }'.
src/ui/styled/profile/NotificationPreferences.tsx(10,69): error TS2322: Type 'TFunction<"translation", undefined>' is not 
assignable to type '(key: string, defaultValue?: string | undefined) => string'.
  Types of parameters 'args' and 'key' are incompatible.
    Type '[key: string, defaultValue?: string | undefined]' is not assignable to type '[key: string | string[], options: 
TOptionsBase & $Dictionary & { defaultValue: string; }] | [key: string | string[], defaultValue: string, options?: 
(TOptionsBase & $Dictionary) | undefined] | [key: ...]'.
      Type '[key: string, defaultValue?: string | undefined]' is not assignable to type '[key: string | string[], options?: 
(TOptionsBase & $Dictionary) | undefined]'.
        Type at position 1 in source is not compatible with type at position 1 in target.
          Type 'string | undefined' is not assignable to type '(TOptionsBase & $Dictionary) | undefined'.
            Type 'string' is not assignable to type 'TOptionsBase & $Dictionary'.
              Type 'string' is not assignable to type '$Dictionary'.
src/ui/styled/profile/ProfileEditor.tsx(64,30): error TS2345: Argument of type 'Blob' is not assignable to parameter of type 
'string | File'.
  Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
src/ui/styled/profile/ProfileEditor.tsx(135,17): error TS2322: Type 'RefObject<Cropper | null>' is not assignable to type 
'Ref<HTMLImageElement | ReactCropperElement> | undefined'.
  Type 'RefObject<Cropper | null>' is not assignable to type 'RefObject<HTMLImageElement | ReactCropperElement | null>'.
    Type 'Cropper | null' is not assignable to type 'HTMLImageElement | ReactCropperElement | null'.
      Type 'Cropper' is not assignable to type 'HTMLImageElement | ReactCropperElement | null'.
src/ui/styled/profile/ProfileForm.tsx(64,58): error TS2339: Property 'message' does not exist on type 'never'.
src/ui/styled/search/SearchPage.tsx(32,7): error TS2304: Cannot find name 'setItems'.
src/ui/styled/shared/NotificationPreferences.tsx(32,43): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/shared/NotificationPreferences.tsx(32,43): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/shared/NotificationPreferences.tsx(33,41): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/shared/NotificationPreferences.tsx(33,41): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/shared/NotificationPreferences.tsx(34,37): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/shared/NotificationPreferences.tsx(34,37): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/shared/NotificationPreferences.tsx(35,48): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/shared/NotificationPreferences.tsx(35,48): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/shared/NotificationPreferences.tsx(36,49): error TS7006: Parameter 'state' implicitly has an 'any' type.
src/ui/styled/shared/NotificationPreferences.tsx(36,49): error TS2554: Expected 0 arguments, but got 1.
src/ui/styled/shared/NotificationPreferences.tsx(40,11): error TS2349: This expression is not callable.
  Type 'PreferencesState' has no call signatures.
src/ui/styled/shared/NotificationPreferences.tsx(65,45): error TS2339: Property 'notifications' does not exist on type 
'PreferencesState'.
src/ui/styled/shared/NotificationPreferences.tsx(68,50): error TS2339: Property 'notifications' does not exist on type 
'PreferencesState'.
src/ui/styled/shared/NotificationPreferences.tsx(69,7): error TS2349: This expression is not callable.
  Type 'PreferencesState' has no call signatures.
src/ui/styled/team/InvitationManager.tsx(237,54): error TS2339: Property 'sentAt' does not exist on type 'TeamInvitation'.
src/ui/styled/team/InvitationManager.tsx(355,52): error TS2339: Property 'sentAt' does not exist on type 'TeamInvitation'.
src/ui/styled/team/InvitationManager.tsx(358,43): error TS2339: Property 'completedAt' does not exist on type 
'TeamInvitation'.
src/ui/styled/team/InviteMemberModal.tsx(63,40): error TS2339: Property 'percentage' does not exist on type 'SeatUsage'.
src/ui/styled/team/TeamManagement.tsx(255,20): error TS2322: Type '"warning"' is not assignable to type '"default" | 
"destructive" | null | undefined'.
src/ui/styled/team/TeamMemberManager.tsx(66,9): error TS2339: Property 'handleRoleChange' does not exist on type '{ members: 
TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; updateMemberRole: 
(userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; refreshMembers: () => 
Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(69,9): error TS2339: Property 'isSuccess' does not exist on type '{ members: 
TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; updateMemberRole: 
(userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; refreshMembers: () => 
Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(70,9): error TS2339: Property 'confirmationState' does not exist on type '{ 
members: TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; 
updateMemberRole: (userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; 
refreshMembers: () => Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(71,9): error TS2339: Property 'setConfirmationState' does not exist on type '{ 
members: TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; 
updateMemberRole: (userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; 
refreshMembers: () => Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(72,9): error TS2339: Property 'handleConfirmRemove' does not exist on type '{ 
members: TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; 
updateMemberRole: (userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; 
refreshMembers: () => Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(73,9): error TS2339: Property 'cancelRemove' does not exist on type '{ members: 
TeamMember[]; isLoading: boolean; error?: string | undefined; successMessage?: string | undefined; updateMemberRole: 
(userId: string, role: string) => Promise<void>; removeMember: (userId: string) => Promise<...>; refreshMembers: () => 
Promise<...>; availableRoles: { ...; }[]; }'.
src/ui/styled/team/TeamMemberManager.tsx(108,40): error TS2322: Type 'string | null | undefined' is not assignable to type 
'string | Blob | undefined'.
  Type 'null' is not assignable to type 'string | Blob | undefined'.
src/ui/styled/team/TeamMemberManager.tsx(110,30): error TS18048: 'member.name' is possibly 'undefined'.
src/ui/styled/team/TeamMemberManager.tsx(185,44): error TS2322: Type 'string | null | undefined' is not assignable to type 
'string | Blob | undefined'.
  Type 'null' is not assignable to type 'string | Blob | undefined'.
src/ui/styled/team/TeamMemberManager.tsx(187,34): error TS18048: 'member.name' is possibly 'undefined'.
src/ui/styled/two-factor/TwoFactorDisable.tsx(9,53): error TS2322: Type '{ children: ({ code: value, setCode: setValue, 
submit, loading, error }: TwoFactorDisableRenderProps) => Element; onSuccess: (() => void) | undefined; onCancel: (() => 
void) | undefined; }' is not assignable to type 'IntrinsicAttributes & TwoFactorDisableProps'.
  Property 'onCancel' does not exist on type 'IntrinsicAttributes & TwoFactorDisableProps'.
src/ui/styled/user/__tests__/profileForm.test.tsx(105,31): error TS2345: Argument of type '{ profile: { id: string; bio: 
string; gender: string; address: string; city: string; state: string; country: string; postal_code: string; phone_number: 
string; website: string; is_public: boolean; }; ... 11 more ...; userEmail: string; }' is not assignable to parameter of 
type 'ProfileFormRenderProps'.
  The types returned by 'register(...)' are incompatible between these types.
    Type '{}' is missing the following properties from type 'UseFormRegisterReturn<TFieldName>': onChange, onBlur, ref, name
src/ui/styled/user/__tests__/profileForm.test.tsx(160,23): error TS2345: Argument of type '{ profile: { id: string; bio: 
string; gender: string; address: string; city: string; state: string; country: string; postal_code: string; phone_number: 
string; website: string; is_public: boolean; }; ... 11 more ...; userEmail: string; }' is not assignable to parameter of 
type 'ProfileFormRenderProps'.
  The types returned by 'register(...)' are incompatible between these types.
    Type '{}' is missing the following properties from type 'UseFormRegisterReturn<TFieldName>': onChange, onBlur, ref, name
src/ui/styled/user/__tests__/profileForm.test.tsx(213,23): error TS2345: Argument of type '{ profile: { id: string; bio: 
string; gender: string; address: string; city: string; state: string; country: string; postal_code: string; phone_number: 
string; website: string; is_public: boolean; }; ... 11 more ...; userEmail: string; }' is not assignable to parameter of 
type 'ProfileFormRenderProps'.
  The types returned by 'register(...)' are incompatible between these types.
    Type '{}' is missing the following properties from type 'UseFormRegisterReturn<TFieldName>': onChange, onBlur, ref, name
src/ui/styled/user/__tests__/profileForm.test.tsx(265,23): error TS2345: Argument of type '{ profile: { id: string; bio: 
string; gender: string; address: string; city: string; state: string; country: string; postal_code: string; phone_number: 
string; website: string; is_public: boolean; }; ... 11 more ...; userEmail: string; }' is not assignable to parameter of 
type 'ProfileFormRenderProps'.
  The types returned by 'register(...)' are incompatible between these types.
    Type '{}' is missing the following properties from type 'UseFormRegisterReturn<TFieldName>': onChange, onBlur, ref, name
src/ui/styled/user/__tests__/profileForm.test.tsx(310,23): error TS2345: Argument of type '{ profile: { id: string; bio: 
string; gender: string; address: string; city: string; state: string; country: string; postal_code: string; phone_number: 
string; website: string; is_public: boolean; }; ... 11 more ...; userEmail: string; }' is not assignable to parameter of 
type 'ProfileFormRenderProps'.
  The types returned by 'register(...)' are incompatible between these types.
    Type '{}' is missing the following properties from type 'UseFormRegisterReturn<TFieldName>': onChange, onBlur, ref, name
src/ui/styled/user/ProfileForm.tsx(53,37): error TS2339: Property 'message' does not exist on type 'void'.
src/ui/styled/webhooks/WebhookForm.tsx(120,7): error TS2322: Type '((props: { data: { name: string; events: string[]; url: 
string; isActive: boolean; }; setData: (data: { name: string; events: string[]; url: string; isActive: boolean; }) => void; 
submit: () => Promise<void>; loading: boolean; error: string | null; }) => ReactNode) | (({ data, setData, submit, loading, 
error: formEr...' is not assignable to type '(props: WebhookFormRenderProps) => ReactNode'.
  Type '(props: { data: { name: string; events: string[]; url: string; isActive: boolean; }; setData: (data: { name: string; 
events: string[]; url: string; isActive: boolean; }) => void; submit: () => Promise<void>; loading: boolean; error: string | 
null; }) => ReactNode' is not assignable to type '(props: WebhookFormRenderProps) => ReactNode'.
    Types of parameters 'props' and 'props' are incompatible.
      Property 'loading' is missing in type 'WebhookFormRenderProps' but required in type '{ data: { name: string; events: 
string[]; url: string; isActive: boolean; }; setData: (data: { name: string; events: string[]; url: string; isActive: 
boolean; }) => void; submit: () => Promise<void>; loading: boolean; error: string | null; }'.


