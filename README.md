# 📚 Aplikasi Pemesanan Buku Online Sederhana
> **Proyek Ujian Tengah Semester (UTS) - Pemrograman Web 1**

Aplikasi web berbasis sisi klien (client-side) murni untuk pemesanan buku online, pengelolaan stok katalog buku, dan pelacakan pengiriman (Delivery Order). Dibuat menggunakan **HTML5, CSS3, dan JavaScript murni (Vanilla JS)** tanpa backend atau database eksternal.

---

## 🗂️ Struktur Proyek

```
tugas-uts-web1/
│
├── css/
│   └── style.css            # Satu file CSS terpusat dan responsif untuk seluruh halaman
│
├── img/                     # Berkas gambar cover buku katalog
│   ├── kepemimpinan.jpg
│   ├── manajemen_keuangan.jpg
│   ├── mikrobiologi.jpg
│   ├── paud_perkembangan.jpeg / .jpg
│   └── pengantar_komunikasi.jpg
│
├── js/
│   ├── data.js              # Sumber data utama (dataPengguna, dataKatalogBuku, dataTracking)
│   └── script.js            # Logika dinamis: autentikasi, stok, cart, checkout & tracking
│
├── login.html               # Halaman autentikasi login pengguna & admin
├── dashboard.html           # Halaman utama, ringkasan statistik & pusat navigasi
├── stok.html                # Halaman katalog dinamis & fitur tambah stok buku
├── checkout.html            # Halaman daftar pesanan & formulir pengiriman pembeli
├── tracking.html            # Halaman pelacakan pengiriman berdasarkan nomor DO
└── README.md                # Dokumentasi proyek aplikasi
```

---

## 🚀 Fitur-Fitur Utama

### 1. Autentikasi Pengguna (`login.html`)
- Validasi data pengguna berdasarkan array `dataPengguna` pada `js/data.js`.
- Proteksi form terhadap kolom kosong dan format email yang tidak valid.
- Tombol **Quick-Fill Demo Account** untuk mempermudah pengujian dosen/penilai.
- Penyimpanan sesi aktif pengguna dengan status role (*User* atau *Admin*).

### 2. Dashboard Aplikasi (`dashboard.html`)
- Sapaan dinamis sesuai akun pengguna yang sedang login.
- Ringkasan statistik sistem:
  - Total Judul Buku
  - Total Stok Tersedia
  - Jumlah Pengguna Terdaftar
  - Jumlah Nomor DO Pelacakan Aktif
- **Pusat Navigasi**: Kartu menu cepat yang menghubungkan ke semua halaman aplikasi (`stok.html`, `checkout.html`, `tracking.html`, dan logout ke `login.html`).
- Rekomendasi buku pilihan dengan aksi langsung pesan ke keranjang.

### 3. Katalog & Manajemen Stok (`stok.html`)
- Menampilkan data buku secara dinamis dari `dataKatalogBuku`.
- Menampilkan cover buku asli dari folder `img/`, kode buku, jenis, edisi, harga, dan sisa stok.
- **Fitur Tambah Stok**:
  - Tombol tambah stok langsung pada setiap item buku.
  - Modal form tambah stok cepat dengan validasi input angka positif.
- **Pencarian Real-Time**: Menyaring katalog berdasarkan judul buku, kode, atau jenis.
- **Pilihan Tampilan (View Switcher)**: Mode Kartu (*Card Grid*) atau Mode Tabel (*Table View*).

### 4. Pemesanan & Checkout (`checkout.html`)
- **Daftar Pesanan**:
  - Menampilkan buku pesanan, thumbnail, harga, kontrol kuantitas (`+` / `-`), dan tombol hapus item.
  - Dropdown penambahan buku lain langsung ke keranjang.
  - Perhitungan otomatis subtotal, biaya ekspedisi/ongkir, dan total pembayaran.
- **Formulir Pembeli**:
  - Input nama lengkap, email, nomor HP/WhatsApp, dan alamat pengiriman.
  - Pilihan jasa ekspedisi (JNE, Pos Indonesia, SiCepat, J&T).
  - Pilihan metode pembayaran (Transfer Bank, E-Wallet, COD).
  - Validasi menyeluruh terhadap kelengkapan dan format isian form.
- **Konfirmasi Pesanan**:
  - Otomatis mengurangi kuantitas stok buku yang dipesan.
  - Mengenerate nomor Delivery Order (DO) unik (contoh: `2026xxxx`).
  - Menyimpan riwayat pelacakan baru dan membuka modal sukses dengan tombol langsung lacak pengiriman.

### 5. Pelacakan Pengiriman / Tracking DO (`tracking.html`)
- Menggunakan data dari `dataTracking` dan pesanan baru hasil checkout.
- Kotak pencarian nomor Delivery Order (DO).
- Tombol cepat untuk menguji nomor DO default (`20230012` dan `20230013`).
- Menampilkan detail DO: nama penerima, ekspedisi, status (badge warna), tanggal kirim, kode paket, dan total biaya.
- **Visual Timeline**: Riwayat perjalanan paket step-by-step secara kronologis.
- Mendukung pembacaan parameter URL otomatis (contoh: `tracking.html?do=20230012`).

---

## 🔑 Data Pengujian (Demo Accounts & Tracking)

### Akun Pengguna (`dataPengguna`):
| Nama Pengguna | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Rina Wulandari** | `rina@gmail.com` | `rina123` | User |
| **Agus Pranoto** | `agus@gmail.com` | `agus123` | User |
| **Siti Marlina** | `siti@gmail.com` | `siti123` | Admin |

### Contoh Nomor DO (`dataTracking`):
- `20230012` : Rina Wulandari (Status: *Dalam Perjalanan*)
- `20230013` : Agus Pranoto (Status: *Dikirim / Selesai*)

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini tidak membutuhkan instalasi web server (seperti Apache/PHP/Node.js) karena murni berbasis sisi klien (*Client-Side Static Web*):

1. Pastikan seluruh folder proyek telah diunduh/diekstrak.
2. Buka berkas **`login.html`** langsung menggunakan web browser apa saja (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Anda dapat langsung menguji alur login menggunakan tombol demo yang tersedia pada form login.
4. Nikmati navigasi antar-halaman yang saling terhubung secara mulus.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Semantik dokumen web standar (`header`, `main`, `footer`, form controls).
- **CSS3**: Layouting modern menggunakan Flexbox dan CSS Grid, variabel CSS (`:root`), transisi, dan responsif terhadap perangkat bergerak (*Mobile-Friendly*).
- **JavaScript (ES6 / Vanilla)**: Manipulasi DOM murni, event handling, validasi formulir, dan manajemen data browser (`localStorage` / `sessionStorage`).

---

*Disusun untuk pemenuhan tugas Ujian Tengah Semester (UTS) mata kuliah Pemrograman Web 1.*

