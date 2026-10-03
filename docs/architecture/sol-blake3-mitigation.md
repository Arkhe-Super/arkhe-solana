# Estratégia de Mitigação sol_blake3

O componente `arkhe-royalty-verify` depende fortemente da função de hash BLAKE3 para paridade de desempenho com o WormGraph. Como o `sol_blake3` ainda não está ativo na rede principal (mainnet) do Solana, a Arkhe incorpora um mecanismo de fallback usando o `SHA-256`.

**Para Testes Locais:**
Inicie o validador de teste com o feature gate explicitamente ativado:
`solana-test-validator -r` (ou desative-o para simular a mainnet).