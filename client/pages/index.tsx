import { FileShare } from '../components/FileShare';
import { FileReceive } from '../components/FileReceive';
import { WalletProvider } from '../components/WalletProvider';

export default function Home() {
  return (
    <WalletProvider>
      <main>
        <h1>SolCipher Wallet</h1>
        <FileShare />
        <FileReceive />
      </main>
    </WalletProvider>
  );
}
