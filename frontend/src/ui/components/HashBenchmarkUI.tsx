import { useState } from 'react';
import { computeHash } from '../../gpu/hash';

export default function HashBenchmarkUI() {
  const [dataSize, setDataSize] = useState<number>(1024 * 1024 * 10); // 10MB default
  const [results, setResults] = useState<{ backend: string; timeMs: number; hashHex: string }[]>([]);
  const [isHashing, setIsHashing] = useState(false);

  const runBenchmark = async () => {
    setIsHashing(true);

    try {
      // Generate random data
      const data = new Uint8Array(dataSize);
      crypto.getRandomValues(new Uint8Array(data.buffer, 0, Math.min(65536, dataSize)));
      // Copy pattern to fill rest
      for (let i = 65536; i < dataSize; i += 65536) {
        const copyLen = Math.min(65536, dataSize - i);
        data.set(data.subarray(0, copyLen), i);
      }

      // We don't have a noble-hashes JS implementation set up yet so we just run the main computeHash
      // which will auto-detect backend
      const result = await computeHash(data);

      const hashHex = Array.from(result.hash)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setResults(prev => [...prev, {
        backend: result.backend,
        timeMs: result.timeMs,
        hashHex: hashHex.substring(0, 16) + '...'
      }]);

    } catch (e) {
      console.error(e);
      alert("Error running benchmark");
    } finally {
      setIsHashing(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">WebGPU BLAKE3 Hashing (Fase 0 POC)</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Size: {Math.round(dataSize / 1024 / 1024)} MB
        </label>
        <input
          type="range"
          min={1024 * 1024}
          max={1024 * 1024 * 100}
          step={1024 * 1024}
          value={dataSize}
          onChange={e => setDataSize(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={runBenchmark}
        disabled={isHashing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isHashing ? 'Hashing...' : 'Run Benchmark'}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (ms)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash (Prefix)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Throughput (MB/s)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.backend}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.timeMs.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{r.hashHex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((dataSize / 1024 / 1024) / (r.timeMs / 1000)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
