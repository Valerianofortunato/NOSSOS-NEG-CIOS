export function formatKwanza(value: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('AOA', '').trim() + ' Kz';
}

/**
 * Commission Inteligente Variável
 * calculates variable commission rate between 5% and 15% based on product value.
 */
export function calculateCommissionRate(price: number): number {
  if (price < 100000) {
    return 15; // 15% for cheaper items below 100.000 Kz
  } else if (price < 500000) {
    return 12; // 12% for items between 100k and 500k Kz
  } else if (price < 2000000) {
    return 8;  // 8% for items between 500k and 2M Kz
  } else if (price < 10000000) {
    return 6;  // 6% for items between 2M and 10M Kz
  } else {
    return 5;  // 5% minimum commission for highly expensive items over 10M Kz (autos, real estate)
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getHoursLeft(expiresStr: string): number {
  const expires = new Date(expiresStr).getTime();
  const now = new Date().getTime();
  const diffMs = expires - now;
  return Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1)));
}
