import { Buffer } from 'buffer';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  type Commitment,
} from '@solana/web3.js';
import {
  type ArkheProof,
  memoDataToProof,
  parseArkheProof,
  serializeArkheProof,
} from './solanaProof';

export const DEVNET_RPC_URL = clusterApiUrl('devnet');
export const SOLANA_DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export type BrowserWallet = {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
  signAndSendTransaction: (transaction: Transaction, connection: Connection) => Promise<{ signature: string } | string>;
};

export type VerifiedArkheTransaction = {
  proof: ArkheProof;
  signature: string;
  confirmation: 'confirmed' | 'finalized';
  slot: number;
};

export function getDevnetConnection(commitment: Commitment = 'confirmed'): Connection {
  return new Connection(DEVNET_RPC_URL, commitment);
}

export function getInjectedWallet(): BrowserWallet | null {
  if (typeof window === 'undefined') return null;
  const candidate = window as typeof window & {
    phantom?: { solana?: BrowserWallet };
    solana?: BrowserWallet;
  };
  return candidate.phantom?.solana ?? candidate.solana ?? null;
}

export async function assertDevnet(connection: Connection): Promise<void> {
  const genesisHash = await connection.getGenesisHash();
  if (genesisHash !== SOLANA_DEVNET_GENESIS_HASH) {
    throw new Error('The configured RPC endpoint is not Solana Devnet.');
  }
}

export async function submitArkheMemoProof(
  wallet: BrowserWallet,
  proof: ArkheProof,
  connection = getDevnetConnection(),
): Promise<VerifiedArkheTransaction> {
  if (!wallet.publicKey) throw new Error('Connect a wallet before registering a proof.');
  if (wallet.publicKey.toBase58() !== proof.wallet) {
    throw new Error('The proof wallet does not match the connected wallet.');
  }

  await assertDevnet(connection);
  const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  const transaction = new Transaction({
    feePayer: wallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
  }).add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(serializeArkheProof(proof), 'utf8'),
    }),
  );

  const submitted = await wallet.signAndSendTransaction(transaction, connection);
  const signature = typeof submitted === 'string' ? submitted : submitted.signature;
  if (!signature) throw new Error('The wallet did not return a transaction signature.');

  const confirmation = await connection.confirmTransaction(
    { signature, ...latestBlockhash },
    'confirmed',
  );
  if (confirmation.value.err) throw new Error('The Devnet transaction failed.');

  return verifyArkheMemoProof(signature, proof.fileHash, connection);
}

function proofFromParsedInstruction(instruction: unknown): ArkheProof | null {
  if (!instruction || typeof instruction !== 'object') return null;
  const current = instruction as {
    programId?: PublicKey;
    parsed?: unknown;
    data?: string;
  };
  if (!current.programId?.equals(MEMO_PROGRAM_ID)) return null;

  if (typeof current.data === 'string') return memoDataToProof(current.data);
  if (typeof current.parsed === 'string') return parseArkheProof(current.parsed);
  if (current.parsed && typeof current.parsed === 'object' && 'memo' in current.parsed) {
    const memo = (current.parsed as { memo?: unknown }).memo;
    return typeof memo === 'string' ? parseArkheProof(memo) : null;
  }
  return null;
}

export async function verifyArkheMemoProof(
  signature: string,
  expectedFileHash: string,
  connection = getDevnetConnection(),
): Promise<VerifiedArkheTransaction> {
  if (!signature.trim()) throw new Error('Enter a transaction signature.');
  await assertDevnet(connection);

  const [status] = (await connection.getSignatureStatuses([signature], { searchTransactionHistory: true })).value;
  if (!status || status.err || (status.confirmationStatus !== 'confirmed' && status.confirmationStatus !== 'finalized')) {
    throw new Error('The transaction is not confirmed on Solana Devnet.');
  }

  const transaction = await connection.getParsedTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });
  if (!transaction || transaction.meta?.err) throw new Error('The transaction was not found or failed on Devnet.');

  const proof = transaction.transaction.message.instructions
    .map(proofFromParsedInstruction)
    .find((candidate): candidate is ArkheProof => candidate !== null);
  if (!proof) throw new Error('No valid Arkhe Memo proof was found in this transaction.');
  if (proof.fileHash !== expectedFileHash.toLowerCase()) {
    throw new Error('The selected file does not match the BLAKE3 hash recorded on-chain.');
  }

  const feePayer = transaction.transaction.message.accountKeys[0]?.pubkey.toBase58();
  if (feePayer !== proof.wallet) {
    throw new Error('The Memo proof wallet does not match the transaction fee payer.');
  }

  return {
    proof,
    signature,
    confirmation: status.confirmationStatus,
    slot: transaction.slot,
  };
}
