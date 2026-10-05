# EU AI Act - Article 50(2)

The upcoming Article 50 of the EU AI Act requires that AI outputs be marked in a machine-readable format to indicate artificial origin.

Arkhe utilizes a dual-layer approach:
1. Invisible robust watermarks (e.g., SynthID-Text), which embed the origin information directly into the content data.
2. Secure metadata (C2PA manifests), which provide verifiable and tamper-evident provenance assertions.

The `arkhe-eu-ai-act` crate combines these techniques to validate if an output meets the requirements and generates an auditable Compliance Report anchored on-chain, proving adherence to these regulations.
