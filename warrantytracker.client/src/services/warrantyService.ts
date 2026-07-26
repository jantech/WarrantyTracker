import { apiFetch, ApiError } from './api';
import type {
  Product,
  PurchaseSource,
  RegistrationResponse,
  WarrantyRegistration,
  WarrantyResult,
  WarrantyStatus,
} from '../types/warranty';

interface WarrantyRegistrationApiResponse {
  id: number;
  ownerName: string;
  emailAddress?: string | null;
  mobileNumber: string;
  productName: string;
  category: string;
  modelNumber: string;
  purchaseSource: string;
  purchaseDate: string;
  warrantyStart: string;
  invoiceFile?: string | null;
  notes?: string | null;
}

function getWarrantyStatus(endDate: Date): WarrantyStatus {
  const now = new Date();
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  }

  if (diffDays <= 30) {
    return 'EXPIRING_SOON';
  }

  return 'ACTIVE';
}

// Pure calendar-date arithmetic (no Date-object timezone conversions), so warranty
// end dates don't drift by a day depending on the browser's local timezone offset.
function computeWarrantyEndDate(warrantyStart: string, warrantyMonths: number): string {
  const [year, month, day] = warrantyStart.split('T')[0].split('-').map(Number);

  const totalMonths = month - 1 + warrantyMonths;
  const endYear = year + Math.floor(totalMonths / 12);
  const endMonthIndex = totalMonths % 12;

  const daysInEndMonth = new Date(Date.UTC(endYear, endMonthIndex + 1, 0)).getUTCDate();
  const endDay = Math.min(day, daysInEndMonth);

  const mm = String(endMonthIndex + 1).padStart(2, '0');
  const dd = String(endDay).padStart(2, '0');

  return `${endYear}-${mm}-${dd}`;
}

function mapWarrantyResult(item: WarrantyRegistrationApiResponse, products: Product[]): WarrantyResult {
  const matchedProduct = products.find((product) => product.modelNumber.toLowerCase() === item.modelNumber.toLowerCase());
  const warrantyMonths = matchedProduct?.warrantyMonths ?? 12;
  const warrantyEndDate = computeWarrantyEndDate(item.warrantyStart, warrantyMonths);

  return {
    id: item.id,
    ownerName: item.ownerName,
    emailAddress: item.emailAddress ?? null,
    mobileNumber: item.mobileNumber,
    productName: item.productName,
    category: item.category,
    modelNumber: item.modelNumber,
    purchaseSource: item.purchaseSource,
    purchaseDate: item.purchaseDate,
    warrantyStartDate: item.warrantyStart,
    warrantyEndDate,
    invoiceFile: item.invoiceFile ?? null,
    notes: item.notes ?? null,
    status: getWarrantyStatus(new Date(warrantyEndDate)),
  };
}

export const warrantyService = {
  async getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>({ method: 'GET', url: '/Products' });
  },

  async getPurchaseSources(): Promise<PurchaseSource[]> {
    return apiFetch<PurchaseSource[]>({ method: 'GET', url: '/PurchaseSources' });
  },

  async registerWarranty(payload: WarrantyRegistration): Promise<RegistrationResponse> {
    const formData = new FormData();
    formData.append('OwnerName', payload.ownerName);
    formData.append('EmailAddress', payload.emailAddress ?? '');
    formData.append('MobileNumber', payload.mobileNumber);
    formData.append('ProductId', payload.productId.toString());
    formData.append('PurchaseSourceId', payload.purchaseSourceId.toString());
    formData.append('PurchaseDate', payload.purchaseDate);
    formData.append('Notes', payload.notes ?? '');

    if (payload.invoiceFile) {
      formData.append('InvoiceFile', payload.invoiceFile);
    }

    const response = await apiFetch<RegistrationResponse>({
      method: 'POST',
      url: '/WarrantyRegistrations',
      data: formData,
    });

    return response;
  },

  async searchWarrantyByMobile(mobileNumber: string): Promise<WarrantyResult[]> {
    const products = await warrantyService.getProducts();

    try {
      const response = await apiFetch<WarrantyRegistrationApiResponse[]>({
        method: 'GET',
        url: `/WarrantyRegistrations/mobile/${mobileNumber}`,
      });

      return response.map((item) => mapWarrantyResult(item, products));
    } catch (error) {
      // The API returns 404 when no registrations exist for this mobile number -
      // that's a valid "no results" outcome, not a failure.
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  },
};
