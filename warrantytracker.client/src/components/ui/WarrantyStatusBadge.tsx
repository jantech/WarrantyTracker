import type { WarrantyStatus } from '../../types/warranty';

interface WarrantyStatusBadgeProps {
  status: WarrantyStatus;
}

const statusStyles: Record<WarrantyStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  EXPIRING_SOON: 'bg-amber-100 text-amber-700 border-amber-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabel: Record<WarrantyStatus, string> = {
  ACTIVE: 'Active',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
};

export default function WarrantyStatusBadge({ status }: WarrantyStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
