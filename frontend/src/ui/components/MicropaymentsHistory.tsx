import type { ReactNode } from "react";

export default function MicropaymentsHistory({ children }: { children: ReactNode }) {
  return (
    <section className="bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/30 rounded p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-outline-variant/20 mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg" data-icon="payments">payments</span>
              Histórico de Micropagamentos HTTP x402 de Agentes de IA (Pay.sh Rails)
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-label-sm font-label-sm uppercase">TOKEN-2022 HOOK</span>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">Cobrança e liquidação em milissegundos via streaming para inferência de modelos e uso de obras</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-surface-container border border-outline-variant/30 text-code-sm font-code-sm text-on-surface hover:border-tertiary transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs" data-icon="sync">sync</span>
            <span>Live Ingest</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-code-sm text-code-sm">
          <thead>
            <tr className="border-b border-outline-variant/30 text-outline uppercase font-label-md text-label-md">
              <th className="py-2.5 px-3">Agente / Client ID</th>
              <th className="py-2.5 px-3">Obra Solicitada (BLAKE3 Digest)</th>
              <th className="py-2.5 px-3">Protocol Header</th>
              <th className="py-2.5 px-3">Valor Liquidado</th>
              <th className="py-2.5 px-3">Solana Signature</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15 text-on-surface">
            {children}
          </tbody>
        </table>
      </div>
    </section>
  );
}
