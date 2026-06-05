import { apiFetch } from './api';
import type {
  Device,
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
  deviceName: string;
  brandName: string;
  modelNumber: string;
  purchaseSource: string;
  purchaseDate: string;
  warrantyStart: string;
  invoiceFile?: string | null;
  notes?: string | null;
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
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

function computeWarrantyEndDate(warrantyStart: string, warrantyMonths: number): string {
  const warrantyStartDate = new Date(warrantyStart);
  const warrantyEnd = new Date(warrantyStartDate);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
  return toIsoDate(warrantyEnd);
}

function mapWarrantyResult(item: WarrantyRegistrationApiResponse, devices: Device[]): WarrantyResult {
  const matchedDevice = devices.find((device) => device.modelNumber.toLowerCase() === item.modelNumber.toLowerCase());
  const warrantyMonths = matchedDevice?.warrantyMonths ?? 12;
  const warrantyEndDate = computeWarrantyEndDate(item.warrantyStart, warrantyMonths);

  return {
    id: item.id,
    ownerName: item.ownerName,
    emailAddress: item.emailAddress ?? null,
    mobileNumber: item.mobileNumber,
    deviceName: item.deviceName,
    brandName: item.brandName,
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
  async getDevices(): Promise<Device[]> {
    return apiFetch<Device[]>({ method: 'GET', url: '/Devices' });
  },

  async getPurchaseSources(): Promise<PurchaseSource[]> {
    return apiFetch<PurchaseSource[]>({ method: 'GET', url: '/PurchaseSources' });
  },

  async registerWarranty(payload: WarrantyRegistration): Promise<RegistrationResponse> {
    const formData = new FormData();
    formData.append('OwnerName', payload.ownerName);
    formData.append('EmailAddress', payload.emailAddress ?? '');
    formData.append('MobileNumber', payload.mobileNumber);
    formData.append('DeviceId', payload.deviceId.toString());
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
    const [devices, response] = await Promise.all([
      warrantyService.getDevices(),
      apiFetch<WarrantyRegistrationApiResponse[]>({
        method: 'GET',
        url: `/WarrantyRegistrations/mobile/${mobileNumber}`,
      }),
    ]);

    return response.map((item) => mapWarrantyResult(item, devices));
  },
};
