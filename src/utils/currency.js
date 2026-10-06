/**
 * Format a numeric amount to Indonesian Rupiah representation.
 * Example: 1500000 -> "Rp 1.500.000"
 * 
 * @param {number|string} amount
 * @param {boolean} [withPrefix=true]
 * @returns {string}
 */
export function formatRupiah(amount, withPrefix = true) {
  const numericValue = typeof amount === 'number' ? amount : Number(amount) || 0;
  
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(Math.abs(numericValue));

  const prefix = withPrefix ? 'Rp ' : '';
  const sign = numericValue < 0 ? '-' : '';

  return `${sign}${prefix}${formatted}`;
}

/**
 * Parse an Indonesian currency string or number input into a clean positive integer.
 * Example: "Rp 1.500.000" or "1.500.000" -> 1500000
 * 
 * @param {string|number} value
 * @returns {number}
 */
export function parseRupiah(value) {
  if (typeof value === 'number') {
    return Math.max(0, isNaN(value) ? 0 : Math.round(value));
  }
  if (!value) return 0;
  
  // Strip everything that isn't a digit
  const cleanDigits = String(value).replace(/[^\d]/g, '');
  const parsed = parseInt(cleanDigits, 10);
  return isNaN(parsed) ? 0 : parsed;
}

