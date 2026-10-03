# Arkhe Architecture

The Arkhe architecture is composed of a hybrid approach that separates provenance verification from financial settlement.

## Settlement Layer (Solana)

Solana is the primary settlement layer. The `arkhe-verify` program (Anchor) verifies Merkle Mountain Range (MMR) proofs of inclusion from the WormGraph. Royalties are executed using Token Extensions (Transfer Hooks) and integrated with payment gateways like Pay.sh.

**sol_blake3 Mitigation:** Since the `sol_blake3` syscall is not yet active on Solana mainnet, Arkhe uses a feature-gated fallback to `SHA-256` or runs on custom L2s (like SOON Network) and the `solana-test-validator` for local testing.

## Provenance Layer (Agnostic)

The `arkhe-c2pa-bridge` handles ISO 22144 (C2PA) manifests, parsing signatures and anchoring the hash (RecordHash) to either Solana (via WormGraph) or Ethereum (via Ethereum Attestation Service - EAS).

### Key Modules:
* **arkhe-watermark-llm:** Handles SynthID-Text watermarking detection and embedding.
* **arkhe-provenance-llm:** Generates Canonical JSON (RFC 8785) provenance envelopes.
* **arkhe-eu-ai-act:** Validates if an output complies with EU AI Act Article 50(2) (C2PA + Watermark).
* **arkhe-light-shed-detect:** Spectral detection of adversarial perturbations (Glaze/Nightshade bypass).

## Bridge Layer

We utilize Wormhole NTT (Native Token Transfers) and the Circle Cross-Chain Transfer Protocol (CCTP) to provide unified USDC balances and interconnect the efficient Solana settlement layer with the deep liquidity of the Ethereum DeFi ecosystem.
