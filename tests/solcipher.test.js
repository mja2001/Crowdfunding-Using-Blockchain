const assert = require('assert');
const { encrypt, decrypt, generateKey } = require('../solcipher');

const message = 'Hello, SolCipher!';

// Test using passphrase
const passphrase = 'sample-key';
const encryptedPass = encrypt(message, passphrase);
const decryptedPass = decrypt(encryptedPass, passphrase);
assert.strictEqual(decryptedPass, message, 'Passphrase round-trip failed');

// Test using generated key
const key = generateKey();
const encryptedKey = encrypt(message, key);
const decryptedKey = decrypt(encryptedKey, key);
assert.strictEqual(decryptedKey, message, 'Key round-trip failed');

// Ensure ciphertext differs between two encryptions
assert.notStrictEqual(encryptedPass, encrypt(message, passphrase), 'Ciphertext should differ due to random salt/IV');

console.log('All SolCipher tests passed');
