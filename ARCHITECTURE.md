# Arquitetura Arkhe

A arquitetura da Arkhe é composta por uma abordagem híbrida que separa a verificação da proveniência da liquidação financeira.

## Camada de Liquidação (Solana)

Solana é a camada principal de liquidação. O programa `arkhe-verify` (Anchor) verifica as provas de inclusão do Merkle Mountain Range (MMR) provenientes do WormGraph. Os royalties são executados usando Token Extensions (Transfer Hooks) e integrados com gateways de pagamento como o Pay.sh.

**Mitigação do sol_blake3:** Como a chamada de sistema `sol_blake3` ainda não está ativa na rede principal do Solana, a Arkhe usa um fallback restrito por um feature gate para o `SHA-256` ou executa em L2s personalizadas (como a Rede SOON) e o `solana-test-validator` para testes locais.

## Camada de Proveniência (Agnóstica)

O `arkhe-c2pa-bridge` gerencia manifestos C2PA (ISO 22144), interpretando assinaturas e ancorando o hash (RecordHash) no Solana (via WormGraph) ou no Ethereum (via Serviço de Atestação Ethereum - EAS).

### Módulos Principais:
* **arkhe-watermark-llm:** Trata da detecção e incorporação de marcas d'água SynthID-Text.
* **arkhe-provenance-llm:** Gera envelopes de proveniência JSON Canônicos (RFC 8785).
* **arkhe-eu-ai-act:** Valida se uma saída atende aos requisitos do Artigo 50(2) do AI Act da UE (C2PA + Marca d'água).
* **arkhe-light-shed-detect:** Detecção espectral de perturbações adversariais (Bypass de Glaze/Nightshade).

## Camada de Ponte

Nós utilizamos o Wormhole NTT (Native Token Transfers) e o Cross-Chain Transfer Protocol (CCTP) da Circle para fornecer saldos unificados de USDC e conectar a camada eficiente de liquidação do Solana à profunda liquidez do ecossistema DeFi do Ethereum.
