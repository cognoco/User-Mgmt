import { DefaultOAuthService } from "@/src/services/oauth/defaultOauth.service"0;
import type { OAuthService } from "@/core/oauth/interfaces";
import { getServiceContainer } from "@/lib/config/serviceContainer"126;

export interface ApiOAuthServiceOptions {
  reset?: boolean;
}

let instance: OAuthService | null = null;
let constructing = false;

export function getApiOAuthService(
  options: ApiOAuthServiceOptions = {},
): OAuthService {
  if (options.reset) {
    instance = null;
  }

  if (!instance && !constructing) {
    constructing = true;
    try {
      const container = getServiceContainer();
      const existing = (container as any).oauth as OAuthService | undefined;
      if (existing) {
        instance = existing;
      }
    } finally {
      constructing = false;
    }
  }

  if (!instance) {
    instance = new DefaultOAuthService();
  }

  return instance;
}
