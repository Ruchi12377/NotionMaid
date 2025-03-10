import 'dotenv/config'
import sqlite3 from 'sqlite3';
import { decrypt, encrypt, hashServerId } from './crypt.js';

const db = new sqlite3.Database('notion_maid.db');

export function setupDb() {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS notionConfig (serverId TEXT PRIMARY KEY, notionPageId TEXT)');
    });
}

export function closeDb() {
    db.close();
}

export function insertNotionConfig(serverId, notionPageId) {
    const hashedServerId = hashServerId(serverId);
    const encryptedNotionPageId = encrypt(notionPageId, serverId);
    console.log(encryptedNotionPageId)

    db.run(
        `INSERT INTO notionConfig (serverId, notionPageId)
         VALUES (?, ?)
         ON CONFLICT(serverId) DO UPDATE
         SET notionPageId = excluded.notionPageId`,
        [hashedServerId, encryptedNotionPageId],
        (err) => {
            if (err) console.error(err);
        }
    );
}

export function deleteNotionConfig(serverId) {
    db.run(
        'DELETE FROM notionConfig WHERE serverId = ?',
        [serverId],
        (err) => {
            if (err) console.error(err);
        }
    );
}

export function getNotionPageIdByServerId(serverId) {
    const hashedServerId = hashServerId(serverId);

    return new Promise((resolve, reject) => {
        db.get(
            'SELECT notionPageId FROM notionConfig WHERE serverId = ?',
            [hashedServerId],
            (err, row) => {
                if (err) reject(err);
                else resolve(row ? decrypt(row.notionPageId, serverId) : null);
            }
        );
    });
}