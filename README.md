# SolCipher Wallet

SolCipher Wallet is a Solana-based encrypted file-sharing wallet. Files are encrypted client-side and stored on IPFS while only minimal metadata is kept on-chain.

## Structure

```
/programs/solcipher  - Anchor program storing file metadata
/client               - Next.js frontend
/client/components    - React components (WalletProvider, FileShare, FileReceive)
/scripts              - Helper scripts
```

## Setup

### Install dependencies
```bash
cd client
npm install
```

### Run unit tests
```bash
npm test
```

### Develop
```bash
npm run dev
```

### Deploy program to devnet
```bash
../scripts/deploy-devnet.sh
```

### Troubleshooting
If `npm install` fails when fetching scoped Solana packages or if `jest` is not found:

1. Clear the npm cache and retry:
   ```bash
   npm cache clean --force
   npm install
   ```
2. If behind a proxy, configure the npm registry:
   ```bash
   npm config set registry http://registry.npmjs.org/
   npm install
   ```
3. Ensure npm is up to date or try using Yarn if problems persist.

## Workflow
1. Connect a Solana wallet (Phantom, Solflare).
2. Select a file to share. The file is encrypted with AES-256-GCM and uploaded to IPFS.
3. The symmetric key is wrapped with `nacl.box` using the recipient's public key and stored on-chain with the IPFS CID and IV.
4. Recipients fetch metadata from the chain, unwrap the key with their wallet and decrypt the file fetched from IPFS.

## Disclaimer
Do not commit private keys. Wallet adapters handle all signing. This project targets deployment on Vercel (frontend) and Solana devnet/mainnet for programs.
