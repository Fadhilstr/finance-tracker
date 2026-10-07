# Persfin — Personal Finance

Web pencatatan dan pemantauan keuangan pribadi yang berjalan **100% di browser/client-side (offline-first)**.

## Fitur Utama

- **100% Client-Side & Offline-First:** Menggunakan Dexie.js dan IndexedDB, data tersimpan aman di browser tanpa server atau backend eksternal.
- **Ringkasan Finansial Real-time:** Menampilkan total saldo, total pemasukan, dan total pengeluaran dengan format Rupiah (`Rp`).
- **Pie Chart Pengeluaran:** Visualisasi komposisi pengeluaran per kategori yang otomatis diperbarui secara reaktif menggunakan Chart.js.
- **Pencatatan Transaksi:** Tambah dan edit transaksi pemasukan dan pengeluaran dengan validasi instan.
- **Filter Cepat:** Filter transaksi berdasarkan bulan dan tipe (Semua, Pemasukan, Pengeluaran).
- **Hapus Transaksi dengan Dialog Konfirmasi:** Mencegah penghapusan tidak sengaja dengan konfirmasi yang jelas.
- **Cadangan Data (Export/Import JSON):** Unduh berkas cadangan JSON dan pulihkan kapan saja.
- **Responsif & Aksesibel:** Nyaman digunakan di desktop, tablet, maupun ponsel dengan navigasi sentuh dan kontras tinggi.

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Database Lokal:** Dexie.js (IndexedDB)
- **Visualisasi Chart:** Chart.js
- **Styling:** Tailwind CSS
- **Ikon:** Lucide Vue Next

## Cara Menjalankan

```bash
# Instalasi dependensi
npm install

# Menjalankan development server
npm run dev

# Menjalankan unit test
npm test

# Build untuk produksi (Vercel / static hosting)
npm run build
```

## Deployment ke Vercel

Aplikasi ini siap di-deploy langsung ke Vercel:
1. Hubungkan repository ke Vercel.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

