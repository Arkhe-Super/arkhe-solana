# Arkhe

Arkhe is a hybrid blockchain architecture for AI provenance and royalty micropayments. It aligns a complex technical architecture (provenance, AI, and blockchain) with legal and financial realities across dozens of countries.

## Three Pillars of Arkhe

1. **International Standards (C2PA & Berne Convention)**
   Arkhe positions itself as a compliance and settlement layer over established frameworks. Using C2PA (ISO 22144), it handles machine-readable provenance. With `arkhe-eu-ai-act`, it addresses the upcoming EU AI Act Article 50 requirements, generating auditable Compliance Reports anchored on-chain.

2. **Micropayments Infrastructure (Solana)**
   Using Solana for sub-second, sub-cent transactions, Arkhe integrates with Pay.sh (Google Cloud), x402, and MPP protocols. Royalties are settled atomically only if a valid inclusion proof is verified on-chain via the WormGraph.

3. **Interoperability (Chain-Agnostic Provenance)**
   Instead of replacing national registries, Arkhe connects to them. The `arkhe-c2pa-bridge` anchors C2PA manifests to Solana (WormGraph) and Ethereum (EAS), allowing liquidity across chains while maintaining efficient settlement.

## Getting Started

See `docs/guides/quickstart.md` and `docs/guides/local-development.md` for information on setting up your local environment, running the solana-test-validator with sol_blake3 enabled, and building the workspace.
