function diffYearsMonthsDays(from: Date, to: Date): { years: number; months: number; days: number } {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

function formatDuration({ years, months, days }: { years: number; months: number; days: number }): string {
  if (years > 0) {
    return months > 0 ? `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'}`;
  }

  if (months > 0) {
    return days > 0 ? `${months} month${months === 1 ? '' : 's'} ${days} day${days === 1 ? '' : 's'}` : `${months} month${months === 1 ? '' : 's'}`;
  }

  return `${days} day${days === 1 ? '' : 's'}`;
}

export function getRemainingWarrantyLabel(warrantyEndDate: string, isExpired: boolean, now: Date = new Date()): string {
  const endDate = new Date(warrantyEndDate);

  if (isExpired) {
    return `Expired ${formatDuration(diffYearsMonthsDays(endDate, now))} ago`;
  }

  if (endDate.getTime() <= now.getTime()) {
    return '0 days remaining';
  }

  return `${formatDuration(diffYearsMonthsDays(now, endDate))} remaining`;
}
