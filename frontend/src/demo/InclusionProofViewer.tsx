

interface Props {
  proof: {
    mmrRoot: string;
    leaf: string;
    path: string[];
  } | null;
}

export default function InclusionProofViewer({ proof }: Props) {
  if (!proof) return null;

  return (
    <div className="bg-surface-container-high p-4 rounded-lg border border-outline/30 mt-4">
      <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
        <span className="text-success">✓</span> Prova de Inclusão MMR Válida
      </h3>

      <div className="space-y-2 text-xs font-mono text-on-surface-variant overflow-x-auto">
        <div>
          <span className="text-primary">MMR Root:</span> {proof.mmrRoot}
        </div>
        <div>
          <span className="text-secondary">Leaf:</span> {proof.leaf}
        </div>
        <div>
          <span className="text-tertiary">Path:</span> [{proof.path.map(p => p.substring(0,8)+'...').join(', ')}]
        </div>
      </div>
    </div>
  );
}
