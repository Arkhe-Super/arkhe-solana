import { useState } from 'react';
import { TAJ_MAHAL, DA_YA_THINK, SIMILARITY_RESULT } from './demoData';

interface Props {
  onSimilarityProven: () => void;
}

export default function SimilarityAnalyzer({ onSimilarityProven }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof SIMILARITY_RESULT | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult(SIMILARITY_RESULT);
    setAnalyzing(false);
  };

  return (
    <div className="bg-surface-container p-6 rounded-lg border border-outline/20">
      <h2 className="text-xl font-bold mb-4">Análise de Similaridade</h2>

      <div className="flex flex-col gap-4 mb-6">
        <div className="p-3 bg-surface rounded border border-outline/30 flex justify-between items-center">
          <div>
            <div className="font-bold">{TAJ_MAHAL.title} ({TAJ_MAHAL.year})</div>
            <div className="text-sm text-on-surface-variant font-mono">
              Fingerprint: [{TAJ_MAHAL.fingerprint.join(', ')}]
            </div>
          </div>
        </div>

        {result && (
          <div className="flex justify-center items-center -my-2 z-10">
            <div className={`px-4 py-1 rounded-full font-bold text-sm ${
              result.score > 0.9 ? 'bg-error/20 text-error' : 'bg-success/20 text-success'
            }`}>
              {result.score > 0.9 && '⚠️ ALTA '}
              Similaridade: {(result.score * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div className="p-3 bg-surface rounded border border-outline/30 flex justify-between items-center">
          <div>
            <div className="font-bold">{DA_YA_THINK.title} ({DA_YA_THINK.year})</div>
            <div className="text-sm text-on-surface-variant font-mono">
              Fingerprint: [{DA_YA_THINK.fingerprint.join(', ')}]
            </div>
          </div>
        </div>
      </div>

      {!result ? (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full py-2 bg-secondary text-on-secondary rounded font-bold disabled:opacity-50"
        >
          {analyzing ? 'A Analisar...' : 'Comparar Obras'}
        </button>
      ) : (
        <button
          onClick={onSimilarityProven}
          className="w-full py-2 bg-primary text-on-primary rounded font-bold"
        >
          Gerar Prova de Similaridade
        </button>
      )}
    </div>
  );
}
