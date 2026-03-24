// compress.js — Kompres folder/file ke format .zip
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * Mengompres folder atau file ke dalam arsip .zip.
 * @param {string} sourcePath  - Path folder atau file sumber
 * @param {string} outputPath  - Path output file .zip
 * @returns {Promise<string>}  - Ukuran file zip dalam MB
 */
export function compressToZip(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`📦 Kompresi selesai: ${sizeMB} MB`);
      resolve(sizeMB);
    });

    archive.on('error', reject);
    archive.pipe(output);

    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      archive.directory(sourcePath, path.basename(sourcePath));
    } else {
      archive.file(sourcePath, { name: path.basename(sourcePath) });
    }

    archive.finalize();
  });
}
