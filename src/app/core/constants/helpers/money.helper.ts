/**
 * Helper format tiền tệ dùng chung cho Admin.
 * - VND: không có phần thập phân, dấu chấm ngăn cách hàng nghìn (1.234.567 ₫)
 * - USD: 2 chữ số thập phân, dấu phẩy hàng nghìn (1,234.56 $)
 */

export type MoneyInput = number | string | null | undefined;

export function parseMoney(value: MoneyInput): number | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  const num = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(num) ? num : null;
}

/**
 * Format tiền Việt Nam Đồng (VND).
 * Ví dụ: 1500000 → "1.500.000 ₫"
 * @param showSymbol mặc định true (có ký hiệu ₫)
 */
export function formatMoneyVnd(
  value: MoneyInput,
  options?: { showSymbol?: boolean; fallback?: string },
): string {
  const fallback = options?.fallback ?? '-';
  const showSymbol = options?.showSymbol ?? true;
  const amount = parseMoney(value);
  if (amount == null) return fallback;

  const formatted = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${formatted} ₫` : formatted;
}

/**
 * Format tiền Đô la Mỹ (USD).
 * Ví dụ: 1234.5 → "$1,234.50"
 * @param showSymbol mặc định true (có ký hiệu $)
 * @param fractionDigits mặc định 2
 */
export function formatMoneyUsd(
  value: MoneyInput,
  options?: { showSymbol?: boolean; fractionDigits?: number; fallback?: string },
): string {
  const fallback = options?.fallback ?? '-';
  const showSymbol = options?.showSymbol ?? true;
  const fractionDigits = options?.fractionDigits ?? 2;
  const amount = parseMoney(value);
  if (amount == null) return fallback;

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return showSymbol ? `$${formatted}` : formatted;
}

/**
 * Format tiền theo mã tiền tệ (ISO 4217) + locale.
 * Ví dụ: formatMoney(1500000, 'VND') → "1.500.000 ₫"
 *         formatMoney(1234.5, 'USD') → "US$1,234.50"
 */
export function formatMoney(
  value: MoneyInput,
  currency: 'VND' | 'USD' | string = 'VND',
  options?: { locale?: string; showSymbol?: boolean; fallback?: string },
): string {
  const fallback = options?.fallback ?? '-';
  const showSymbol = options?.showSymbol ?? true;
  const amount = parseMoney(value);
  if (amount == null) return fallback;

  const upper = currency.toUpperCase();
  if (upper === 'VND') {
    return formatMoneyVnd(amount, { showSymbol, fallback });
  }
  if (upper === 'USD') {
    return formatMoneyUsd(amount, { showSymbol, fallback });
  }

  const locale = options?.locale ?? (upper === 'VND' ? 'vi-VN' : 'en-US');
  if (!showSymbol) {
    return new Intl.NumberFormat(locale).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: upper,
    maximumFractionDigits: upper === 'VND' ? 0 : 2,
  }).format(amount);
}

/**
 * Format số thuần (không đơn vị tiền), kiểu Việt Nam.
 * Ví dụ: 1500000.5 → "1.500.000,5"
 */
export function formatNumberVi(
  value: MoneyInput,
  options?: { fractionDigits?: number; fallback?: string },
): string {
  const fallback = options?.fallback ?? '-';
  const amount = parseMoney(value);
  if (amount == null) return fallback;

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: options?.fractionDigits,
    maximumFractionDigits: options?.fractionDigits ?? 2,
  }).format(amount);
}

/**
 * Format số thuần, kiểu Mỹ (USD style).
 * Ví dụ: 1500000.5 → "1,500,000.50"
 */
export function formatNumberEn(
  value: MoneyInput,
  options?: { fractionDigits?: number; fallback?: string },
): string {
  const fallback = options?.fallback ?? '-';
  const amount = parseMoney(value);
  if (amount == null) return fallback;
  const fractionDigits = options?.fractionDigits ?? 2;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
