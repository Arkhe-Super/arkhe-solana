# Settlement Layer

The main settlement execution environment of Arkhe is Solana, chosen for its sub-second finality and very low transaction fees (ideal for micro-royalties).

Arkhe leverages:
1. **Pay.sh Integration:** For gateway processing and payouts to multiple addresses. This service triggers API calls to split microtransactions seamlessly.
2. **x402 and MPP:** To facilitate standard HTTP machine-to-machine payments.
3. **Anchor Framework:** The `arkhe-verify` contract validates inclusion proofs against the WormGraph to ensure atomic and secure royalty settlement.
