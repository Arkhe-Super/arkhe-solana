# Settlement Layer

The primary settlement execution environment for Arkhe is Solana, chosen for its sub-second finality and very low transaction fees (ideal for micro-royalties).

Arkhe leverages:
1. **Pay.sh Integration:** For gateway processing and multi-address payouts.
2. **x402 & MPP:** To facilitate standard machine-to-machine HTTP payments.
3. **Anchor Framework:** The `arkhe-verify` contract validates inclusion proofs against the WormGraph.
