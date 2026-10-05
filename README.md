# Arkhe

Arkhe is a hybrid blockchain architecture for AI provenance and royalty micropayments. It aligns a complex technical architecture (provenance, AI, and blockchain) with the legal and financial realities of dozens of countries. The project's architecture utilizes a hybrid blockchain model: Solana for execution and settlement (using Pay.sh/x402), and Ethereum (EVM) for liquidity and attestation (EAS).

## Three Pillars of Arkhe

1. **International Standards (C2PA and Berne Convention)**
   Arkhe positions itself as a compliance and settlement layer on top of established frameworks. Using C2PA (ISO 22144), it handles machine-readable provenance. Through the `arkhe-eu-ai-act` crate, it addresses the upcoming requirements of Article 50 of the EU AI Act, generating auditable Compliance Reports anchored on-chain.

2. **Micropayments Infrastructure (Solana)**
   Utilizing Solana for sub-second transactions and fraction-of-a-cent fees, Arkhe integrates with Pay.sh (Google Cloud), x402, and MPP protocols. Royalties are settled atomically only if a valid inclusion proof is verified on-chain via the WormGraph. The main settlement environment uses the `arkhe-verify` (Anchor) contract to validate these proofs.

3. **Interoperability (Chain-Agnostic Provenance)**
   Instead of replacing national registries, Arkhe connects to them. The `arkhe-c2pa-bridge` anchors C2PA manifests on Solana (WormGraph) and Ethereum (EAS), enabling cross-chain liquidity while maintaining efficient settlement.

## Getting Started

See `docs/guides/quickstart.md` and `docs/guides/local-development.md` for information on how to set up your local environment, run the `solana-test-validator` with the `sol_blake3` feature enabled, and compile the workspace.

To build the project workspace, use `cargo build` to compile the Rust crates and `anchor build` to compile the smart contracts. Local Solana development uses `solana-test-validator` via `bash scripts/start-test-validator.sh`. The `sol_blake3` feature is inactive by default (mirroring mainnet). Use the `--blake3` flag to explicitly activate it using `--feature-set` for testing.
