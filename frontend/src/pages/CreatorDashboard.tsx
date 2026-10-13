import { Link } from 'react-router-dom';
import MvpPage, { StatusNotice } from '../ui/components/MvpPage';

const actions = [
  { to: '/registration', icon: 'fingerprint', title: 'Register a file proof', body: 'Hash a selected file locally with BLAKE3 and submit an explicit Solana Devnet Memo transaction from your wallet.' },
  { to: '/wormgraph', icon: 'fact_check', title: 'Verify a Devnet proof', body: 'Retrieve a confirmed transaction, inspect its Arkhe Memo proof, and compare it with a locally selected file.' },
  { to: '/works', icon: 'travel_explore', title: 'Explore works', body: 'Read public works and run semantic text search when the Neon database is available.' },
  { to: '/royalties', icon: 'calculate', title: 'Calculate royalties', body: 'Model collaborator allocations with an exact 100% total. This does not create a payment.' },
];

export default function CreatorDashboard() {
  return (
    <MvpPage
      eyebrow="Arkhe · Hackathon MVP"
      title="Provenance, made inspectable"
      description="This interface distinguishes local calculations, real Solana Devnet confirmations, and services that are unavailable. No payment, copyright claim, C2PA verification, or database write is implied by this dashboard."
    >
      <StatusNotice tone="warning">
        The current registration path is a public Devnet Memo proof. It anchors an Arkhe proof payload after wallet approval; it is not a C2PA or legal authorship verification.
      </StatusNotice>
      <section className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link key={action.to} to={action.to} className="group rounded-xl border border-outline/25 bg-surface-container-low p-5 transition hover:border-tertiary/70 hover:bg-surface-container">
            <span className="material-symbols-outlined text-3xl text-tertiary" aria-hidden="true">{action.icon}</span>
            <h2 className="mt-4 text-lg font-semibold text-on-surface group-hover:text-primary">{action.title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{action.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </section>
      <section className="rounded-xl border border-outline/25 bg-surface-container-low p-5">
        <h2 className="text-lg font-semibold">MVP boundaries</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-on-surface-variant sm:grid-cols-2">
          <li>• File hashes are calculated in this browser with BLAKE3.</li>
          <li>• Wallet signatures are requested only by the user&apos;s installed wallet.</li>
          <li>• Devnet transaction data is read from the public Solana RPC.</li>
          <li>• Neon-backed works and semantic search remain unavailable until database access is restored.</li>
        </ul>
      </section>
    </MvpPage>
  );
}
