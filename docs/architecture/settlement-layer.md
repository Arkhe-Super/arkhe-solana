# Camada de Liquidação

O principal ambiente de execução de liquidação da Arkhe é o Solana, escolhido pela sua finalidade de menos de um segundo e taxas de transação muito baixas (ideal para microroyalties).

A Arkhe aproveita:
1. **Integração Pay.sh:** Para processamento de gateway e pagamentos para múltiplos endereços.
2. **x402 e MPP:** Para facilitar pagamentos HTTP padrão de máquina para máquina.
3. **Framework Anchor:** O contrato `arkhe-verify` valida as provas de inclusão em relação ao WormGraph.