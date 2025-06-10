import { DefaultOAuthService } from "@/services/oauth/defaultOauth.service";
import type { OAuthService } from "@/core/oauth/interfaces";

let instance: OAuthService | null = null;

export function getServerOAuthService(): OAuthService {
  if (!instance) {
    instance = new DefaultOAuthService();
  }
  return instance;
} 