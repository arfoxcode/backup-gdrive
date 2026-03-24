# 📦 Backup Otomatis ke Google Drive

Program Node.js untuk backup file/folder lokal ke Google Drive secara otomatis dengan jadwal cron.

---

## ✨ Fitur

| | Fitur |
|---|---|
| 📁 | Backup file atau folder lokal |
| ☁️ | Upload otomatis ke Google Drive |
| 🗜️ | Kompres ke format `.zip` sebelum upload |
| ⏰ | Jadwal otomatis menggunakan cron |
| 🔄 | Rotasi otomatis — hapus backup lama jika melebihi batas |
| 🕐 | Timezone Asia/Jakarta |

---

## 📂 Struktur Project

```
backup-gdrive/
├── index.js              ← entry point + cron scheduler
├── package.json          ← "type": "module" (ES Module)
├── .env                  ← konfigurasi (buat dari .env.example)
├── .env.example          ← template konfigurasi
├── credentials.json      ← dari Google Cloud Console
├── token.json            ← dibuat otomatis saat otorisasi
├── temp_backups/         ← folder sementara (otomatis dibuat)
└── src/
    ├── config.js         ← semua variabel konfigurasi & env
    ├── auth.js           ← otorisasi Google OAuth2
    ├── compress.js       ← kompresi folder/file → .zip
    ├── drive.js          ← upload & rotasi file di Google Drive
    └── backup.js         ← orkestrasi proses backup utama
```

> **Catatan:** Project ini menggunakan **ES Module** (`import`/`export`).
> Membutuhkan Node.js versi **18 atau lebih baru**.

---

## 🚀 Cara Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Siapkan Google Cloud Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru (atau gunakan yang ada)
3. Aktifkan **Google Drive API**
   - Pergi ke **APIs & Services → Library**
   - Cari `Google Drive API` → klik **Enable**
4. Buat credentials OAuth 2.0
   - Pergi ke **APIs & Services → Credentials**
   - Klik **Create Credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Klik **Create**
5. Download credentials → simpan sebagai `credentials.json` di root folder project

### 3. Konfigurasi `.env`

```bash
cp .env.example .env
```

Lalu edit file `.env`, isi minimal:

```env
BACKUP_SOURCE=./data           # folder yang ingin di-backup
GDRIVE_FOLDER_ID=1A2B3C...     # ID folder Google Drive tujuan
CRON_SCHEDULE=0 2 * * *        # jadwal backup (setiap hari jam 02:00)
```

> **Cara dapat Folder ID:** buka folder di Google Drive → lihat URL →
> ambil bagian setelah `/folders/`
> Contoh: `https://drive.google.com/drive/folders/`**`1A2B3C4D5E6F`**

### 4. Otorisasi Google Drive

Jalankan sekali untuk login ke akun Google:

```bash
npm run auth
```

Program menampilkan URL → buka di browser → login → salin kode otorisasi → paste di terminal.
Token disimpan otomatis di `token.json`.

---

## ▶️ Menjalankan Program

| Perintah | Fungsi |
|----------|--------|
| `npm start` | Mode terjadwal — berjalan terus sesuai jadwal cron |
| `npm run backup` | Backup manual — jalankan sekali langsung |
| `npm run auth` | Otorisasi Google Drive (hanya perlu sekali) |

---

## 📅 Format Jadwal Cron

```
┌──────── menit      (0–59)
│  ┌───── jam        (0–23)
│  │  ┌── hari bulan (1–31)
│  │  │  ┌─ bulan    (1–12)
│  │  │  │  ┌ hari minggu (0–7, 0=Minggu)
│  │  │  │  │
*  *  *  *  *
```

| Nilai `CRON_SCHEDULE` | Arti |
|-----------------------|------|
| `0 2 * * *` | Setiap hari jam 02:00 |
| `0 */6 * * *` | Setiap 6 jam sekali |
| `0 9 * * 1` | Setiap Senin jam 09:00 |
| `*/30 * * * *` | Setiap 30 menit |
| `0 0 1 * *` | Setiap tanggal 1 jam 00:00 |

---

## 🔒 Keamanan

Pastikan file-file berikut **tidak** di-commit ke Git (sudah tercantum di `.gitignore`):

```
.env
credentials.json
token.json
temp_backups/
```

---

## 🛠️ Troubleshooting

**`credentials.json` tidak ditemukan**
→ Download dari Google Cloud Console dan letakkan di root folder project.

**Token expired / invalid**
→ Hapus `token.json`, lalu jalankan `npm run auth` lagi.

**Folder sumber tidak ditemukan**
→ Periksa nilai `BACKUP_SOURCE` di file `.env`.

**Error saat import modul**
→ Pastikan Node.js versi ≥ 18 dengan menjalankan `node --version`.
