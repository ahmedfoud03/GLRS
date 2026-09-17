// Date and Time utilities for Greenland International Hospital (Yemen Timezone: UTC+3)

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

/**
 * Returns today's date in local hospital time (YYYY-MM-DD format)
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string into a rich Arabic presentation
 * e.g., "السبت، 6 سبتمبر 2026"
 */
export const formatArabicDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dayName = ARABIC_DAYS[d.getDay()];
    const dayNum = d.getDate();
    const monthName = ARABIC_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}، ${dayNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Formats a timestamp into Arabic time
 * e.g., "08:30 ص" or "09:15 م"
 */
export const formatArabicTime = (timeStr?: string | null): string => {
  if (!timeStr) return '—';
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  } catch {
    return timeStr;
  }
};

/**
 * Formats a date into standard numeric DD/MM/YYYY format
 * e.g., "17/09/2026"
 */
export const formatNumericDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const clean = String(dateStr).trim();
    const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(clean);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Formats full date and time using numeric DD/MM/YYYY format
 * e.g., "17/09/2026 - 08:30 ص"
 */
export const formatArabicDateTime = (dateTimeStr?: string | null): string => {
  if (!dateTimeStr) return '—';
  return `${formatNumericDate(dateTimeStr)} - ${formatArabicTime(dateTimeStr)}`;
};

/**
 * Formats relative time (e.g. "منذ 15 دقيقة", "منذ ساعتين")
 */
export const formatRelativeArabicTime = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'الآن';
    if (diffMin === 1) return 'منذ دقيقة واحدة';
    if (diffMin === 2) return 'منذ دقيقتين';
    if (diffMin < 11) return `منذ ${diffMin} دقائق`;
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHours === 1) return 'منذ ساعة واحدة';
    if (diffHours === 2) return 'منذ ساعتين';
    if (diffHours < 11) return `منذ ${diffHours} ساعات`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays === 2) return 'منذ يومين';
    if (diffDays < 11) return `منذ ${diffDays} أيام`;
    return formatArabicDate(dateStr);
  } catch {
    return dateStr;
  }
};
