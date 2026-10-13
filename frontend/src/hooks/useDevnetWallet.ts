import { useCallback, useMemo, useState } from 'react';
import {
  getDevnetConnection,
  getInjectedWallet,
  type BrowserWallet,
} from '../lib/solanaDevnet';

export function useDevnetWallet() {
  const wallet = useMemo(() => getInjectedWallet(), []);
  const [address, setAddress] = useState<string | null>(() => wallet?.publicKey?.toBase58() ?? null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (): Promise<BrowserWallet> => {
    const provider = getInjectedWallet();
    if (!provider) {
      const message = 'No Solana wallet was detected. Install or unlock a wallet that supports Devnet, then try again.';
      setError(message);
      throw new Error(message);
    }

    setIsConnecting(true);
    setError(null);
    try {
      const result = await provider.connect();
      setAddress(result.publicKey.toBase58());
      return provider;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The wallet connection was declined or failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const provider = getInjectedWallet();
    setError(null);
    try {
      await provider?.disconnect?.();
      setAddress(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The wallet could not disconnect.';
      setError(message);
    }
  }, []);

  return {
    walletAvailable: Boolean(wallet),
    address,
    network: 'Solana Devnet',
    connection: getDevnetConnection(),
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
