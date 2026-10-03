# sol_blake3 Mitigation Strategy

The `arkhe-royalty-verify` component relies heavily on the BLAKE3 hash function for performance parities with WormGraph. Because `sol_blake3` is not yet active on the Solana mainnet, Arkhe incorporates a fallback mechanism using `SHA-256`.

**For Local Testing:**
Start the test validator with the feature gate explicitly enabled:
`solana-test-validator -r` (or disable it to simulate mainnet).
