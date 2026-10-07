import { useState } from 'react';
import { useRoyalty } from '../hooks/useRoyalty';
import InclusionProofViewer from './InclusionProofViewer';
import { TAJ_MAHAL, DA_YA_THINK } from './demoData';

export default function RoyaltyLiquidation() {
  const { settleRoyalty, isProcessing } = useRoyalty();
  const [settledTx, setSettledTx] = useState<string | null>(null);

  const mockProof = {
    mmrRoot: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    leaf: TAJ_MAHAL.hashBlake3,
    path: ['d4e5f6...', '7a8b9c...']
  };

  const handleLiquidate = async () => {
    // 70% to Jorge Ben Jor for 1000 USDC total
    const tx = await settleRoyalty(700, "JorgeBenJorSolanaAddress...");
    setSettledTx(tx);
  };

  return (
    <div className="bg-surface-container p-6 rounded-lg border border-outline/20">
      <h2 className="text-xl font-bold mb-4">Liquidação de Royalties</h2>

      <div className="space-y-4 mb-6">
        <div className="text-sm">
          <p><span className="text-on-surface-variant">Obra:</span> {TAJ_MAHAL.title} ({TAJ_MAHAL.author})</p>
          <p><span className="text-on-surface-variant">Uso detectado:</span> {DA_YA_THINK.title} ({DA_YA_THINK.author})</p>
          <p><span className="text-on-surface-variant">Similaridade:</span> 94%</p>
        </div>

        <div className="p-4 bg-surface rounded border border-outline/30">
          <h3 className="font-bold mb-2">Split:</h3>
          <div className="flex justify-between items-center text-sm">
            <span>Jorge Ben Jor (70%)</span>
            <span className="font-mono text-xs text-on-surface-variant">→ [Endereço Solana]</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span>Rod Stewart (30%)</span>
            <span className="font-mono text-xs text-on-surface-variant">→ [Endereço Solana]</span>
          </div>
        </div>

        <div className="flex justify-between items-center font-bold text-lg">
          <span>Valor a Liquidar:</span>
          <span className="text-primary">1.000 USDC</span>
        </div>
      </div>

      {!settledTx ? (
        <button
          onClick={handleLiquidate}
          disabled={isProcessing}
          className="w-full py-3 bg-tertiary text-on-tertiary rounded font-bold disabled:opacity-50"
        >
          {isProcessing ? 'A Processar Transação...' : 'Liquidar Royalties'}
        </button>
      ) : (
        <div className="p-3 bg-success/20 text-success rounded text-center font-bold">
          Transação Confirmada!<br/>
          <span className="text-xs font-mono font-normal">TX: {settledTx.substring(0, 20)}...</span>
        </div>
      )}

      {settledTx && <InclusionProofViewer proof={mockProof} />}
    </div>
  );
}
