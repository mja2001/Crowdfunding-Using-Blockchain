import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';
import { create } from 'ipfs-http-client';
import nacl from 'tweetnacl';
import idl from '../lib/idl/solcipher.json';
import { generateSymmetricKey, encryptFile, wrapKey } from '../lib/crypto';

export const FileShare = () => {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleShare = async () => {
    if (!publicKey || !file || !signTransaction) return;
    const provider = new AnchorProvider(new web3.Connection('https://api.devnet.solana.com'), { publicKey, signTransaction, signMessage } as any, {});
    const program = new Program(idl as any, new PublicKey('SoLCipheR111111111111111111111111111111111'), provider);

    const data = await file.arrayBuffer();
    const key = generateSymmetricKey();
    const { iv, data: encrypted } = await encryptFile(data, key);
    const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
    const added = await ipfs.add(encrypted);

    const recipientPk = new PublicKey(recipient);
    const seed = signMessage ? await signMessage(new TextEncoder().encode('solcipher')) : nacl.randomBytes(32);
    const kp = nacl.box.keyPair.fromSecretKey(seed.slice(0,32) as any);
    const { nonce, wrapped } = wrapKey(key, recipientPk.toBytes(), kp.secretKey);
    const encryptedKey = Array.from([...nonce, ...wrapped]);

    const fileAccount = Keypair.generate();
    await program.methods
      .shareFile(recipientPk, encryptedKey, added.path, Array.from(iv))
      .accounts({
        sender: publicKey,
        file: fileAccount.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([fileAccount])
      .rpc();

    setStatus('Shared CID: ' + added.path);
  };

  return (
    <div>
      <h2>Share File</h2>
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input type="text" placeholder="Recipient public key" value={recipient} onChange={e => setRecipient(e.target.value)} />
      <button onClick={handleShare} disabled={!publicKey}>Share</button>
      <p>{status}</p>
    </div>
  );
};
