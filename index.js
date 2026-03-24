// index.js — Entry point
import cron from 'node-cron';
import { CONFIG } from './src/config.js';
import { authorize } from './src/auth.js';
import { runBackup } from './src/backup.js';

const [,, ...args] = process.argv;

if (args.includes('--auth')) {
  // ── Hanya otorisasi Google Drive ──
  await authorize();
  console.log('✅ Otorisasi selesai!');
  process.exit(0);

} else if (args.includes('--now')) {
  // ── Backup sekali langsung ──
  await runBackup();
  process.exit(0);

} else {
  // ── Mode terjadwal (cron) ──
  console.log(`⏰ Jadwal  : "${CONFIG.cronSchedule}"`);
  console.log(`📁 Sumber  : ${CONFIG.sourcePath}`);
  console.log(`🔢 Max     : ${CONFIG.maxBackups} backup`);
  console.log('💡 Tip: gunakan --now untuk backup manual\n');

  cron.schedule(CONFIG.cronSchedule, runBackup, {
    timezone: 'Asia/Jakarta',
  });

  // Backup pertama langsung saat startup
  console.log('▶️  Menjalankan backup pertama...');
  await runBackup();
}
