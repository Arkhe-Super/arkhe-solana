# sol_blake3 Mitigation Strategy

The `arkhe-royalty-verify` component relies heavily on the BLAKE3 hash function for performance parity with WormGraph. Because `sol_blake3` is not yet active on the Solana mainnet, Arkhe incorporates a fallback mechanism using `SHA-256`.

**For Local Testing:**
Start the test validator with the feature gate explicitly enabled:
`solana-test-validator -r` (or disable it to simulate the current state of mainnet). The fallback to `SHA-256` allows development and testing to continue until the `sol_blake3` feature is activated on mainnet, at which point the codebase can easily transition to using it natively.
