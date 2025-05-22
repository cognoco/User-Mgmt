export interface SsoProvider {
  id: string;
  name: string;
  type: string;
}

export interface SsoConnection {
  id: string;
  providerId: string;
  providerName: string;
  createdAt: string;
}
