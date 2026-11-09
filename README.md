# Website Undangan Pernikahan Digital: Arbian & Hima 💍

Website undangan pernikahan digital bertema **Jawa Klasik (Mahogany & Antique Gold)** yang mewah, responsif, dan interaktif untuk pernikahan **Mohamad Arbian Surya & Himmatul Qoyyimah**.

---

## ✨ Fitur Utama

1. **Cover / Sampul Pembuka Interaktif (3D Envelope & Card Reveal)**:
   - Amplop kerajaan 3D (*Royal Envelope*) di tengah layar lengkap dengan segil lilin emas (*Gold Wax Seal A&H*).
   - Animasi 3D membuka tutup amplop (*3D flap rotation*), kartu undangan naik perlahan dengan efek fade-in dan scale-up.
   - **Nama Tamu Dinamis (Custom URL Parameter)**:
     - Contoh: `index.html?to=Himaaa`
     - Contoh: `index.html?to=Bapak+Joko+Sekeluarga`
   - Tombol **"Buka Undangan"** dengan animasi kilau emas, membuka kunci scroll, dan langsung memutar musik latar romantis dengan transisi smooth reveal.

2. **Hero & Countdown Timer**:
   - Hitung mundur live (Hari, Jam, Menit, Detik) menuju **Minggu, 29 November 2026 pukul 08:00 WIB** dengan efek smooth digit pop transition.
   - Cinematic slow zoom / Ken Burns pada foto kedua mempelai dan parallax scroll halus.
   - Efek kemilau teks kaligrafi emas (*gold shimmer animation*) pada nama mempelai.
   - Tombol **"Simpan di Kalender"** langsung terhubung ke Google Calendar.

3. **Ayat Suci & Doa**:
   - Kaligrafi Bismillah dan Surah **Ar-Rum : 21** beserta teks Arab dan terjemahan bahasa Indonesia.

4. **Profil Kedua Mempelai**:
   - Mempelai Pria: **Mohamad Arbian Surya** (Putra ke-4 Bapak Bambang Hermanto & Ibu Endang Sri Wahyuni).
   - Mempelai Wanita: **Himmatul Qoyyimah** (Putri ke-2 Bapak Imam Kanafi & Ibu Aminatun) beserta tautan Instagram `@himatulqyh_`.

