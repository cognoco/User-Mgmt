# Copy team routes
Copy-Item project/src/app/api/team/invites/route.ts -Destination app/api/team/invites/
Copy-Item project/src/app/api/team/invites/accept/route.ts -Destination app/api/team/invites/accept/
Copy-Item project/src/app/api/team/members/route.ts -Destination app/api/team/members/
Copy-Item project/src/app/api/team/members/[memberId]/route.ts -Destination "app/api/team/members/[memberId]/"
Copy-Item project/src/app/api/team/members/[memberId]/role/route.ts -Destination "app/api/team/members/[memberId]/role/"

# Copy organizations routes
Copy-Item project/src/app/api/organizations/[orgId]/sso/route.ts -Destination "app/api/organizations/[orgId]/sso/"
Copy-Item project/src/app/api/organizations/[orgId]/sso/domains/route.ts -Destination "app/api/organizations/[orgId]/sso/domains/"
Copy-Item project/src/app/api/organizations/[orgId]/sso/[idpType]/config/route.ts -Destination "app/api/organizations/[orgId]/sso/[idpType]/config/"

# Copy permissions route
Copy-Item project/src/app/api/permissions/check/route.ts -Destination app/api/permissions/check/ 