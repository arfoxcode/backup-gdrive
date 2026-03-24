// auth.js — Otorisasi Google OAuth2
import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';
import { CONFIG, SCOPES } from './config.js';

/**
 * Membaca credentials dan mengembalikan OAuth2 client yang sudah terotorisasi.
 * Jika token belum ada, akan meminta otorisasi via browser.
 * @returns {Promise<import('googleapis').Auth.OAuth2Client>}
 */
export async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CONFIG.credentialsPath, 'utf8'));
  const { client_secret, client_id, redirect_uris } =
    credentials.installed ?? credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(CONFIG.tokenPath)) {
    const token = JSON.parse(fs.readFileSync(CONFIG.tokenPath, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  return getNewToken(oAuth2Client);
}

/**
 * Meminta token baru via URL otorisasi dan menyimpannya ke file.
 * @param {import('googleapis').Auth.OAuth2Client} oAuth2Client
 * @returns {Promise<import('googleapis').Auth.OAuth2Client>}
 */
function getNewToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n🔑 Buka URL ini di browser untuk otorisasi:\n');
    console.log(authUrl);
    console.log();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Masukkan kode otorisasi: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject(err);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(CONFIG.tokenPath, JSON.stringify(token, null, 2));
        console.log('✅ Token tersimpan di', CONFIG.tokenPath);
        resolve(oAuth2Client);
      });
    });
  });
}
