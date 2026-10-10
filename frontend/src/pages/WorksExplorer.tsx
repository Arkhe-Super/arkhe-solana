import { useEffect, useState, type FormEvent } from 'react';
import {
  ArkheApiError,
  getWorks,
  searchWorks,
  type SimilarWork,
  type Work,
} from '../lib/arkheApi';

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ArkheApiError ? error.message : fallback;
}

function truncate(value: string, length = 24): string {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export default function WorksExplorer() {
  const [works, setWorks] = useState<Work[]>([]);
  const [worksError, setWorksError] = useState<string | null>(null);
  const [isLoadingWorks, setIsLoadingWorks] = useState(true);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [matches, setMatches] = useState<SimilarWork[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function loadWorks() {
    setIsLoadingWorks(true);
    setWorksError(null);

    try {
      setWorks(await getWorks());
    } catch (error) {
      setWorksError(messageFor(error, 'Não foi possível carregar as obras cadastradas.'));
    } finally {
      setIsLoadingWorks(false);
    }
  }

  useEffect(() => {
    void loadWorks();
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setMatches(null);

    try {
      setMatches(await searchWorks(query, limit));
    } catch (error) {
      setSearchError(messageFor(error, 'Não foi possível pesquisar obras semelhantes.'));
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface p-6 sm:p-10 font-body-md">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="border-b border-outline/20 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-tertiary">Arkhe · dados reais</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Obras e busca semântica</h1>
          <p className="mt-3 max-w-3xl text-on-surface-variant">
            Consulte obras cadastradas no Neon e pesquise descrições textuais indexadas pelo backend.
            Esta busca não compara áudio nem substitui a demonstração de similaridade musical.
          </p>
        </header>

        <section className="rounded-lg border border-outline/20 bg-surface-container-low p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Obras cadastradas</h2>
              <p className="text-sm text-on-surface-variant">Leitura pública de <code>/api/works</code>.</p>
            </div>
            <button
              type="button"
              onClick={() => void loadWorks()}
              disabled={isLoadingWorks}
              className="rounded-md border border-primary/50 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingWorks ? 'Atualizando…' : 'Atualizar'}
            </button>
          </div>

          {worksError && <p className="mt-4 rounded-md bg-error/10 p-3 text-sm text-error">{worksError}</p>}
          {isLoadingWorks && <p className="mt-4 text-sm text-on-surface-variant">Carregando obras…</p>}
          {!isLoadingWorks && !worksError && works.length === 0 && (
            <p className="mt-4 text-sm text-on-surface-variant">Nenhuma obra cadastrada foi retornada pela API.</p>
          )}
          {!isLoadingWorks && works.length > 0 && (
            <ul className="mt-4 divide-y divide-outline/15 rounded-md border border-outline/20 bg-surface-container-lowest">
              {works.map((work) => (
                <li key={work.uuid} className="space-y-1 p-4 text-sm">
                  <p className="font-mono text-primary">{work.uuid}</p>
                  <p className="text-on-surface-variant">
                    BLAKE3: {work.blake3_hash ? truncate(work.blake3_hash, 40) : 'não informado'}
                  </p>
                  <p className="text-xs text-outline">Manifesto C2PA disponível: {Object.keys(work.c2pa_manifest).length > 0 ? 'sim' : 'não'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-outline/20 bg-surface-container-low p-5">
          <h2 className="text-xl font-semibold">Busca semântica textual</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Envia uma consulta ao endpoint público <code>/api/embeddings</code> com <code>action: search</code>.
          </p>

          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <label className="flex-1">
              <span className="sr-only">Texto da busca</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-md border border-outline/40 bg-surface-container-lowest px-3 py-2 text-on-surface outline-none focus:border-tertiary"
                placeholder="Ex.: obra sobre proveniência musical"
                maxLength={32000}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              Resultados
              <input
                type="number"
                min="1"
                max="100"
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="w-20 rounded-md border border-outline/40 bg-surface-container-lowest px-2 py-2 text-on-surface outline-none focus:border-tertiary"
              />
            </label>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="rounded-md bg-primary-container px-4 py-2 font-semibold text-on-primary-container hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSearching ? 'Pesquisando…' : 'Pesquisar'}
            </button>
          </form>

          {searchError && <p className="mt-4 rounded-md bg-error/10 p-3 text-sm text-error">{searchError}</p>}
          {isSearching && <p className="mt-4 text-sm text-on-surface-variant">Gerando consulta e pesquisando embeddings…</p>}
          {!isSearching && matches?.length === 0 && (
            <p className="mt-4 text-sm text-on-surface-variant">Nenhuma descrição semanticamente semelhante foi encontrada.</p>
          )}
          {!isSearching && matches && matches.length > 0 && (
            <ol className="mt-4 space-y-3">
              {matches.map((match) => (
                <li key={match.id} className="rounded-md border border-outline/20 bg-surface-container-lowest p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-mono text-sm text-primary">{match.work_uuid}</p>
                    <p className="text-sm text-secondary">Distância cosseno: {match.cosine_distance.toFixed(4)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-on-surface">{match.content_text}</p>
                  <p className="mt-2 text-xs text-outline">Modelo: {match.model}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
