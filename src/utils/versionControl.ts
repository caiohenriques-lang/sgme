export interface VersionRelease {
  version: string;
  date: string;
  tag: string;
  isLatest?: boolean;
  changes: string[];
}

export const APP_VERSION = 'v2.6.0';
export const BUILD_DATE = '20/08/2026';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: 'v2.6.0',
    date: '20/08/2026',
    tag: 'Reorganização da Navegação & Controle de Versão Automatizado',
    isLatest: true,
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
