export interface Address {
  id: string;
  userId: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
  fullName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
