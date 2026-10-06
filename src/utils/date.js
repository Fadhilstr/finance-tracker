const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format a YYYY-MM-DD date string to Indonesian readable format.
 * Example: "2026-10-06" -> "06 Okt 2026"
 * 
 * @param {string|Date} dateInput
 * @param {boolean} [fullMonth=false]
 * @returns {string}
 */
export function formatDateIndo(dateInput, fullMonth = false) {
  if (!dateInput) return '-';
  
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  const monthName = fullMonth ? MONTH_NAMES_ID[monthIdx] : MONTH_SHORT_ID[monthIdx];
  return `${day} ${monthName} ${year}`;
}

/**
 * Get current date as "YYYY-MM-DD" in local time.
 * @returns {string}
 */
export function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month as "YYYY-MM".
 * @returns {string}
 */
export function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Convert "YYYY-MM" to "Bulan Tahun" (e.g., "2026-10" -> "Oktober 2026").
 * @param {string} yearMonth
 * @returns {string}
 */
export function formatMonthYearIndo(yearMonth) {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${MONTH_NAMES_ID[monthIdx]} ${year}`;
  }
  return yearMonth;
}

