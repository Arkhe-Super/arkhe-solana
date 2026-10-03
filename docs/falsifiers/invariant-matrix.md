# Matriz de Invariantes

| ID | Enunciado | Falsificador | Crate |
| --- | --- | --- | --- |
| INV-C2PA-01 | Manifest C2PA verificado é ancorado no WormGraph | Manifest válido não ancorado | `arkhe-c2pa-bridge` |
| INV-C2PA-02 | Manifest com assinatura inválida retorna Failed | Assinatura inválida retorna Nonexistent | `arkhe-c2pa-bridge` |
| INV-C2PA-03 | record_hash compromete c2pa.hash.data | Hash não corresponde | `arkhe-c2pa-bridge` |
| INV-WM-01 | Watermark ativo é detetável com chave correta | Texto com watermark não detetado | `arkhe-watermark-llm` |
| INV-WM-02 | Watermark NÃO é detetável com chave errada | Deteção com chave errada | `arkhe-watermark-llm` |
| INV-WM-03 | Watermark não degrada qualidade além do threshold | Qualidade degradada | `arkhe-watermark-llm` |
| INV-PROV-01 | Cada inferência produz envelope com hashes | Inferência sem envelope | `arkhe-provenance-llm` |
| INV-PROV-02 | Envelope é canónico (RFC 8785) | Dois envelopes idênticos com hashes diferentes | `arkhe-provenance-llm` |
| INV-PROV-03 | Envelope é replay-verifiable | Hash não reproduzível | `arkhe-provenance-llm` |
| INV-ROYALTY-01 | Royalty só é pago se obra está no WormGraph | Pagamento sem inclusão | `arkhe-royalty-verify` |
| INV-ROYALTY-02 | Prova de inclusão é verificada on-chain ou off-chain | Prova inválida aceite | `arkhe-royalty-verify` |
| INV-ROYALTY-03 | Pagamento é atómico | Pagamento parcial | `arkhe-royalty-verify` |
| INV-AIACT-01 | Output de IA tem marca legível por máquina | Output sem marca declarado conforme | `arkhe-eu-ai-act` |
| INV-AIACT-02 | Marca é detetável programaticamente | Marca não detetável | `arkhe-eu-ai-act` |
| INV-AIACT-03 | Relatório de conformidade é ancorado no WormGraph | Relatório não ancorado | `arkhe-eu-ai-act` |
| INV-LS-01 | Imagem com Glaze/Nightshade é Protected | Imagem protegida classificada como Bypassed | `arkhe-light-shed-detect` |
| INV-LS-02 | Imagem com LightShed é Bypassed | Imagem bypassada classificada como Protected | `arkhe-light-shed-detect` |
| INV-LS-03 | Classificação é determinística | Classificação inconsistente | `arkhe-light-shed-detect` |