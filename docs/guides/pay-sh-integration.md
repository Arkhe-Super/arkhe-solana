# Pay.sh Integration

Arkhe integrates Pay.sh to facilitate programmatic payments. Agents trigger the `arkhe-royalty-verify` service, which calls the Pay.sh API and splits microtransactions among the relevant royalty wallets using the `x402` headers. These headers facilitate standard HTTP machine-to-machine payments, enabling seamless and automated royalty distribution based on on-chain verification of inclusion proofs.
