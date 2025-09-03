import nacl from 'tweetnacl';
import { generateSymmetricKey, encryptFile, decryptFile, wrapKey, unwrapKey } from '../lib/crypto';

test('encrypt and decrypt flow', async () => {
  const message = new TextEncoder().encode('hello world');
  const key = generateSymmetricKey();
  const { iv, data } = await encryptFile(message.buffer, key);
  const decrypted = await decryptFile(data, key, iv);
  expect(new TextDecoder().decode(decrypted)).toBe('hello world');

  const sender = nacl.box.keyPair();
  const recipient = nacl.box.keyPair();
  const { nonce, wrapped } = wrapKey(key, recipient.publicKey, sender.secretKey);
  const unwrapped = unwrapKey(wrapped, nonce, sender.publicKey, recipient.secretKey);
  expect(Buffer.from(unwrapped)).toEqual(Buffer.from(key));
});
