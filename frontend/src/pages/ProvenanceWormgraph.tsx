


import { useState, useEffect } from 'react';

const mockWormgraphData = {
  user: {
    avatarUrl: 'https://i.pravatar.cc/150?u=alice'
  },
  transactions: [
    {
      id: "0x00000010",
      source: "C2PA WASM Engine",
      action: "Assert JUMBF Root: urn:c2pa:claim_108",
      time: "1.24 ms",
      status: "VALID [OK]"
    },
    {
      id: "0x00000011",
      source: "Solana Devnet RPC",
      action: "Sign Tx: 8xPq11...Wz99Vb",
      time: "248 ms",
      status: "CONFIRMED"
    },
    {
      id: "0x00000012",
      source: "EVM Schema Registry",
      action: "Attest UID: 0x902a...f4a7c",
      time: "12.4 s",
      status: "PENDING (L1)"
    },
    {
      id: "0x00000013",
      source: "Wormhole Relayer",
      action: "Emit VAA: Hash 4a8b...1c2f",
      time: "2.1 s",
      status: "VERIFIED"
    }
  ],
  graphBlocks: [
    {
      id: "block1",
      title: "Content Origin",
      subtitle: "Creator Device App",
      icon: "smartphone",
      color: "border-on-surface",
      iconColor: "text-on-surface",
      lines: [
        "C2PA SDK v1.2",
        "Hardware Key: SEC_EL",
        "Signer: 0xAlice.sol"
      ]
    },
    {
      id: "block2",
      title: "WASM Bridge",
      subtitle: "WormGraph Node",
      icon: "memory",
      color: "border-primary",
      iconColor: "text-primary",
      lines: [
        "JUMBF Parser: OK",
        "BLAKE3: e3b0c442...",
        "Payload: 4.2 MB"
      ]
    },
    {
      id: "block3",
      title: "Solana Settlement",
      subtitle: "Arkhe Verifier Program",
      icon: "currency_bitcoin",
      color: "border-secondary",
      iconColor: "text-secondary",
      lines: [
        "PDA: 9g8P...21Wa",
        "Slot: 294029103",
        "Fee: 0.000005 SOL"
      ]
    },
    {
      id: "block4",
      title: "EAS Attestation",
      subtitle: "Cross-Chain Sync",
      icon: "link",
      color: "border-tertiary",
      iconColor: "text-tertiary",
      lines: [
        "Network: Base L2",
        "UID: 0x4f...8c",
        "Status: Indexed"
      ]
    }
  ],
  inspector: [
    { label: "Entity Resolution", value: "C2PA Claim #108_9A", isHighlight: false },
    { label: "Crypto Digest", value: "BLAKE3 (32-byte)", isHighlight: false },
    { label: "Digest Hash", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", isHighlight: true },
    { label: "WormGraph MMR Index", value: "849,201", isHighlight: false },
    { label: "Solana Program", value: "ArkH...vVerify", isHighlight: false },
    { label: "Timestamp", value: "2024-10-24T18:42:09Z", isHighlight: false }
  ]
};

export default function ProvenanceWormgraph() {
  const [data, setData] = useState<typeof mockWormgraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(mockWormgraphData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-error">
        <p className="text-xl font-bold">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (

    <div className="bg-surface text-on-surface antialiased dot-matrix min-h-screen selection:bg-primary-container selection:text-on-primary-container font-body-md overflow-x-hidden">
{/* TOP APP BAR (Shared Component: TopNavBar) */}
<header className="bg-surface-container-lowest/80 backdrop-blur-md dark:bg-surface-container-lowest/80 text-primary dark:text-primary docked full-width top-0 z-50 sticky border-b border-outline-variant/30 shadow-[0_0_24px_-4px_rgba(153,69,255,0.15)]">
<div className="w-full px-6 flex justify-between items-center h-14 border-b border-outline-variant/20">
{/* Brand & Protocol Architecture Logo */}
<div className="flex items-center gap-6">
<a className="text-headline-sm font-headline-sm font-bold tracking-tight text-on-surface dark:text-on-surface flex items-center gap-2 group" href="#dashboard">
<div className="w-7 h-7 rounded-sm bg-gradient-to-br from-primary-container via-surface-container-high to-tertiary flex items-center justify-center p-[1px] shadow-[0_0_12px_rgba(153,69,255,0.4)]">
<div className="w-full h-full bg-surface-container-lowest flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary text-lg" data-icon="deployed_code">deployed_code</span>
</div>
</div>
<span>ARKHE // PROTOCOL ARCHITECTURE</span>
</a>
{/* Desktop Navigation Clusters */}
<nav className="hidden md:flex items-center gap-5 ml-4 font-headline-sm text-headline-sm">
<a className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 hover:border-tertiary/50 hover:text-tertiary transition-colors duration-150" href="#architecture">Architecture</a>
<a className="text-tertiary border-b-2 border-tertiary font-semibold pb-1" href="#telemetry">Telemetry</a>
<a className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 hover:border-tertiary/50 hover:text-tertiary transition-colors duration-150" href="#inspectors">Inspectors</a>
<a className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 hover:border-tertiary/50 hover:text-tertiary transition-colors duration-150" href="#terminal">Terminal</a>
<a className="text-on-surface-variant hover:text-on-surface transition-colors pb-1 hover:border-tertiary/50 hover:text-tertiary transition-colors duration-150" href="#sdks">SDKs</a>
</nav>
</div>
{/* Trailing Action Clustered Tools */}
<div className="flex items-center gap-3">
{/* Search bar on right */}
<div className="relative hidden lg:block w-64">
<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-sm" data-icon="search">search</span>
</div>
<input className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg pl-8 pr-10 py-1 text-code-sm font-code-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all" placeholder="Search BLAKE3 / Mint / PDA..." type="text"/>
<span className="absolute right-2 top-1.5 px-1 py-0.5 rounded border border-outline-variant/50 text-[10px] font-code-sm text-outline">⌘K</span>
</div>
{/* Latency Pill */}
<div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/30 text-code-sm font-code-sm text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span>
<span>Devnet: 284ms</span>
</div>
{/* Trailing Action Icons */}
<div className="flex items-center gap-1">
<button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Integrated Terminal">
<span className="material-symbols-outlined text-lg" data-icon="terminal">terminal</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Yellowstone Hub">
<span className="material-symbols-outlined text-lg" data-icon="hub">hub</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors" title="Settings">
<span className="material-symbols-outlined text-lg" data-icon="settings">settings</span>
</button>
</div>
{/* Solana Wallet Adapter Indicator Button (Phantom / Solflare Connected) */}
<div className="flex items-center gap-2 pl-2 border-l border-outline-variant/40">
<div className="flex items-center gap-2 px-3 py-1 rounded bg-surface-container-high border border-primary/30 shadow-[0_0_16px_-4px_rgba(153,69,255,0.3)]">
<div className="relative flex items-center justify-center">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<span className="absolute w-2 h-2 rounded-full bg-secondary-fixed animate-ping opacity-75"></span>
</div>
<span className="text-code-sm font-code-sm text-on-surface font-medium tracking-tight">4xNm...89Kz</span>
<span className="px-1 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-label-sm uppercase">SOL</span>
</div>
{/* Operator Avatar */}
<img className="w-7 h-7 rounded border border-outline-variant/50 object-cover" data-alt="Technical avatar portrait of a Solana validator operator and systems architect with dark carbon cybernetic visor and subtle electric purple rim lighting reflecting on obsidian glass backdrop." src={data.user.avatarUrl}/>
</div>
</div>
</div>
</header>
{/* APP WORKSPACE BODY */}
<div className="flex">
{/* COMPACT SIDE NAV BAR (Shared Component: SideNavBar) */}
<aside className="bg-surface-container-low/90 backdrop-blur-xl dark:bg-surface-container-low/90 text-primary dark:text-primary fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 z-40 flex flex-col justify-between border-r border-outline-variant/30 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)]">
<div className="flex flex-col h-full p-3 gap-2">
{/* Header Subsystem Section */}
<div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
<div className="flex items-center justify-between">
<span className="text-label-md font-label-md tracking-wider text-outline uppercase">SUBSYSTEM TRACER</span>
<span className="material-symbols-outlined text-sm text-tertiary" data-icon="shield">shield</span>
</div>
<p className="text-code-sm font-code-sm text-on-surface-variant/80 mt-0.5">v0.9.4-rc3 // MAINNET-BETA</p>
</div>
{/* Navigation Tabs Hierarchy */}
<nav className="flex flex-col gap-1">
{/* Active: Pipeline DAG (Dashboard intent mapping directly to system pipeline) */}
<a className="flex items-center gap-3 px-3 py-2 rounded bg-surface-container-highest text-secondary border-l-2 border-secondary font-medium shadow-[0_0_12px_-2px_rgba(0,236,145,0.2)]" href="#pipeline">
<span className="material-symbols-outlined text-lg" data-icon="account_tree">account_tree</span>
<span className="text-label-md font-label-md">Pipeline DAG</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="#kernel">
<span className="material-symbols-outlined text-lg" data-icon="memory">memory</span>
<span className="text-label-md font-label-md">Kernel &amp; Solana</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="#geyser">
<span className="material-symbols-outlined text-lg" data-icon="dataset">dataset</span>
<span className="text-label-md font-label-md">Yellowstone Geyser</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="#c2pa">
<span className="material-symbols-outlined text-lg" data-icon="verified">verified</span>
<span className="text-label-md font-label-md">C2PA WASM Engine</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="#eas">
<span className="material-symbols-outlined text-lg" data-icon="link">link</span>
<span className="text-label-md font-label-md">EAS Attestations</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="#pay-sh">
<span className="material-symbols-outlined text-lg" data-icon="payments">payments</span>
<span className="text-label-md font-label-md">Pay.sh x402 Rails</span>
</a>
</nav>
{/* CTA Action in SideNav */}
<div className="mt-4 px-2">
<button className="w-full py-2 px-3 rounded bg-primary-container text-on-primary-container text-label-md font-label-md uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(153,69,255,0.35)] hover:border-tertiary/50 hover:text-tertiary transition-colors duration-150 active:scale-[0.99]">
<span className="material-symbols-outlined text-sm" data-icon="data_object">data_object</span>
<span>Inspect State Vector</span>
</button>
</div>
{/* Spacer */}
<div className="flex-1"></div>
{/* Footer Secondary Spec Links in SideBar */}
<div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-1">
<a className="flex items-center gap-2.5 px-3 py-1.5 rounded text-code-sm font-code-sm text-outline hover:text-on-surface transition-colors" href="#docs">
<span className="material-symbols-outlined text-base" data-icon="menu_book">menu_book</span>
<span>Docs Spec</span>
</a>
<a className="flex items-center gap-2.5 px-3 py-1.5 rounded text-code-sm font-code-sm text-outline hover:text-on-surface transition-colors" href="#geyser-stream">
<span className="material-symbols-outlined text-base text-secondary" data-icon="sensors">sensors</span>
<span className="flex items-center gap-2">
              Live Geyser Stream
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
</span>
</a>
</div>
</div>
</aside>
{/* MAIN ENGINE CANVAS (High Precision Creator Dashboard) */}
<main className="ml-64 flex-1 pb-16 pt-5 px-6 lg:px-8 max-w-[1780px]">
{/* SUB-HEADER / ACTIONS MATRIX */}
<section className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-outline-variant/20">
<div>
<div className="flex items-center gap-3">
<span className="px-2 py-0.5 rounded bg-primary-container/20 border border-primary/30 text-primary text-label-sm font-label-sm uppercase tracking-wider">
              AUTHORITY MATRIX // NEXT.JS 15 (AUTH)
            </span>
<span className="text-code-sm font-code-sm text-outline">PDA: ark7..90Xw</span>
</div>
<h1 className="text-headline-lg font-headline-lg text-on-surface mt-1 tracking-tight flex items-center gap-3">
            Creator Attestation &amp; Royalty Engine
            <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-label-sm font-label-sm tracking-wider uppercase flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Live Geyser Ingestion
            </span>
</h1>
</div>
{/* Quick Primary Action Triggers */}
<div className="flex flex-wrap items-center gap-2.5">
<button className="px-3.5 py-2 rounded bg-surface-container-high border border-outline-variant/40 hover:border-tertiary text-on-surface text-label-md font-label-md uppercase tracking-wider flex items-center gap-2 transition-all duration-150">
<span className="material-symbols-outlined text-tertiary text-base" data-icon="electric_bolt">electric_bolt</span>
<span>Criar Blink de Royalty</span>
</button>
<button className="px-4 py-2 rounded bg-primary-container text-on-primary-container font-medium text-label-md font-label-md uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_-2px_rgba(153,69,255,0.45)] hover:border-tertiary hover:brightness-110 active:scale-[0.98] transition-all duration-150">
<span className="material-symbols-outlined text-base" data-icon="add_circle">add_circle</span>
<span>Registrar Nova Obra</span>
</button>
</div>
</section>
{/* TOP METRIC CARDS (Bento Grid 4 Columns) */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
{/* Metric 1: Obras Atestadas */}
<div className="bg-surface-container-low/85 backdrop-blur-xl border border-outline-variant/30 rounded p-4 relative overflow-hidden shadow-[0_0_20px_-4px_rgba(0,0,0,0.4)]">
<div className="flex justify-between items-start">
<span className="text-label-sm font-label-sm text-outline tracking-wider uppercase">Obras Registradas &amp; Hash C2PA</span>
<span className="material-symbols-outlined text-primary text-xl" data-icon="verified_user">verified_user</span>
</div>
<div className="mt-3 flex items-baseline gap-3">
<span className="text-display-lg font-display-lg text-on-surface tracking-tight">1,482</span>
<span className="text-label-sm font-label-sm text-secondary font-medium">+14 este ciclo</span>
</div>
<div className="mt-3 flex items-center justify-between text-code-sm font-code-sm text-outline border-t border-outline-variant/20 pt-2">
<span>WASM Manifests v2.1</span>
<span className="text-on-surface-variant font-medium">100% C2PA Valid</span>
</div>
<div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
</div>
{/* Metric 2: Volume de Royalties USDC via Token-2022 Transfer Hooks */}
<div className="bg-surface-container-low/85 backdrop-blur-xl border border-outline-variant/30 rounded p-4 relative overflow-hidden shadow-[0_0_20px_-4px_rgba(0,0,0,0.4)]">
<div className="flex justify-between items-start">
<span className="text-label-sm font-label-sm text-outline tracking-wider uppercase">Royalties Token-2022 (USDC)</span>
<span className="material-symbols-outlined text-secondary text-xl" data-icon="currency_exchange">currency_exchange</span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-display-lg font-display-lg text-secondary tracking-tight">$84,290.40</span>
<span className="text-code-sm font-code-sm text-outline">USDC</span>
</div>
<div className="mt-3 flex items-center justify-between text-code-sm font-code-sm text-outline border-t border-outline-variant/20 pt-2">
<span>Transfer Hook: <code className="text-primary">hook_91a0..</code></span>
<span className="text-secondary font-medium">Instant Epoch Settlement</span>
</div>
<div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
</div>
{/* Metric 3: Yellowstone Geyser Streams */}
<div className="bg-surface-container-low/85 backdrop-blur-xl border border-outline-variant/30 rounded p-4 relative overflow-hidden shadow-[0_0_20px_-4px_rgba(0,0,0,0.4)]">
<div className="flex justify-between items-start">
<span className="text-label-sm font-label-sm text-outline tracking-wider uppercase">Yellowstone Geyser Ingest</span>
<div className="flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span className="text-[10px] font-code-sm text-secondary uppercase">gRPC OK</span>
</div>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-display-lg font-display-lg text-tertiary tracking-tight">4.2k</span>
<span className="text-code-sm font-code-sm text-outline">events/sec</span>
</div>
<div className="mt-3 flex items-center justify-between text-code-sm font-code-sm text-outline border-t border-outline-variant/20 pt-2">
<span>Sub-slot Latency</span>
<span className="text-tertiary font-code-sm">18.4ms avg</span>
</div>
<div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl pointer-events-none"></div>
</div>
{/* Metric 4: EAS Ethereum Dual-Attestations */}
<div className="bg-surface-container-low/85 backdrop-blur-xl border border-outline-variant/30 rounded p-4 relative overflow-hidden shadow-[0_0_20px_-4px_rgba(0,0,0,0.4)]">
<div className="flex justify-between items-start">
<span className="text-label-sm font-label-sm text-outline tracking-wider uppercase">EAS Cross-Chain Attest</span>
<span className="material-symbols-outlined text-outline text-xl" data-icon="link_2">stethoscope_arrow</span>
</div>
<div className="mt-3 flex items-baseline gap-2">
<span className="text-display-lg font-display-lg text-on-surface tracking-tight">892</span>
<span className="text-code-sm font-code-sm text-outline">schema UID</span>
</div>
<div className="mt-3 flex items-center justify-between text-code-sm font-code-sm text-outline border-t border-outline-variant/20 pt-2">
<span>Ethereum Sepolia / Base</span>
<span className="text-secondary font-medium">Dual-Merkle Sync</span>
</div>
<div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-container-highest/40 rounded-full blur-2xl pointer-events-none"></div>
</div>
</section>
{/* DUAL COLUMN WORKSPACE: RECENT WORKS & MMR GRAPH */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
{/* LEFT 8 COLS: Recent Works with C2PA Badges & BLAKE3 Hashes */}
<div className="xl:col-span-8 bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/30 rounded p-5 flex flex-col justify-between">
<div>
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20 mb-4">
<div>
<h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-lg" data-icon="grid_view">grid_view</span>
                  Registro de Obras C2PA &amp; Licenças On-Chain
                </h2>
<p className="text-body-sm font-body-sm text-on-surface-variant">Manifestos criptográficos com BLAKE3 e ganchos de transferência Token-2022</p>
</div>
<div className="flex items-center gap-2">
<span className="text-code-sm font-code-sm text-outline">Filtro:</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-code-sm font-code-sm text-on-surface">Todos (1,482)</span>
<button className="p-1 rounded bg-surface-container hover:bg-surface-container-highest text-outline hover:text-on-surface">
<span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
</button>
</div>
</div>
{/* Bento Mini Grid of Works */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
{/* Work Card 1 */}
<div className="p-3.5 rounded bg-surface-container/70 border border-outline-variant/25 hover:border-tertiary/40 transition-all group">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Neural Latent Topography #042</h3>
</div>
<span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary text-label-sm font-label-sm uppercase">C2PA VALID</span>
</div>
<p className="text-code-sm font-code-sm text-outline truncate mb-2.5">
                  BLAKE3: <span className="text-on-surface-variant">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
</p>
<div className="grid grid-cols-2 gap-2 text-code-sm font-code-sm bg-surface-container-lowest/80 p-2 rounded border border-outline-variant/20 mb-3">
<div>
<span className="text-outline block text-[10px]">SPL TOKEN-2022 MINT</span>
<span className="text-primary font-medium">9g8P...21Wa</span>
</div>
<div>
<span className="text-outline block text-[10px]">HOOK FEE LIQUIDADA</span>
<span className="text-secondary font-medium">4.20% ($124.80)</span>
</div>
</div>
<div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-code-sm font-code-sm">
<span className="text-outline">WormGraph MMR: #40,192</span>
<div className="flex items-center gap-2">
<a className="text-tertiary hover:underline flex items-center gap-0.5" href="#view">
<span>Inspecionar</span>
<span className="material-symbols-outlined text-xs" data-icon="arrow_outward">arrow_outward</span>
</a>
</div>
</div>
</div>
{/* Work Card 2 */}
<div className="p-3.5 rounded bg-surface-container/70 border border-outline-variant/25 hover:border-tertiary/40 transition-all group">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Quantum Entropy Soundscapes</h3>
</div>
<span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary text-label-sm font-label-sm uppercase">C2PA VALID</span>
</div>
<p className="text-code-sm font-code-sm text-outline truncate mb-2.5">
                  BLAKE3: <span className="text-on-surface-variant">5d41402abc4b2a76b9719d911017c592b04f7b4e99f018e69888ff5cb86b7bf4</span>
</p>
<div className="grid grid-cols-2 gap-2 text-code-sm font-code-sm bg-surface-container-lowest/80 p-2 rounded border border-outline-variant/20 mb-3">
<div>
<span className="text-outline block text-[10px]">SPL TOKEN-2022 MINT</span>
<span className="text-primary font-medium">B3v1...78Kc</span>
</div>
<div>
<span className="text-outline block text-[10px]">HOOK FEE LIQUIDADA</span>
<span className="text-secondary font-medium">5.00% ($310.50)</span>
</div>
</div>
<div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-code-sm font-code-sm">
<span className="text-outline">WormGraph MMR: #40,191</span>
<div className="flex items-center gap-2">
<a className="text-tertiary hover:underline flex items-center gap-0.5" href="#view">
<span>Inspecionar</span>
<span className="material-symbols-outlined text-xs" data-icon="arrow_outward">arrow_outward</span>
</a>
</div>
</div>
</div>
{/* Work Card 3 */}
<div className="p-3.5 rounded bg-surface-container/70 border border-outline-variant/25 hover:border-tertiary/40 transition-all group">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Autonomous Agent Prompt Trace</h3>
</div>
<span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary text-label-sm font-label-sm uppercase">C2PA VALID</span>
</div>
<p className="text-code-sm font-code-sm text-outline truncate mb-2.5">
                  BLAKE3: <span className="text-on-surface-variant">7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span>
</p>
<div className="grid grid-cols-2 gap-2 text-code-sm font-code-sm bg-surface-container-lowest/80 p-2 rounded border border-outline-variant/20 mb-3">
<div>
<span className="text-outline block text-[10px]">SPL TOKEN-2022 MINT</span>
<span className="text-primary font-medium">4mKp...99Zp</span>
</div>
<div>
<span className="text-outline block text-[10px]">HOOK FEE LIQUIDADA</span>
<span className="text-secondary font-medium">3.50% ($88.20)</span>
</div>
</div>
<div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-code-sm font-code-sm">
<span className="text-outline">WormGraph MMR: #40,188</span>
<div className="flex items-center gap-2">
<a className="text-tertiary hover:underline flex items-center gap-0.5" href="#view">
<span>Inspecionar</span>
<span className="material-symbols-outlined text-xs" data-icon="arrow_outward">arrow_outward</span>
</a>
</div>
</div>
</div>
{/* Work Card 4 */}
<div className="p-3.5 rounded bg-surface-container/70 border border-outline-variant/25 hover:border-tertiary/40 transition-all group">
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<h3 className="text-headline-sm font-headline-sm text-on-surface group-hover:text-tertiary transition-colors">DeFi Protocol Whitepaper Infographic</h3>
</div>
<span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary text-label-sm font-label-sm uppercase">C2PA VALID</span>
</div>
<p className="text-code-sm font-code-sm text-outline truncate mb-2.5">
                  BLAKE3: <span className="text-on-surface-variant">ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb</span>
</p>
<div className="grid grid-cols-2 gap-2 text-code-sm font-code-sm bg-surface-container-lowest/80 p-2 rounded border border-outline-variant/20 mb-3">
<div>
<span className="text-outline block text-[10px]">SPL TOKEN-2022 MINT</span>
<span className="text-primary font-medium">89aT...12Bx</span>
</div>
<div>
<span className="text-outline block text-[10px]">HOOK FEE LIQUIDADA</span>
<span className="text-secondary font-medium">5.00% ($42.00)</span>
</div>
</div>
<div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-code-sm font-code-sm">
<span className="text-outline">WormGraph MMR: #40,185</span>
<div className="flex items-center gap-2">
<a className="text-tertiary hover:underline flex items-center gap-0.5" href="#view">
<span>Inspecionar</span>
<span className="material-symbols-outlined text-xs" data-icon="arrow_outward">arrow_outward</span>
</a>
</div>
</div>
</div>
</div>
</div>
{/* Bottom Micro-Bar for Works */}
<div className="mt-4 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between text-code-sm font-code-sm text-outline gap-2">
<span>Mostrando 4 de 1,482 manifestos indexados via WASM Kernel</span>
<div className="flex items-center gap-3">
<button className="text-primary hover:underline flex items-center gap-1">
<span>Download Provenance Report (JSON-LD)</span>
<span className="material-symbols-outlined text-xs" data-icon="download">download</span>
</button>
</div>
</div>
</div>
{/* RIGHT 4 COLS: WormGraph MMR (Merkle Mountain Range) Root Visualizer */}
<div className="xl:col-span-4 bg-surface-container-low/90 backdrop-blur-xl border border-outline-variant/30 rounded p-5 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
<div>
<h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-lg" data-icon="device_hub">device_hub</span>
                  WormGraph MMR Roots
                </h2>
<p className="text-body-sm font-body-sm text-on-surface-variant">Atestação cumulativa Solana &lt;&gt; Ethereum</p>
</div>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-tertiary text-code-sm font-code-sm">PEAK #3</span>
</div>
{/* Visual Graph Tree Simulation */}
<div className="bg-surface-container-lowest p-3.5 rounded border border-outline-variant/30 mb-4 font-code-sm text-code-sm">
<div className="flex items-center justify-between mb-2">
<span className="text-outline uppercase text-[10px]">CURRENT MMR CANONICAL ROOT</span>
<span className="text-secondary font-medium">SLOT 294,029,103</span>
</div>
<div className="bg-surface-container-high p-2 rounded border border-tertiary/30 text-tertiary break-all select-all font-mono text-xs shadow-[0_0_12px_rgba(0,219,233,0.15)]">
                0x7391a82f3c09b0bda7e8d7cf32918bb81734af8903c7320b9e83ca910901e8a9
              </div>
{/* Interactive Node DAG Visual Representation */}
<div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2.5">
<div className="flex items-center justify-between text-on-surface">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
<span className="font-medium">Leaf #40192 (PDA Attestation)</span>
</div>
<span className="text-outline text-[11px]">Finalized</span>
</div>
<div className="ml-3 pl-3 border-l border-primary/40 space-y-2 text-outline">
<div className="flex items-center justify-between">
<span>↳ Leaf #40191 (Royalty Hook Split)</span>
<span className="text-secondary">OK</span>
</div>
<div className="flex items-center justify-between">
<span>↳ Leaf #40190 (EAS Sepolia Mirror)</span>
<span className="text-secondary">OK</span>
</div>
</div>
</div>
</div>
{/* EAS Cross-Chain Schema Proof Box */}
<div className="p-3 rounded bg-surface-container-high/60 border border-outline-variant/30 text-code-sm font-code-sm">
<div className="flex justify-between items-center text-outline mb-1">
<span>EAS ETHEREUM ATTESTATION UID</span>
<span className="text-tertiary">Schema: 0x8a1...</span>
</div>
<p className="text-on-surface truncate">0xb8391740927eacdf9281726a8c7921bbcf1092a18274a98127391bfa982a</p>
<div className="mt-2 flex items-center justify-between pt-2 border-t border-outline-variant/20 text-outline">
<span>Solana Geyser Stream Sync:</span>
<span className="text-secondary font-medium">Zero-Drift Verified</span>
</div>
</div>
</div>
<div className="mt-4">
<button className="w-full py-2 px-3 rounded bg-surface-container-high border border-outline-variant/40 hover:border-tertiary text-on-surface text-label-md font-label-md uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
<span className="material-symbols-outlined text-sm text-secondary" data-icon="commit">commit</span>
<span>Forçar Snapshot Merkle na Epoch</span>
</button>
</div>
</div>
</div>
{/* BOTTOM ROW: HISTÓRICO DE MICROPAGAMENTOS X402 (AGENTES IA) & TELEMETRIA TOKEN-2022 */}
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
{/* Spec Data Table */}
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
{data.transactions.map(tx => (
<tr key={tx.id} className="hover:bg-surface-container-high/40 transition-colors">
<td className="py-2 px-3 font-mono text-outline">{tx.id}</td>
<td className={`py-2 px-3 ${tx.source.includes('C2PA') ? 'text-tertiary' : tx.source.includes('Solana') ? 'text-primary' : tx.source.includes('EVM') ? 'text-on-surface' : 'text-outline'}`}>{tx.source}</td>
<td className="py-2 px-3 font-mono">{tx.action}</td>
<td className="py-2 px-3 font-mono">{tx.time}</td>
<td className={`py-2 px-3 text-right font-semibold ${tx.status.includes('OK') || tx.status.includes('CONFIRMED') || tx.status.includes('VERIFIED') ? 'text-secondary-fixed' : 'text-outline'}`}>{tx.status}</td>
</tr>
))}
</tbody>
</table>
</div>
</section>
</main>
</div>
{/* FIXED TECHNICAL STATUS BAR (Shared Component: Footer) */}
<footer className="bg-surface-container-lowest/95 backdrop-blur-md dark:bg-surface-container-lowest/95 text-tertiary dark:text-tertiary fixed bottom-0 left-0 w-full h-8 z-50 flex items-center border-t border-outline-variant/30 shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.4)]">
<div className="w-full px-4 flex justify-between items-center text-code-sm font-code-sm">
{/* Left Copyright & Slot Identifier */}
<div className="flex items-center gap-4">
<span className="text-code-sm font-code-sm text-on-surface font-semibold">
          ARKHE FOUNDATION // APACHE-2.0 SYSTEM TELEMETRY KERNEL // SLOT #294029103
        </span>
</div>
{/* Right Telemetry Status Pills & Documentation Links */}
<div className="flex items-center gap-5">
<span className="text-secondary font-medium underline cursor-pointer active:opacity-75">Yellowstone gRPC [OK]</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">WASM Runtime: 32MB</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">TPS: 3,420</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">Audit Provenance</span>
<span className="text-on-surface-variant hover:text-on-surface hover:text-secondary transition-colors duration-150 cursor-pointer active:opacity-75">GitHub Specs</span>
</div>
</div>
</footer>
{/* Inline Lightweight Micro-Interactions Script */}

    </div>
  )
}
