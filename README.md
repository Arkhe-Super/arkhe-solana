# Arkhe

Arkhe é uma arquitetura de blockchain híbrida para proveniência de IA e micropagamentos de royalties. Ela alinha uma arquitetura técnica complexa (proveniência, IA e blockchain) com realidades legais e financeiras de dezenas de países.

## Três Pilares da Arkhe

1. **Padrões Internacionais (C2PA e Convenção de Berna)**
   Arkhe posiciona-se como uma camada de conformidade e liquidação sobre estruturas estabelecidas. Utilizando o C2PA (ISO 22144), ele lida com proveniência legível por máquina. Com o `arkhe-eu-ai-act`, ele aborda os próximos requisitos do Artigo 50 do AI Act da UE, gerando Relatórios de Conformidade auditáveis ancorados on-chain.

2. **Infraestrutura de Micropagamentos (Solana)**
   Utilizando Solana para transações de menos de um segundo e frações de centavo, Arkhe integra-se ao Pay.sh (Google Cloud), x402 e protocolos MPP. Os royalties são liquidados atomicamente apenas se uma prova de inclusão válida for verificada on-chain via o WormGraph.

3. **Interoperabilidade (Proveniência Agnóstica a Cadeia)**
   Em vez de substituir registros nacionais, Arkhe se conecta a eles. A ponte `arkhe-c2pa-bridge` ancora manifestos C2PA em Solana (WormGraph) e Ethereum (EAS), permitindo liquidez através das cadeias, mantendo ao mesmo tempo uma liquidação eficiente.

## Começando

Consulte `docs/guides/quickstart.md` e `docs/guides/local-development.md` para obter informações sobre como configurar seu ambiente local, executar o solana-test-validator com o sol_blake3 ativado, e compilar o workspace.
