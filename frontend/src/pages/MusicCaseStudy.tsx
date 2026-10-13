import MvpPage, { StatusNotice } from '../ui/components/MvpPage';

export default function MusicCaseStudy() {
  return (
    <MvpPage eyebrow="Music case study · illustrative only" title="Similarity scenario" description="This screen preserves the original Arkhe case-study theme without presenting it as a real audio analysis or royalty settlement.">
      <StatusNotice tone="warning">No audio was analyzed here. No similarity score, infringement finding, royalty entitlement, C2PA assertion, or payment is produced by this MVP screen.</StatusNotice>
      <section className="rounded-xl border border-outline/25 bg-surface-container-low p-5"><h2 className="text-lg font-semibold">What the current MVP can demonstrate</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-on-surface-variant"><li>• A local BLAKE3 hash for a selected file.</li><li>• An explicit wallet-approved Memo proof confirmed on Solana Devnet.</li><li>• Independent comparison of that proof with the same selected file.</li><li>• A local, non-settlement royalty allocation calculation.</li></ul></section>
    </MvpPage>
  );
}
