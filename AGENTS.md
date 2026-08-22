# Diretrizes do Projeto GEAPI

## Controle Automático de Versões
- Sempre que novas alterações, melhorias, correções de bugs ou recursos forem implementados no portal, o assistente **DEVE atualizar automaticamente** o controle de versões em `src/utils/versionControl.ts` e `package.json` sem necessidade de solicitação explícita pelo usuário.
- O histórico de versões (`VERSION_HISTORY`) deve receber uma nova entrada no topo com `isLatest: true`, a data atual, a nova tag de resumo e os detalhes em tópicos das alterações feitas na sessão/tarefa.
- O botão interativo de controle de versões deve permanecer posicionado no rodapé (`FooterLegend.tsx`), imediatamente à esquerda do botão "Atualizar".
