const { encrypt, decrypt, generateKey } = require('./index');

function usage() {
  console.error('Usage: node solcipher/cli.js <encrypt|decrypt|genkey> <key> <text>');
  process.exit(1);
}

const [,, mode, key, text] = process.argv;

if (mode === 'genkey') {
  // Generate a random 32-byte key and output as base64
  console.log(generateKey().toString('base64'));
  process.exit(0);
}

if (!mode || !key || !text) usage();

if (mode === 'encrypt') {
  console.log(encrypt(text, key));
} else if (mode === 'decrypt') {
  console.log(decrypt(text, key));
} else {
  usage();
}
