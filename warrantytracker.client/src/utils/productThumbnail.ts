export function getProductThumbnail(category: string): string {
  const normalized = category.toLowerCase();

  if (normalized.includes('panel')) {
    return '/images/product-solar-panel.svg';
  }

  if (normalized.includes('inverter')) {
    return '/images/product-inverter.svg';
  }

  if (normalized.includes('battery')) {
    return '/images/product-battery.svg';
  }

  return '/images/product-controller.svg';
}
