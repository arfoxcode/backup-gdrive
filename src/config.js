// config.js — Konfigurasi terpusat
import 'dotenv/config';

export const CONFIG = {
  sourcePath:      process.env.BACKUP_SOURCE    || './data',
  backupDir:       process.env.BACKUP_TEMP      || './temp_backups',
  gdriveFolderId:  process.env.GDRIVE_FOLDER_ID || '',
  cronSchedule:    process.env.CRON_SCHEDULE    || '0 2 * * *',
  maxBackups:      parseInt(process.env.MAX_BACKUPS || '7'),
  credentialsPath: process.env.CREDENTIALS_PATH || './credentials.json',
  tokenPath:       process.env.TOKEN_PATH       || './token.json',
};

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
