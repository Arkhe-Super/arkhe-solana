import { useMemo, useState } from 'react';
import { calculateRoyaltyAllocations, isValidRoyaltySplit, totalRoyaltyPercentage, type RoyaltyCollaborator } from '../lib/royaltyCalculator';
import MvpPage, { StatusNotice } from '../ui/components/MvpPage';

function nextId() { return crypto.randomUUID(); }

export default function RoyaltiesSolanaBlinks() {
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USDC');
  const [collaborators, setCollaborators] = useState<RoyaltyCollaborator[]>([
    { id: nextId(), name: 'Primary creator', percentage: 100 },
  ]);
  const numericAmount = Number(amount);
  const total = totalRoyaltyPercentage(collaborators);
  const valid = isValidRoyaltySplit(collaborators);
  const allocations = useMemo(() => calculateRoyaltyAllocations(Number.isFinite(numericAmount) ? numericAmount : 0, collaborators), [numericAmount, collaborators]);

  function update(id: string, field: 'name' | 'percentage', value: string) {
    setCollaborators((current) => current.map((collaborator) => collaborator.id === id ? { ...collaborator, [field]: field === 'percentage' ? Number(value) : value } : collaborator));
  }

  return (
    <MvpPage eyebrow="Royalty allocation · local calculator" title="Calculate a royalty split" description="Define a notional amount and collaborator shares. Calculations run locally in your browser and enforce an exact 100% allocation before presenting results.">
      <StatusNotice tone="warning">Simulation only: Arkhe will not send a payment, create a Solana transaction, transfer a token, or store these allocations.</StatusNotice>
      <section className="rounded-xl border border-outline/25 bg-surface-container-low p-5">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Notional amount<input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 block w-full rounded border border-outline/40 bg-surface-container-lowest px-3 py-2 text-on-surface" /></label><label className="text-sm font-semibold">Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-2 block w-full rounded border border-outline/40 bg-surface-container-lowest px-3 py-2 text-on-surface"><option>USDC</option><option>SOL</option><option>USD</option></select></label></div>
        <div className="mt-6 space-y-3"><div className="flex items-center justify-between"><h2 className="font-semibold">Collaborators</h2><button type="button" onClick={() => setCollaborators((current) => [...current, { id: nextId(), name: '', percentage: 0 }])} className="rounded border border-primary/50 px-3 py-1.5 text-sm font-semibold text-primary">Add collaborator</button></div>{collaborators.map((collaborator) => <div key={collaborator.id} className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]"><input aria-label="Collaborator name" value={collaborator.name} onChange={(event) => update(collaborator.id, 'name', event.target.value)} placeholder="Name or wallet label" className="rounded border border-outline/40 bg-surface-container-lowest px-3 py-2" /><input aria-label="Collaborator percentage" type="number" min="0" max="100" step="0.01" value={collaborator.percentage} onChange={(event) => update(collaborator.id, 'percentage', event.target.value)} className="rounded border border-outline/40 bg-surface-container-lowest px-3 py-2" /><button type="button" disabled={collaborators.length === 1} onClick={() => setCollaborators((current) => current.filter((entry) => entry.id !== collaborator.id))} className="rounded px-3 py-2 text-sm text-error disabled:opacity-40">Remove</button></div>)}</div>
      </section>
      <section className="rounded-xl border border-outline/25 bg-surface-container-low p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">Allocation result</h2><span className={valid ? 'font-semibold text-secondary' : 'font-semibold text-error'}>Total: {total.toFixed(2)}%</span></div>{!valid && <p className="mt-3 text-sm text-error">Each collaborator needs a name and the total must equal exactly 100%.</p>}<ul className="mt-4 divide-y divide-outline/20 rounded border border-outline/20 bg-surface-container-lowest">{allocations.map((allocation) => <li key={allocation.id} className="flex justify-between gap-3 p-3 text-sm"><span>{allocation.name || 'Unnamed collaborator'} · {allocation.percentage.toFixed(2)}%</span><strong>{allocation.amount.toFixed(2)} {currency}</strong></li>)}</ul></section>
    </MvpPage>
  );
}
