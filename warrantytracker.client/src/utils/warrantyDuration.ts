export function formatWarrantyDuration(months: number): string {
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearsLabel = `${years} year${years === 1 ? '' : 's'}`;

  if (remainingMonths === 0) {
    return yearsLabel;
  }

  return `${yearsLabel} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}
