const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

/**
 * Generate a random 32-byte key suitable for AES-256-GCM encryption.
 * @returns {Buffer}
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Derive a 32-byte key from either a passphrase or a raw key buffer. When a
 * passphrase is used, PBKDF2 with a random salt is applied and the salt is
 * returned so it can be stored with the ciphertext. When a raw key buffer is
 * provided, it is used directly and a zero-filled salt is returned.
 *
 * @param {Buffer|string} key - Buffer key or passphrase string
 * @param {Buffer} [salt] - Optional salt used for derivation (for decryption)
 * @returns {{key: Buffer, salt: Buffer}}
 */
function deriveKey(key, salt) {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH) throw new Error('Key must be 32 bytes');
    return { key, salt: salt || Buffer.alloc(SALT_LENGTH) };
  }
  const usedSalt = salt || crypto.randomBytes(SALT_LENGTH);
  const derived = crypto.pbkdf2Sync(String(key), usedSalt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  return { key: derived, salt: usedSalt };
}

/**
 * Encrypt a UTF-8 string using AES-256-GCM. The output contains the salt,
 * initialization vector, auth tag, and ciphertext all concatenated and encoded
 * in base64 so it can be easily stored or transmitted.
 *
 * @param {string} plaintext - Data to encrypt
 * @param {Buffer|string} key - Encryption key or passphrase
 * @returns {string} base64 encoded payload
 */
function encrypt(plaintext, key) {
  const { key: derivedKey, salt } = deriveKey(key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store salt + iv + tag + ciphertext in a single buffer
  return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
}

/**
 * Decrypt a payload produced by {@link encrypt}.
 *
 * @param {string} payload - base64 encoded payload
 * @param {Buffer|string} key - Key or passphrase used during encryption
 * @returns {string} decrypted UTF-8 string
 */
function decrypt(payload, key) {
  const data = Buffer.from(String(payload), 'base64');
  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + 16);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH + 16);
  const { key: derivedKey } = deriveKey(key, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

module.exports = { encrypt, decrypt, generateKey };
