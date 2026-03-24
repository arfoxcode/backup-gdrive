// drive.js — Upload file dan rotasi backup di Google Drive
import { google } from 'googleapis';
import fs from 'fs';
import { CONFIG } from './config.js';

/**
 * Mengupload file ke Google Drive.
 * @param {import('googleapis').Auth.OAuth2Client} auth
 * @param {string} filePath  - Path file lokal yang akan diupload
 * @param {string} fileName  - Nama file di Google Drive
 * @returns {Promise<{id: string, name: string, size: string}>}
 */
export async function uploadFile(auth, filePath, fileName) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    ...(CONFIG.gdriveFolderId && { parents: [CONFIG.gdriveFolderId] }),
  };

  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(filePath),
  };

  console.log(`☁️  Mengupload ${fileName} ke Google Drive...`);

  const { data } = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, name, size',
  });

  console.log(`✅ Upload sukses! File ID: ${data.id}`);
  return data;
}

/**
 * Menghapus backup lama jika jumlahnya melebihi CONFIG.maxBackups.
 * File diurutkan dari yang paling lama → paling baru.
 * @param {import('googleapis').Auth.OAuth2Client} auth
 */
export async function rotateOldBackups(auth) {
  if (!CONFIG.gdriveFolderId) return;

  const drive = google.drive({ version: 'v3', auth });

  const { data } = await drive.files.list({
    q: `'${CONFIG.gdriveFolderId}' in parents
        and name contains 'backup_'
        and trashed = false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime asc',
  });

  const files  = data.files ?? [];
  const excess = files.length - CONFIG.maxBackups;

  if (excess > 0) {
    console.log(`🗑️  Menghapus ${excess} backup lama...`);
    for (let i = 0; i < excess; i++) {
      await drive.files.delete({ fileId: files[i].id });
      console.log(`   ❌ Dihapus: ${files[i].name}`);
    }
  }
}
