/**
 * Helper format / chuyển đổi ngày giờ dùng chung cho Admin.
 * - Hàm `to*` : gửi lên API (payload).
 * - Hàm `format*` : hiển thị trên UI.
 * - Thứ / tháng lấy từ enumData (labelKey) để hỗ trợ song ngữ.
 */

import { enumData } from '../enums/enumData';

export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;
export type DayOfWeekMeta = (typeof enumData.DAY_OF_WEEK)[keyof typeof enumData.DAY_OF_WEEK];
export type MonthMeta = (typeof enumData.MONTH)[keyof typeof enumData.MONTH];

const DAY_OF_WEEK_LIST = Object.values(enumData.DAY_OF_WEEK) as DayOfWeekMeta[];
const MONTH_LIST = Object.values(enumData.MONTH) as MonthMeta[];

export function parseDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function resolveLabel(labelKey: string, translate?: TranslateFn): string {
  return translate ? translate(labelKey) : labelKey;
}

/**
 * Lấy meta thứ trong tuần theo Date.getDay() (0 = Chủ nhật … 6 = Thứ bảy).
 * Dùng labelKey + | translate để song ngữ.
 */
export function getDayOfWeekMeta(
  value: Date | string | number | null | undefined,
): DayOfWeekMeta | null {
  const date = parseDate(value);
  if (!date) return null;
  return DAY_OF_WEEK_LIST.find((item) => item.value === date.getDay()) ?? null;
}

/**
 * Lấy meta tháng theo Date.getMonth() (0 = Tháng 1 … 11 = Tháng 12).
 */
export function getMonthMeta(value: Date | string | number | null | undefined): MonthMeta | null {
  const date = parseDate(value);
  if (!date) return null;
  return MONTH_LIST.find((item) => item.value === date.getMonth()) ?? null;
}

/**
 * Ngày lịch local → UTC midnight ISO (timestamptz / DateTime).
 * Ví dụ: chọn 12/08/2026 → "2026-08-12T00:00:00.000Z"
 * Dùng khi backend lưu DateTime/timestamptz, tránh lệch timezone.
 */
export function toUtcDateIso(value: Date | string | number): string {
  const date = new Date(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
}

/**
 * Giống `toUtcDateIso`, nhưng nhận null/undefined/'' → trả null.
 * Tiện cho field optional trên form.
 */
export function toUtcDateIsoOrNull(
  value: Date | string | number | null | undefined,
): string | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  return toUtcDateIso(value);
}

/**
 * Ngày lịch local → "yyyy-MM-dd" (DateOnly / date string API).
 * Ví dụ: 12/08/2026 → "2026-08-12"
 */
export function toDateOnly(value: Date | string | number): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * Giống `toDateOnly`, nhưng nhận null/undefined/'' → trả null.
 */
export function toDateOnlyOrNull(value: Date | string | number | null | undefined): string | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  return toDateOnly(value);
}

/**
 * Date/time local → ISO đầy đủ (giữ giờ phút giây hiện tại của Date).
 * Ví dụ: dùng cho datetime picker khi API cần DateTime có giờ.
 */
export function toDateTimeIso(value: Date | string | number): string {
  return new Date(value).toISOString();
}

/**
 * Giống `toDateTimeIso`, nhưng null-safe.
 */
export function toDateTimeIsoOrNull(
  value: Date | string | number | null | undefined,
): string | null {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  return toDateTimeIso(value);
}

/**
 * Format ngày: dd/MM/yyyy (kiểu Việt Nam).
 * Ví dụ: 12/08/2026
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Format giờ: HH:mm
 * Ví dụ: 09:05
 */
export function formatTime(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Format giờ đầy đủ: HH:mm:ss
 * Ví dụ: 09:05:03
 */
export function formatTimeFull(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/**
 * Format ngày giờ: dd/MM/yyyy HH:mm
 * Ví dụ: 12/08/2026 14:30
 */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Format ngày giờ đầy đủ: dd/MM/yyyy HH:mm:ss
 * Ví dụ: 12/08/2026 14:30:05
 */
export function formatDateTimeFull(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${formatDate(date)} ${formatTimeFull(date)}`;
}

/**
 * Format tháng/năm: MM/yyyy
 * Ví dụ: 08/2026
 */
export function formatMonthYear(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Format tháng/năm dạng chữ (song ngữ qua labelKey).
 * Truyền `translate` để ra text đã dịch; không truyền thì trả labelKey.
 * Ví dụ (vi): "Tháng 8/2026" — (en): "August/2026"
 */
export function formatMonthYearLabel(
  value: Date | string | number | null | undefined,
  translate?: TranslateFn,
  fallback = '-',
): string {
  const date = parseDate(value);
  const meta = getMonthMeta(date);
  if (!date || !meta) return fallback;
  return `${resolveLabel(meta.labelKey, translate)}/${date.getFullYear()}`;
}

/**
 * Chỉ lấy năm: yyyy
 * Ví dụ: 2026
 */
export function formatYear(
  value: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return String(date.getFullYear());
}

/**
 * Thứ trong tuần (song ngữ qua labelKey).
 * Truyền `translate` để ra text đã dịch; không truyền thì trả labelKey.
 * Ví dụ: formatDayOfWeek(date, key => i18n.instant(key)) → "Thứ 4" / "Wednesday"
 */
export function formatDayOfWeek(
  value: Date | string | number | null | undefined,
  translate?: TranslateFn,
  fallback = '-',
): string {
  const meta = getDayOfWeekMeta(value);
  if (!meta) return fallback;
  return resolveLabel(meta.labelKey, translate);
}

/**
 * Ngày + thứ (song ngữ).
 * Ví dụ: "Thứ 4, 12/08/2026" / "Wednesday, 12/08/2026"
 */
export function formatDateWithDayOfWeek(
  value: Date | string | number | null | undefined,
  translate?: TranslateFn,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${formatDayOfWeek(date, translate)}, ${formatDate(date)}`;
}

/**
 * Khoảng ngày: "12/08/2026 - 20/08/2026"
 */
export function formatDateRange(
  from: Date | string | number | null | undefined,
  to: Date | string | number | null | undefined,
  fallback = '-',
): string {
  const fromText = formatDate(from, '');
  const toText = formatDate(to, '');
  if (!fromText && !toText) return fallback;
  if (!fromText) return toText;
  if (!toText) return fromText;
  return `${fromText} - ${toText}`;
}

/**
 * Format tuỳ chỉnh bằng Intl (locale vi-VN mặc định).
 * options ví dụ: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
 */
export function formatDateCustom(
  value: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions,
  locale = 'vi-VN',
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat(locale, options).format(date);
}
