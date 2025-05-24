export interface UserConsent {
  userId: string;
  marketing: boolean;
  updatedAt: string;
}

export interface ConsentUpdatePayload {
  marketing: boolean;
}
