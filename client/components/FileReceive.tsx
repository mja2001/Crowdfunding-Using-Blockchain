import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { create } from 'ipfs-http-client';
import nacl from 'tweetnacl';
import idl from '../lib/idl/solcipher.json';
import { unwrapKey, decryptFile } from '../lib/crypto';

export const FileReceive = () => {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const [fileAccount, setFileAccount] = useState('');
  const [content, setContent] = useState('');

  const handleFetch = async () => {
    if (!publicKey || !signTransaction) return;
    const provider = new AnchorProvider(new web3.Connection('https://api.devnet.solana.com'), { publicKey, signTransaction, signMessage } as any, {});
    const program = new Program(idl as any, new PublicKey('SoLCipheR111111111111111111111111111111111'), provider);
    const account: any = await program.account.fileMetadata.fetch(new PublicKey(fileAccount));

    const encryptedKey: Uint8Array = account.encryptedKey as Uint8Array;
    const nonce = encryptedKey.slice(0,24);
    const wrapped = encryptedKey.slice(24);
    const seed = signMessage ? await signMessage(new TextEncoder().encode('solcipher')) : nacl.randomBytes(32);
    const kp = nacl.box.keyPair.fromSecretKey(seed.slice(0,32) as any);
    const key = unwrapKey(wrapped, nonce, kp.publicKey, kp.secretKey);

    const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
    const chunks: Uint8Array[] = [];
    for await (const chunk of ipfs.cat(account.cid)) {
      chunks.push(chunk as Uint8Array);
    }
    const encryptedData = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
    let offset = 0;
    chunks.forEach(c => { encryptedData.set(c, offset); offset += c.length; });

    const decrypted = await decryptFile(encryptedData, key, new Uint8Array(account.iv));
    setContent(new TextDecoder().decode(decrypted));
  };

  return (
    <div>
      <h2>Receive File</h2>
      <input type="text" placeholder="File account" value={fileAccount} onChange={e => setFileAccount(e.target.value)} />
      <button onClick={handleFetch} disabled={!publicKey}>Fetch</button>
      <pre>{content}</pre>
    </div>
  );
};
