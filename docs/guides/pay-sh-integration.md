# Pay.sh Integration

Arkhe integrates Pay.sh to facilitate programmatic payouts. Agents ping the `arkhe-royalty-verify` service, which triggers the Pay.sh API and splits the micro-transactions across the relevant royalty wallets using the `x402` headers.
