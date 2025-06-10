export const OAUTH_PROVIDERS = {
  google: {
    label: "Google",
    icon: "/icons/google.svg",
  },
  github: {
    label: "GitHub",
    icon: "/icons/github.svg",
  },
  microsoft: {
    label: "Microsoft",
    icon: "/icons/microsoft.svg",
  },
  // Add more providers as needed
};

type ProviderId = keyof typeof OAUTH_PROVIDERS;
export type { ProviderId };
