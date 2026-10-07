import { useState } from 'react';
import { useBlake3 } from '../hooks/useBlake3';
import { useC2PA } from '../hooks/useC2PA';
import { useRoyalty } from '../hooks/useRoyalty';
import { TAJ_MAHAL, DA_YA_THINK } from './demoData';

interface Props {
  onRegistered: (work: any) => void;
}

export default function WorkRegistrationForm({ onRegistered }: Props) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>('');

  const { calculateHash, isHashing } = useBlake3();
  const { verifyAsset, isVerifying } = useC2PA();
  const { anchorRecord, isProcessing } = useRoyalty();

  const handleDemoSelect = (work: typeof TAJ_MAHAL) => {
    setTitle(work.title);
    setAuthor(work.author);
    setYear(work.year.toString());
    const mockFile = new File(["dummy content"], work.audioFile, { type: "audio/mp3" });
    setFile(mockFile);
    setHash(work.hashBlake3);
  };

  const handleRegister = async () => {
    if (!file || !title || !author || !year) return;

    // Process mock files
    const calculatedHash = await calculateHash(file);
    setHash(calculatedHash);

    await verifyAsset(file);

    const tx = await anchorRecord(calculatedHash, `ipfs://metadata/${title}`);

    onRegistered({
      title, author, year, hash: calculatedHash, tx
    });
  };

  return (
    <div className="bg-surface-container p-6 rounded-lg border border-outline/20">
      <h2 className="text-xl font-bold mb-4">Registar Obra</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleDemoSelect(TAJ_MAHAL)}
          className="px-3 py-1 bg-primary/20 text-primary rounded-md hover:bg-primary/30"
        >
          Carregar "Taj Mahal"
        </button>
        <button
          onClick={() => handleDemoSelect(DA_YA_THINK)}
          className="px-3 py-1 bg-secondary/20 text-secondary rounded-md hover:bg-secondary/30"
        >
          Carregar "Da Ya Think..."
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-surface rounded border border-outline/30"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Autor</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2 bg-surface rounded border border-outline/30"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Ano</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 bg-surface rounded border border-outline/30"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Áudio</label>
          <div className="p-2 bg-surface rounded border border-outline/30 text-sm text-on-surface-variant flex items-center gap-2">
            <span>📁 {file ? file.name : "Selecionar ficheiro"}</span>
          </div>
        </div>

        {hash && (
          <div className="p-3 bg-surface-container-high rounded text-sm font-mono overflow-x-auto">
            Hash BLAKE3: {hash.substring(0, 16)}...{hash.substring(hash.length - 8)}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={!file || isHashing || isVerifying || isProcessing}
          className="w-full py-2 bg-primary text-on-primary rounded font-bold disabled:opacity-50 mt-4"
        >
          {isHashing ? 'A Calcular Hash...' :
           isVerifying ? 'A Verificar C2PA...' :
           isProcessing ? 'A Ancorar...' :
           'Registar no WormGraph'}
        </button>
      </div>
    </div>
  );
}
