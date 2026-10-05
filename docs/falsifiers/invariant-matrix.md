# Invariant Matrix

| ID | Statement | Falsifier | Crate |
| --- | --- | --- | --- |
| INV-C2PA-01 | Verified C2PA Manifest is anchored in WormGraph | Valid manifest not anchored | `arkhe-c2pa-bridge` |
| INV-C2PA-02 | Manifest with invalid signature returns Failed | Invalid signature returns Nonexistent | `arkhe-c2pa-bridge` |
| INV-C2PA-03 | record_hash commits c2pa.hash.data | Hash mismatch | `arkhe-c2pa-bridge` |
| INV-WM-01 | Active watermark is detectable with correct key | Watermarked text not detected | `arkhe-watermark-llm` |
| INV-WM-02 | Watermark is NOT detectable with wrong key | Detection with wrong key | `arkhe-watermark-llm` |
| INV-WM-03 | Watermark does not degrade quality beyond threshold | Degraded quality | `arkhe-watermark-llm` |
| INV-PROV-01 | Every inference produces envelope with hashes | Inference without envelope | `arkhe-provenance-llm` |
| INV-PROV-02 | Envelope is canonical (RFC 8785) | Two identical envelopes with different hashes | `arkhe-provenance-llm` |
| INV-PROV-03 | Envelope is replay-verifiable | Hash not reproducible | `arkhe-provenance-llm` |
| INV-ROYALTY-01 | Royalty is only paid if work is in WormGraph | Payment without inclusion | `arkhe-royalty-verify` |
| INV-ROYALTY-02 | Inclusion proof is verified on-chain or off-chain | Invalid proof accepted | `arkhe-royalty-verify` |
| INV-ROYALTY-03 | Payment is atomic | Partial payment | `arkhe-royalty-verify` |
| INV-AIACT-01 | IA output has machine-readable mark | Output without mark declared compliant | `arkhe-eu-ai-act` |
| INV-AIACT-02 | Mark is programmatically detectable | Mark not detectable | `arkhe-eu-ai-act` |
| INV-AIACT-03 | Compliance report is anchored in WormGraph | Report not anchored | `arkhe-eu-ai-act` |
| INV-LS-01 | Image with Glaze/Nightshade is Protected | Protected image classified as Bypassed | `arkhe-light-shed-detect` |
| INV-LS-02 | Image with LightShed is Bypassed | Bypassed image classified as Protected | `arkhe-light-shed-detect` |
| INV-LS-03 | Classification is deterministic | Inconsistent classification | `arkhe-light-shed-detect` |
