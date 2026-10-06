import { useEffect, useState } from 'react';
import HashBenchmarkUI from '../components/HashBenchmarkUI';
import { detectBackend } from '../../gpu/backend';
import { Link } from "react-router-dom";

export default function WebGPUBenchmarkPage() {
  const [backend, setBackend] = useState<string>('detecting...');

  useEffect(() => {
    detectBackend().then(setBackend);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Arkhe WebGPU WebApp</h1>
            <p className="text-xl text-gray-600 mt-2">Fase 0: BLAKE3 Hashing POC</p>
          </div>
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </header>

        <div className="mb-6 p-4 rounded bg-blue-50 text-blue-800 border border-blue-200">
          <h2 className="font-semibold text-lg">System Status</h2>
          <p>Detected Backend Capability: <strong>{backend}</strong></p>
          {backend === 'webgpu' ? (
            <p className="text-sm mt-1">✓ WebGPU is fully supported on your device.</p>
          ) : (
            <p className="text-sm mt-1">
              ⚠️ WebGPU not detected. Falling back to {backend === 'wasm' ? 'WebAssembly' : 'JavaScript'}.
            </p>
          )}
        </div>

        <HashBenchmarkUI />
      </div>
    </div>
  );
}
