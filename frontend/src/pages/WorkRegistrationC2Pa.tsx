import { useState, type ChangeEvent } from 'react';
import { useDevnetWallet } from '../hooks/useDevnetWallet';
import { createArkheProof, hashFileWithBlake3 } from '../lib/solanaProof';
import { submitArkheMemoProof } from '../lib/solanaDevnet';
import MvpPage, { StatusNotice } from '../ui/components/MvpPage';

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WorkRegistrationC2Pa() {
  const { walletAvailable, address, network, connection, isConnecting, error: walletError, connect, disconnect } = useDevnetWallet();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setHash(null);
    setSignature(null);
    setError(null);
    if (!nextFile) return;

    setIsHashing(true);
    try {
      setHash(await hashFileWithBlake3(nextFile));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The file could not be hashed.');
    } finally {
      setIsHashing(false);
    }
  }

  async function connectWallet() {
    setError(null);
    try {
      await connect();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The wallet could not be connected.');
    }
  }

  async function registerProof() {
    if (!hash || !address) return;
    setError(null);
    setSignature(null);
    setIsSubmitting(true);
    try {
      const wallet = await connect();
      const proof = createArkheProof(hash, address);
      const verified = await submitArkheMemoProof(wallet, proof, connection);
      setSignature(verified.signature);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The Devnet proof could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MvpPage
      eyebrow="Solana Devnet · Memo proof v1"
      title="Register a file proof"
      description="Select a local file. Arkhe calculates its BLAKE3 digest in your browser, asks your wallet to sign a Devnet transaction, and verifies the confirmed Memo transaction before displaying its signature."
    >
      <StatusNotice tone="warning">
        This creates a public Devnet Memo only after you approve the wallet request. It does not store the file, create a database record, verify C2PA, mint a token, or settle royalties.
      </StatusNotice>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-xl border border-outline/25 bg-surface-container-low p-5">
          <label className="block text-sm font-semibold" htmlFor="work-file">File to hash</label>
          <input id="work-file" type="file" onChange={onFileChange} className="mt-3 block w-full rounded border border-outline/40 bg-surface-container-lowest p-3 text-sm" />
          {file && <p className="mt-3 text-sm text-on-surface-variant">Selected: <span className="font-mono text-on-surface">{file.name}</span> ({file.size.toLocaleString()} bytes)</p>}
          {isHashing && <p className="mt-3 text-sm text-on-surface-variant">Calculating BLAKE3 locally…</p>}
          {hash && <div className="mt-4 rounded-lg border border-tertiary/40 bg-surface-container-lowest p-4"><p className="text-xs font-semibold uppercase tracking-wider text-tertiary">BLAKE3-256 file digest</p><code className="mt-2 block break-all text-sm text-on-surface">{hash}</code></div>}
        </div>
        <aside className="rounded-xl border border-outline/25 bg-surface-container-low p-5">
          <h2 className="text-lg font-semibold">Wallet</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Network: <span className="font-semibold text-secondary">{network}</span></p>
          {!walletAvailable && <StatusNotice tone="warning">No injected Solana wallet was detected in this browser.</StatusNotice>}
          {address ? <><p className="mt-3 text-sm text-on-surface-variant">Connected: <span className="font-mono text-on-surface" title={address}>{shortAddress(address)}</span></p><button type="button" onClick={() => void disconnect()} className="mt-4 rounded border border-outline/40 px-3 py-2 text-sm font-semibold hover:bg-surface-container-high">Disconnect</button></> : <button type="button" disabled={!walletAvailable || isConnecting} onClick={() => void connectWallet()} className="mt-4 rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-50">{isConnecting ? 'Connecting…' : 'Connect wallet'}</button>}
        </aside>
      </section>
      {(error || walletError) && <StatusNotice tone="error">{error ?? walletError}</StatusNotice>}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline/25 bg-surface-container-low p-5">
        <div><h2 className="font-semibold">Submit Devnet proof</h2><p className="mt-1 text-sm text-on-surface-variant">Memo fields: version, BLAKE3 algorithm, file hash, and the connected wallet address.</p></div>
        <button type="button" onClick={() => void registerProof()} disabled={!hash || !address || isSubmitting} className="rounded bg-tertiary px-4 py-2 text-sm font-bold text-on-tertiary disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Awaiting Devnet confirmation…' : 'Sign & submit proof'}</button>
      </section>
      {signature && <StatusNotice tone="success">Devnet proof confirmed. Transaction signature: <a className="break-all underline" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer">{signature}</a></StatusNotice>}
    </MvpPage>
  );
}