5. **Rangkaian Acara (Akad Nikah & Resepsi)**:
   - Akad: Minggu, 29 November 2026, 08.00 WIB - Selesai.
   - Resepsi: Minggu, 29 November 2026, 09.00 WIB - Selesai.
   - Lokasi: Kediaman Mempelai Wanita (Ds. Pulerejo, Kec. Ngantru, Kab. Tulungagung).
   - Tombol langsung menuju **Google Maps** (https://maps.app.goo.gl/2wm3C3V9qRDMbkJR9).

6. **Galeri Foto Interaktif**:
   - Menampilkan 5 foto mempelai dengan efek reveal mask dan zoom hover halus.
   - **Lightbox Modal**: Tampilan foto layar penuh dengan animasi zoom-in dan navigasi keyboard.

7. **Tanda Kasih / Amplop Digital & Kado Fisik**:
   - Desain kartu ATM mewah BCA: **0482678643** a.n. **Himmatul Qoyyimah**.
   - Tombol **"Salin No. Rekening"** dengan notifikasi toast otomatis.
   - Opsi pengiriman kado fisik ke alamat Tulungagung dengan tombol **"Salin Alamat"**.

8. **RSVP & Buku Tamu dengan Database Text (db.js - Tanpa SQLite)**:
   - Form konfirmasi kehadiran (Hadir, Tidak Hadir, Masih Ragu) + jumlah tamu + ucapan doa restu.
   - Seluruh data tersimpan dalam bentuk text / JSON di file `db.js`.
   - Efek ledakan konfeti (*celebration confetti*) saat ucapan berhasil dikirim.
   - Sinkronisasi instan ke feed ucapan dan penghitung otomatis.

9. **🔐 Admin Dashboard & Generator Undangan Personal**:
    - **Halaman Login Admin**: Akses di URL `/login`.
      - Username: `imaa`
      - Password: `imaa123`
    - **Dashboard Admin**: Akses di URL `/admin` (terproteksi server-side auth cookie).
    - **Statistik RSVP**: Menampilkan Total Tamu Hadir, rincian kehadiran (Hadir / Tidak / Ragu), dan Total Undangan Personal.
    - **Daftar Tamu RSVP**: Tabel lengkap nama tamu, status konfirmasi, jumlah orang hadir, pesan ucapan, dan tanggal.
    - **Pembuat Undangan Personal**: Masukkan nama tamu (misal: *Andi* atau *Bapak Joko & Keluarga*), sistem otomatis membuat link unik `/undangan/andi`.
    - **Tombol WhatsApp & Salin**: Salin tautan atau bagikan langsung via WhatsApp dengan format undangan resmi.
    - **Tampilan Tamu**: Nama tamu otomatis tampil di sampul depan (*"Kepada Yth. Bapak/Ibu/Saudara/i: Andi"*) dan terisi otomatis pada form RSVP tanpa resiko tertukar.
    - **Fitur Logout**: Mengakhiri sesi aman dan mengembalikan admin ke `/login`.

10. **Animasi Dekoratif Mewah (Luxury Romantic Editorial)**:
    - **Partikel Melayang**: Taburan kilau emas (*sparkles*) dan kelopak bunga melati (*jasmine petals*) melayang lembut di latar belakang.
    - **Floating Notes**: Not balok musik (♪, ♫) mengambang dari pemutar piringan hitam vinyl saat musik aktif.
    - **Denyut Ornamen**: Ikon ornamen pembatas berdenyut lembut seperti detak jantung (*heartbeat pulse*).

---

## 📁 Struktur Direktori

```
d:\undg\
│
├── index.html                  # File utama undangan pernikahan
├── login.html                  # Halaman Login Admin (/login)
├── admin.html                  # Dashboard Admin (/admin)
├── server.js                   # Web server, proteksi sesi, REST API & routing
├── db.js                       # Database TEXT / JSON (RSVP & Undangan Tamu)
├── package.json                # Konfigurasi npm script (npm start)
├── README.md                   # Dokumentasi lengkap
│
└── assets\
    ├── css\
    │   └── style.css           # Tema warna Mahogany, Gold, animasi & layout
    ├── js\
    │   ├── db.js               # Client-side Database Engine
    │   └── main.js             # Engine interaktif (audio, countdown, RSVP, modal)
    ├── audio\
    │   └── song.mp3            # Musik latar (dapat diganti kapan saja)
    └── images\
        ├── couple-1.jpg        # Foto busana modern (berdiri)
        ├── couple-2.jpg        # Foto busana modern (saling tatap)
        ├── couple-3.jpg        # Foto busana modern (duduk)
        ├── couple-jawa-1.jpg   # Foto adat Jawa (bersama payung)
        ├── couple-jawa-2.jpg   # Foto adat Jawa (duduk)
        ├── groom-avatar.jpg    # Avatar khusus mempelai pria
        └── bride-avatar.jpg    # Avatar khusus mempelai wanita
```

---

## 🚀 Cara Menjalankan & Membuka

### Pilihan 1: Jalankan dengan Database Server Node.js (Disarankan)
1. Buka terminal / PowerShell di folder ini (`d:\undg`).
2. Jalankan perintah:
   ```bash
   npm start
   # atau: node server.js
   ```
3. Akses URL:
   - 💍 **Website Undangan**: `http://localhost:3445`
   - 🔐 **Login Admin**: `http://localhost:3445/login`
     - Username: `imaa`
     - Password: `imaa123`
   - 📊 **Dashboard Admin**: `http://localhost:3445/admin` (otomatis diarahkan setelah login)
   - 💌 **Undangan Tamu Khusus**: `http://localhost:3445/undangan/andi`
4. Seluruh ucapan RSVP dan data undangan personal akan langsung tersimpan permanen dalam format teks ke dalam file `db.js`.

### Pilihan 2: Buka Langsung File HTML di Browser
1. Cukup klik dua kali file `index.html` untuk membuka di Google Chrome / Microsoft Edge / Safari / Firefox.
2. Ucapan akan otomatis tersimpan ke dalam penyimpanan peramban lokal.

### Pilihan 3: Uji Coba dengan Parameter Nama Tamu
- `http://localhost:3445/?to=Himaaa`
- `http://localhost:3445/?to=Bapak+Joko+Sekeluarga`

### Pilihan 4: Deploy ke Internet & Sinkronisasi Cloud Antar-HP
- **GitHub Pages / Netlify / Vercel**: Upload isi folder ke GitHub / Netlify.
- **Firebase Realtime Database (Multi-Device)**: Buka `assets/js/db.js`, isi `firebaseUrl` dengan URL database Firebase Anda (contoh: `https://proyek-anda-default-rtdb.firebaseio.com`). Dengan opsi ini, semua tamu yang membuka undangan lewat WhatsApp di HP masing-masing akan melihat ucapan yang saling tersinkronisasi secara real-time!
