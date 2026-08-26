export interface VersionRelease {
  version: string;
  date: string;
  tag: string;
  isLatest?: boolean;
  changes: string[];
}

export const APP_VERSION = 'v3.3.2';
export const BUILD_DATE = '26/08/2026';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: 'v3.3.2',
    date: '26/08/2026',
    tag: 'Tolerância a Falhas e Fallback Inteligente para o Assistente de IA',
    isLatest: true,
    changes: [
      'Implementado mecanismo de auto-recuperação e re-tentativa automática (retry com backoff) para erros 503 (sobrecarga de servidores da API do Google).',
      'Configurado fallback dinâmico entre modelos (gemini-2.5-flash e gemini-1.5-flash), garantindo alta disponibilidade mesmo sob picos de demanda na cota gratuita.',
      'Melhoria nas respostas de erro amigáveis no chat em caso de instabilidade temporária na rede.'
    ]
  },
  {
    version: 'v3.3.1',
    date: '26/08/2026',
    tag: 'Suporte a Serverless Functions Vercel para o Assistente de IA',
    changes: [
      'Adicionada a estrutura de Serverless Functions (api/gemini/chat.ts) e vercel.json para suporte nativo e instantâneo à GEMINI_API_KEY na Vercel.',
      'Atualizado o Guia de Hospedagem na Vercel com instruções passo a passo para configuração da chave de API de IA.'
    ]
  },
  {
    version: 'v3.3.0',
    date: '25/08/2026',
    tag: 'Integração do Assistente Inteligente com Inteligência Artificial (IA GEAPI)',
    changes: [
      'Implementado o Assistente Inteligente IA GEAPI (Gemini), com botão flutuante e atalho rápido no cabeçalho.',
      'Suporte a perguntas e respostas em linguagem natural sobre contratos (2740/24, 2741/24, 2742/24), radares (CEV, DAS, DIF, DTLP, DCP), status operacional e aferições.',
      'Consulta e extração instantânea de coordenadas geográficas com botão interativo "Ver no Mapa" e link direto para o Google Maps.',
      'Geração e download de relatórios em PDF diretamente através do chat interativo.',
      'Navegação inteligente e aplicação automática de filtros no portal orientada por comandos de voz/texto.'
    ]
  },
  {
    version: 'v3.2.2',
    date: '23/08/2026',
    tag: 'Inclusão das Colunas Ofício de Parada e Ofício de Retorno no Histórico de Interrupções',
    changes: [
      'Adicionada a coluna "Ofício de Parada" (baseada no campo OF da aba EQUIPAMENTOS OFF) antes da data de parada na tabela de Histórico de Parada e Retorno.',
      'Adicionada a coluna "Ofício de Retorno" (baseada no campo OFÍCIO DE RETORNO da aba EQUIPAMENTOS OFF) antes da data de retorno na tabela de Histórico.',
      'Habilitada ordenação interativa e busca em tempo real por números de ofício de parada e retorno.',
      'Ajustada a exportação de dados em CSV para incluir os novos campos na ordem correta.'
    ]
  },
  {
    version: 'v3.2.1',
    date: '23/08/2026',
    tag: 'Renomeação da Coluna Contrato para CT na Lista de Equipamentos',
    changes: [
      'Cabeçalho da coluna "Contrato" renomeado para "CT" na tabela de Lista de Equipamentos para melhor aproveitamento do espaço horizontal.'
    ]
  },
  {
    version: 'v3.2.0',
    date: '23/08/2026',
    tag: 'Inclusão de Colunas de Aceite e Vencimento da Aferição na Lista de Equipamentos',
    changes: [
      'Adicionadas as colunas "Data de Aceite" e "Data de Vencimento da Aferição" na tabela da Lista de Equipamentos (dados da planilha oficial).',
      'Reordenadas as colunas conforme especificação: CONTRATO, CÓDIGO, ENDEREÇO COMPLETO, BAIRRO, REGIONAL, TIPO, FAIXAS, ACEITE, INÍCIO OP., VENC. AFERIÇÃO, CONDIÇÃO, SITUAÇÃO e AÇÕES.',
      'Ajustadas as proporções e larguras das colunas para visualização fluida e equilibrada na tela desktop e rolagem horizontal otimizada no mobile.',
      'Implementada ordenação cronológica inteligente para datas no formato brasileiro (DD/MM/AAAA).'
    ]
  },
  {
    version: 'v3.1.3',
    date: '22/08/2026',
    tag: 'Transição Fluida CSS de Expansão e Recolhimento dos Filtros',
    changes: [
      'Substituída a alternância instantânea por animações suaves em CSS com transições contínuas de max-height, opacity e padding/margin.',
      'Expansão e recolhimento fluidos tanto no Mobile quanto no Desktop, eliminando saltos visuais na renderização dos componentes.'
    ]
  },
  {
    version: 'v3.1.2',
    date: '22/08/2026',
    tag: 'Menu de Pesquisa e Filtros Sempre Recolhido por Padrão no Mobile',
    changes: [
      'Configurado para que a barra de pesquisa e filtros interativa inicie sempre recolhida por padrão em dispositivos móveis (ao carregar o portal ou alternar entre abas), liberando imediatamente o espaço visual para visualização dos mapas e dados.'
    ]
  },
  {
    version: 'v3.1.1',
    date: '22/08/2026',
    tag: 'Suavização Visual do Botão Expandir/Recolher no Mobile e Desktop',
    changes: [
      'Design do botão "Expandir / Recolher" refinado para um estilo mais suave, elegante e discreto (fundo suave, tipografia equilibrada em negrito e bordas delicadas), mantendo excelente legibilidade e usabilidade.'
    ]
  },
  {
    version: 'v3.1.0',
    date: '22/08/2026',
    tag: 'Destaque no Botão EXPANDIR, Ocultação da Legenda no Mobile e Remoção de Contadores',
    changes: [
      'Botão "EXPANDIR / RECOLHER" destacado com tipografia em negrito e contraste visual aprimorado para facilitar a identificação rápida.',
      'Removido o indicador quantitativo numérico (ex: 257/1012) tanto no Desktop quanto no Mobile, proporcionando um cabeçalho mais limpo.',
      'Ocultado o botão e painel de "Legenda" no mapa do Monitoramento Espacial em dispositivos móveis, maximizando a área de navegação cartográfica.'
    ]
  },
  {
    version: 'v3.0.0',
    date: '22/08/2026',
    tag: 'Filtros Expansíveis e Recolhíveis no Portal (Monitoramento, Indicadores e Lista)',
    changes: [
      'Interação intuitiva de expandir e recolher os campos de pesquisa e seletores de filtros disponibilizada para todo o portal (Monitoramento Espacial, Indicadores, Lista de Equipamentos e Resumo Gerencial), tanto no Desktop quanto no Mobile.',
      'Preservado o indicador quantitativo de equipamentos (ex: 657/1012) diretamente no cabeçalho dos filtros.',
      'Clique no cabeçalho ou no botão interativo "Recolher / Expandir" alterna suavemente o painel de filtros.'
    ]
  },
  {
    version: 'v2.9.3',
    date: '22/08/2026',
    tag: 'Ocultação do Texto de Contagem Total de Equipamentos na Barra de Filtros',
    changes: [
      'Removida a exibição do texto "Exibindo X de Y equipamentos" na barra de filtros principal e na aba de Resumo Gerencial, proporcionando um layout mais limpo e focado.'
    ]
  },
  {
    version: 'v2.9.2',
    date: '22/08/2026',
    tag: 'Barra Principal de Filtros e Pesquisa Recolhível no Mobile',
    changes: [
      'Barra superior de filtros e pesquisa rápida (FilterBar) adaptada para modo recolhível no mobile por padrão, exibindo cabeçalho compacto com resumo de equipamentos e status de filtros.',
      'Toque intuitivo no cabeçalho mobile ou no botão "Expandir/Recolher" para exibir ou ocultar os filtros a qualquer momento, liberando espaço visual para o mapa e tabelas.',
      'Suporte a recolhimento implementado também para os filtros do Resumo Gerencial.'
    ]
  },
  {
    version: 'v2.8.1',
    date: '22/08/2026',
    tag: 'Copiar Nº de Série em Equipamentos CEV no Modal de Detalhes',
    changes: [
      'Adicionado botão interativo de cópia rápida do "Nº DE SÉRIE" à direita do campo em equipamentos do tipo CEV no modal de detalhes.',
      'Feedback visual de cópia instantâneo ("Copiado!") integrado ao botão.'
    ]
  },
  {
    version: 'v2.8.0',
    date: '22/08/2026',
    tag: 'Hiperlink Direto Google Maps, Copiar Link no Modal & Controle de Versão no Rodapé',
    changes: [
      'Controle de versões dinâmico e interativo adicionado diretamente no rodapé à esquerda do botão "Atualizar".',
      'Coordenadas geográficas no modal de detalhes transformadas em hiperlink direto para o Google Maps (https://www.google.com/maps/place/<coordenada>).',
      'Função de copiar no modal atualizada para copiar a URL completa do Google Maps para a área de transferência com feedback visual imediato ("Link Copiado!").',
      'Padronização no relatório em PDF do Monitoramento Espacial de "Tipologia" para "Tipos de Fiscalização" nos cards e tabelas.',
      'Cálculo corrigido de locais fiscalizados distintos na exportação de relatórios em PDF do Monitoramento Espacial.'
    ]
  },
  {
    version: 'v2.7.0',
    date: '21/08/2026',
    tag: 'Exportação CSV, Ordenações Dinâmicas, Ajustes Visuais e Suporte PWA iOS',
    changes: [
      'Exportação em CSV nas tabelas "Equipamentos Inoperantes Temporariamente" e "Relatório Histórico de Parada e Retorno de Equipamentos" com suporte nativo a acentuação (BOM UTF-8).',
      'Ordenação dinâmica por clique nos cabeçalhos de coluna de todas as tabelas da aba Interrupções de Equipamentos (Inoperantes, Matriz Mensal e Histórico Geral).',
      'Centralização dos dados dos cards de métricas e renomeação do card para "Total de Interrupções" no cabeçalho de Interrupções.',
      'Ajuste visual no card "Tempo médio de resposta" da aba BHDigital com fundo branco e contraste aprimorado.',
      'Padronização do cabeçalho de KPIs nos relatórios em PDF do Monitoramento Espacial para "LOCAIS FISCALIZADOS".',
      'Implementação do modal orientativo de instalação PWA para iOS (Safari) com ícone oficial padronizado ao favicon do portal.'
    ]
  },
  {
    version: 'v2.6.0',
    date: '20/08/2026',
    tag: 'Reorganização da Navegação & Controle de Versão Automatizado',
    changes: [
      'Reorganização da ordem oficial do menu: Monitoramento Espacial, Gestão Contratual, Indicadores, Lista de Equipamentos, Relatórios, Interrupções de Equipamentos e BHDigital.',
      'Implementação da rotina automatizada de controle de versão e rastreamento de lançamentos.',
      'Sincronização bidirecional completa da aba BHDigital entre ranking de logradouros e gráficos gerenciais.',
      'Refatoração da aba Gestão Contratual com parser dinâmico resiliente e eliminação de tabelas descontinuadas na origem.',
      'Realocação e estilização contextual do botão "Atualizar Dados" no rodapé.'
    ]
  },
  {
    version: 'v2.5.0',
    date: '12/08/2026',
    tag: 'Ajustes de Tabelas, Legenda, Ficha e Google Analytics',
    changes: [
      'Centralização de colunas específicas nas tabelas das abas Indicadores, Lista de Equipamentos e Resumo.',
      'Autoajuste com quebra de linha na coluna Endereço Completo para perfeita adaptação na tela.',
      'Renomeação de colunas do Ranking TOP 20 Corredores para "Qtd. de Equipamentos" e "Qtd. de Faixas".',
      'Atualização visual da legenda do rodapé com contratos em negrito e melhor espaçamento.',
      'Ocultação de campos sem preenchimento na ficha de detalhes do equipamento.',
      'Integração da tag oficial do Google Analytics (gtag.js) para monitoramento de acessos.'
    ]
  },
  {
    version: 'v2.4.0',
    date: '11/08/2026',
    tag: 'Atualização de Interface e Relatórios',
    changes: [
      'Renomeação do filtro de múltipla seleção para "Seleção de Equipamentos".',
      'Refatoração do botão "Limpar Filtros" mantendo a seleção padrão de contratos 2740/24, 2741/24 e 2742/24.',
      'Otimização do posicionamento e estilo do botão "Atualizar Dados".',
      'Aprimoramento dos relatórios em PDF com ocultação automática de campos e seções sem dados.',
      'Ajustes finos de layout, acessibilidade e responsividade em todas as abas.'
    ]
  },
  {
    version: 'v2.3.0',
    date: '28/07/2026',
    tag: 'Dashboard de Indicadores & Exportação PDF',
    changes: [
      'Implementação do gerador de relatórios executivos em PDF com formatação GEAPI.',
      'Módulos de gráficos de pizza, barras e linha temporal com métricas agregadas.',
      'Inclusão da visão em tabela detalhada com ordenação e busca avançada.'
    ]
  },
  {
    version: 'v2.1.0',
    date: '15/06/2026',
    tag: 'Mapeamento Geográfico & Filtros Dinâmicos',
    changes: [
      'Integração com Leaflet para exibição interativa no mapa de Belo Horizonte.',
      'Filtros por Regional, Bairro, Situação, Condição Operacional e Intervalo de Datas.',
      'Identificação visual por cores de acordo com a Situação do Equipamento.'
    ]
  },
  {
    version: 'v2.0.0',
    date: '02/05/2026',
    tag: 'Lançamento Inicial da Plataforma',
    changes: [
      'Conexão contínua em tempo real com a planilha do Google Sheets.',
      'Módulo de autenticação e proteção por palavra de acesso.',
      'Filtros especiais por contrato e legenda normativa GEAPI.'
    ]
  }
];

export function getCurrentVersion(): VersionRelease {
  return VERSION_HISTORY.find((v) => v.isLatest) || VERSION_HISTORY[0];
}

export function getAllVersions(): VersionRelease[] {
  return VERSION_HISTORY;
}
