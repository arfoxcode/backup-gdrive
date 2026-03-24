// backup.js — Orkestrasi proses backup utama
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';
import { authorize } from './auth.js';
import { compressToZip } from './compress.js';
import { uploadFile, rotateOldBackups } from './drive.js';

/**
 * Menjalankan satu siklus backup:
 * kompres → upload ke Drive → rotasi backup lama → hapus temp.
 * @returns {Promise<void>}
 */
export async function runBackup() {
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupName = `backup_${timestamp}.zip`;
  const tempZip    = path.join(CONFIG.backupDir, backupName);

  console.log('\n' + '═'.repeat(50));
  console.log(`🚀 Backup dimulai: ${new Date().toLocaleString('id-ID')}`);
  console.log('═'.repeat(50));

  try {
    // 1. Buat folder temp jika belum ada
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });

    // 2. Validasi folder sumber
    if (!fs.existsSync(CONFIG.sourcePath)) {
      throw new Error(`Folder sumber tidak ditemukan: ${CONFIG.sourcePath}`);
    }

    // 3. Kompres
    console.log(`📁 Sumber: ${path.resolve(CONFIG.sourcePath)}`);
    const sizeMB = await compressToZip(CONFIG.sourcePath, tempZip);

    // 4. Otorisasi & upload
    const auth     = await authorize();
    const uploaded = await uploadFile(auth, tempZip, backupName);

    // 5. Rotasi backup lama
    await rotateOldBackups(auth);

    // 6. Hapus file temp
    fs.unlinkSync(tempZip);
    console.log('🧹 File temp dihapus.');

    console.log('\n✅ Backup selesai!');
    console.log(`   📄 File   : ${uploaded.name}`);
    console.log(`   📦 Ukuran : ${sizeMB} MB`);
    console.log(`   🕐 Waktu  : ${new Date().toLocaleString('id-ID')}`);
    console.log('═'.repeat(50) + '\n');

  } catch (err) {
    console.error('\n❌ Backup gagal:', err.message);
    if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
  }
}
