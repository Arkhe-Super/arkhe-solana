import { NavLink, useLocation } from 'react-router-dom';

const navigationItems = [
  { to: '/creator', label: 'Painel' },
  { to: '/works', label: 'Obras reais' },
  { to: '/registration', label: 'Registro (demo)' },
  { to: '/wormgraph', label: 'Proveniência (demo)' },
  { to: '/royalties', label: 'Royalties (demo)' },
  { to: '/demo', label: 'Caso musical' },
];

export default function ApplicationNavigation() {
  const { pathname } = useLocation();
  const usesLiveApi = pathname === '/works';

  return (
    <div className="fixed bottom-12 left-3 z-[60] flex max-w-[calc(100vw-1.5rem)] flex-col items-start gap-2">
      {!usesLiveApi && (
        <p className="rounded border border-amber-300/30 bg-surface-container-lowest/95 px-3 py-2 text-xs text-amber-200 shadow-lg backdrop-blur">
          Interface demonstrativa: sem transação Solana, pagamento ou atestação em tempo real.
        </p>
      )}
      <details className="group rounded border border-outline-variant/50 bg-surface-container-lowest/95 text-on-surface shadow-lg backdrop-blur">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-semibold marker:content-none">
          <span className="material-symbols-outlined text-base" aria-hidden="true">menu</span>
          Navegar
        </summary>
        <nav aria-label="Navegação principal" className="flex min-w-48 flex-col border-t border-outline-variant/30 p-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </details>
    </div>
  );
}
