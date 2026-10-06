import Dexie from 'dexie';

export const db = new Dexie('FinoraDB');

// Define database schema
db.version(1).stores({
  transactions: '++id, type, category, date, createdAt'
});

export const DEFAULT_INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'Freelance',
  'Investasi',
  'Lainnya'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Tagihan',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya'
];

// Color palette mapping for categories (tasteful, distinct, high accessibility)
export const CATEGORY_COLORS = {
  Makanan: '#f97316',      // Warm orange
  Transportasi: '#0284c7', // Sky blue
  Tagihan: '#ef4444',      // Soft red
  Belanja: '#8b5cf6',      // Purple
  Hiburan: '#ec4899',      // Pink
  Kesehatan: '#14b8a6',    // Teal
  Pendidikan: '#6366f1',   // Indigo
  Gaji: '#10b981',         // Emerald
  Bonus: '#06b6d4',        // Cyan
  Freelance: '#3b82f6',    // Blue
  Investasi: '#84cc16',    // Lime
  Lainnya: '#64748b'       // Slate gray
};
