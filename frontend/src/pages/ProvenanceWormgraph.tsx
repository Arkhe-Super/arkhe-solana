import { useState, type ChangeEvent, type FormEvent } from 'react';
import { hashFileWithBlake3 } from '../lib/solanaProof';
import { verifyArkheMemoProof, getDevnetConnection, type VerifiedArkheTransaction } from '../lib/solanaDevnet';
import MvpPage, { StatusNotice } from '../ui/components/MvpPage';

export default function ProvenanceWormgraph() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifiedArkheTransaction | null>(null);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setHash(null);
    setResult(null);
    setError(null);
    if (!nextFile) return;

    setIsHashing(true);
    try {
      setHash(await hashFileWithBlake3(nextFile));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The selected file could not be hashed.');
    } finally {
      setIsHashing(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hash) return;
    setIsVerifying(true);
    setError(null);
    setResult(null);
    try {
      setResult(await verifyArkheMemoProof(signature.trim(), hash, getDevnetConnection()));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The Devnet proof could not be verified.');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <MvpPage
      eyebrow="Solana Devnet · independent read"
      title="Verify a file proof"
      description="Choose the original file and paste a Devnet transaction signature. Arkhe recalculates the local BLAKE3 digest, reads the confirmed transaction from Solana Devnet, and validates the Memo payload and signer relationship."
    >
      <StatusNotice tone="warning">
        A successful result proves only that a confirmed Devnet transaction contains the expected Arkhe Memo proof for this file hash. It does not establish copyright, authorship, C2PA validity, or a persistent Neon record.
      </StatusNotice>
      <form onSubmit={verify} className="rounded-xl border border-outline/25 bg-surface-container-low p-5">
        <label className="block text-sm font-semibold" htmlFor="verify-file">Original file</label>
        <input id="verify-file" type="file" onChange={selectFile} className="mt-3 block w-full rounded border border-outline/40 bg-surface-container-lowest p-3 text-sm" />
        {file && <p className="mt-2 text-sm text-on-surface-variant">Selected: {file.name}</p>}
        {isHashing && <p className="mt-2 text-sm text-on-surface-variant">Calculating BLAKE3 locally…</p>}
        {hash && <code className="mt-3 block break-all rounded border border-outline/25 bg-surface-container-lowest p-3 text-sm">{hash}</code>}
        <label className="mt-5 block text-sm font-semibold" htmlFor="signature">Devnet transaction signature</label>
        <input id="signature" required value={signature} onChange={(event) => setSignature(event.target.value)} className="mt-2 w-full rounded border border-outline/40 bg-surface-container-lowest px-3 py-2 font-mono text-sm outline-none focus:border-tertiary" placeholder="Paste a Solana Devnet transaction signature" />
        <button type="submit" disabled={!hash || isVerifying} className="mt-4 rounded bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:cursor-not-allowed disabled:opacity-50">{isVerifying ? 'Checking Devnet…' : 'Verify proof'}</button>
      </form>
      {error && <StatusNotice tone="error">{error}</StatusNotice>}
      {result && <section className="rounded-xl border border-secondary/40 bg-secondary/10 p-5"><h2 className="text-lg font-semibold text-secondary">Proof verified on Devnet</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-on-surface-variant">Confirmation</dt><dd className="font-semibold">{result.confirmation}</dd></div><div><dt className="text-on-surface-variant">Slot</dt><dd className="font-mono">{result.slot}</dd></div><div className="sm:col-span-2"><dt className="text-on-surface-variant">Wallet / fee payer</dt><dd className="break-all font-mono">{result.proof.wallet}</dd></div><div className="sm:col-span-2"><dt className="text-on-surface-variant">Proof version</dt><dd>{result.proof.version} · {result.proof.hashAlgorithm}</dd></div></dl><a className="mt-4 inline-block text-sm font-semibold underline" href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`} target="_blank" rel="noreferrer">Open confirmed transaction in Solana Explorer</a></section>}
    </MvpPage>
  );
}
