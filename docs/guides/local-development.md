# Local Development

To run the local environment:
`bash scripts/start-test-validator.sh`
This script starts the local Solana node. You can optionally toggle the `sol_blake3` feature gate to exactly mirror the production environment. By default, the `sol_blake3` feature is inactive (mirroring mainnet). Use the `--blake3` flag or run `solana-test-validator -r` with the feature gate explicitly enabled for testing.
