# Arkhe Architecture

Arkhe's architecture is composed of a hybrid approach that separates provenance verification from financial settlement.

## Settlement Layer (Solana)

Solana is the primary settlement layer. The `arkhe-verify` (Anchor) program verifies Merkle Mountain Range (MMR) inclusion proofs coming from WormGraph. Royalties are executed using Token Extensions (Transfer Hooks) and integrated with payment gateways such as Pay.sh. This settlement layer is optimized for sub-second finality and very low transaction fees, making it ideal for micro-royalties. It leverages x402 and MPP to facilitate standard HTTP machine-to-machine payments.

**sol_blake3 Mitigation:** Since the `sol_blake3` system call is not yet active on the Solana mainnet, Arkhe uses a feature-gated fallback to `SHA-256` or runs on custom L2s (such as the SOON Network) and the `solana-test-validator` for local testing.

## Provenance Layer (Agnostic)

The provenance layer operates off-chain and is chain-agnostic. It verifies AI origin metadata and generates cryptographic proofs that can be anchored to either Ethereum or Solana.

The `arkhe-c2pa-bridge` manages C2PA (ISO 22144) manifests by parsing signatures and anchoring the hash (RecordHash) on Solana (via WormGraph) or on Ethereum (via Ethereum Attestation Service - EAS).

### Core Modules:
* **arkhe-watermark-llm:** Handles the detection and embedding of SynthID-Text watermarks.
* **arkhe-provenance-llm:** Generates Canonical JSON (RFC 8785) provenance envelopes.
* **arkhe-eu-ai-act:** Validates whether an output meets the EU AI Act Article 50(2) requirements (C2PA + Watermark).
* **arkhe-light-shed-detect:** Spectral detection of adversarial perturbations (Glaze/Nightshade Bypass).

## Bridge Layer

We utilize Wormhole NTT (Native Token Transfers) and Circle's Cross-Chain Transfer Protocol (CCTP) to provide unified USDC balances and connect Solana's efficient settlement layer to the deep liquidity of the Ethereum DeFi ecosystem.
