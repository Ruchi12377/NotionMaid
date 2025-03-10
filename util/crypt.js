import 'dotenv/config'
import crypto from 'crypto';

const salt = process.env.HASH_SALT || 'notion_maid_diam_noiton';
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);

export function hashServerId(serverId) {
    return crypto.scryptSync(serverId, salt, 32).toString("hex");
}

export function encrypt(text, encryptSalt) {
    // Derive a 32-byte key from the provided salt
    const key = crypto.scryptSync(encryptSalt, salt, 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(cipherText, decryptSalt) {
    const parts = cipherText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    // Derive a 32-byte key from the provided salt
    const key = crypto.scryptSync(decryptSalt, salt, 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}