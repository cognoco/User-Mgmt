import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Assuming TeamRole is defined elsewhere (e.g., in src/types/rbac.ts or similar)
// If not, define or import it here.
// Example placeholder:
// type TeamRole = "admin" | "member" | "viewer";

// Augment the JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string; // Or use specific TeamRole type if available
    teamId?: string;
    // Add any other properties you added to the token in the jwt callback
  }
}

// Augment the User type
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string; // Or use specific TeamRole type if available
    teamId?: string;
    // Add any other properties returned by the authorize callback
  }

  // Augment the Session type
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role?: string; // Or use specific TeamRole type if available
      teamId?: string;
      // Add other properties you want accessible in session.user
    } & DefaultSession["user"]; // Keep existing properties like name, email, image
  }
}