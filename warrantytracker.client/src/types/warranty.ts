export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface Product {
  id: number;
  name: string;
  category: string;
  modelNumber: string;
  warrantyMonths: number;
}

export interface PurchaseSource {
  id: number;
  name: string;
}

export interface WarrantyRegistration {
  ownerName: string;
  mobileNumber: string;
  emailAddress?: string;
  productId: number;
  purchaseDate: string;
  purchaseSourceId: number;
  invoiceFile?: File;
  notes?: string;
}

export interface WarrantyResult {
  id: number;
  ownerName: string;
  emailAddress?: string | null;
  mobileNumber: string;
  productName: string;
  category: string;
  modelNumber: string;
  purchaseSource: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  invoiceFile?: string | null;
  notes?: string | null;
  status: WarrantyStatus;
}

export interface RegistrationResponse {
  id: number;
  ownerName: string;
  mobileNumber: string;
  product: string;
  category: string;
  modelNumber: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyMonths: number;
  warrantyEnd: string;
  invoiceFile?: string | null;
  message: string;
}
