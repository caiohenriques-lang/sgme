export interface VersionRelease {
  version: string;
  date: string;
  tag: string;
  isLatest?: boolean;
  changes: string[];
}

export const APP_VERSION = 'v3.5.0';
export const BUILD_DATE = '27/08/2026';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: 'v3.5.0',
    date: '27/08/2026',
    tag: 'Visibilidade Direta dos Filtros de Situação, Início de Operação, Aceite e Coordenadas',
    isLatest: true,
    changes: [
      'Disponibilizados diretamente na barra de filtros os campos de Situação (Condição), Intervalo de Datas de Início de Operação, Intervalo de Datas de Aceite e alternador "Apenas com Coordenadas".',
      'Eliminada a necessidade de expansão secundária ("Datas/Cond."), mantendo visualização imediata e integrada em todas as abas (Monitoramento Espacial, Indicadores e Lista de Equipamentos).',
      'Adicionados chips interativos dedicados no rodapé da barra para remoção rápida de filtros de Situação, Início de Operação, Aceite e Coordenadas.'
    ]
  },
  {
    version: 'v3.4.9',
    date: '27/08/2026',
    tag: 'Filtros com Caixa de Seleção Múltipla para Tipo, Regional e Bairro',
    changes: [
      'Implementadas caixas de seleção múltipla (checkbox com popover interativo) para os filtros Tipo de Equipamento, Regional e Bairro em todas as abas (Monitoramento Espacial, Indicadores e Lista de Equipamentos).',
      'Adicionada busca instantânea, contadores dinâmicos, ações rápidas de "Marcar Todos" e "Limpar" para cada filtro múltiplo.',
      'Criados chips informativos de filtros ativos no rodapé da barra com remoção individual e botão de limpeza rápida.'
    ]
  },
  {
    version: 'v3.4.8',
    date: '27/08/2026',
    tag: 'Correção de Proporção e Geometria do Mapa na Exportação em PDF',
    changes: [
      'Corrigida a distorção horizontal na plotagem do mapa no PDF do Monitoramento Espacial, preservando 100% da proporção original (aspect-ratio) sem esticamento.',
      'Implementado cálculo dinâmico de dimensões e centralização automática da moldura geográfica no documento A4.',
      'Ajustada a resolução de captura panorâmica (1920x1080) com renderização de alta fidelidade visual.'
    ]
  },
  {
    version: 'v3.4.7',
    date: '27/08/2026',
    tag: 'Reorganização da Sequência de Colunas no PDF do Monitoramento Espacial (Mapa)',
    changes: [
      'Reordenada a sequência exata de colunas da tabela de relação nominal de equipamentos no PDF do mapa: Código, Contrato, Endereço Completo, Bairro, Regional, Faixas, Tipo, OS, Situação e Condição.',
      'Ajustadas as larguras individuais e alinhamentos de células para acomodar a nova disposição com máxima legibilidade.'
    ]
  },
  {
    version: 'v3.4.6',
    date: '27/08/2026',
    tag: 'Inclusão da Coluna OS na Exportação de PDF do Monitoramento Espacial (Mapa)',
    changes: [
      'Adicionada a coluna OS (Ordem de Serviço) na tabela de relação nominal de equipamentos do PDF exportado pelo mapa.',
      'Ajustadas as proporções e larguras das colunas para alinhamento estético e legibilidade ideal em formato A4.'
    ]
  },
  {
    version: 'v3.4.5',
    date: '27/08/2026',
    tag: 'Aplicação do Logotipo Oficial PBH/BHTRANS na Tela de Bloqueio/Senha',
    changes: [
      'Substituído o ícone genérico de cadeado pelo logotipo oficial de timbre PBH / BHTRANS no card de autenticação da tela de senha.',
      'Ajustada a moldura e contraste do emblema sobre o fundo escuro com acabamento e sombras refinadas.'
    ]
  },
  {
    version: 'v3.4.4',
    date: '26/08/2026',
    tag: 'Ocultação Temporária dos Botões de Acesso ao Assistente de IA',
    changes: [
      'Ocultados temporariamente os botões de acionamento do Assistente de IA (cabeçalho e botão flutuante) conforme solicitado.',
      'Mantida toda a estrutura de serviços, rotas de IA e lógica de resposta preservadas para reexibição imediata sob demanda.'
    ]
  },
  {
    version: 'v3.4.3',
    date: '26/08/2026',
    tag: 'Diálogo Proativo com Sugestões de Complemento e Ações Rápidas (1-Clique)',
    changes: [
      'Implementado fluxo conversacional proativo na IA para propor desdobramentos operacionais inteligentes (por contrato, tipo ou regional) ao responder perguntas amplas.',
      'Criado o tipo de ação QUICK_PROMPT com botões interativos de 1 toque no modal de chat, agilizando consultas complementares em smartphones e desktops.',
      'Sincronizadas diretrizes de resposta concisa mantendo o número direto inicial com ofertas de aprofundamento claras.'
    ]
  },
  {
    version: 'v3.4.2',
    date: '26/08/2026',
    tag: 'Otimização com Gemini 3.7 Flash em Modo de Latência Zero (thinkingBudget: 0)',
    changes: [
      'Configurado o modelo oficial gemini-3.7-flash com thinkingBudget: 0 para desligar o ciclo de raciocínio oculto e entregar respostas instantâneas (1-3 segundos).',
      'Corrigidos os identificadores de modelo do SDK (@google/genai) para evitar quedas em cascatas de erro e timeouts.',
      'Sincronizado backend Express e rota serverless da Vercel com fallback limpo e direto.'
    ]
  },
  {
    version: 'v3.4.1',
    date: '26/08/2026',
    tag: 'Precisão Matemática por Tipo (CEV/DAS/DIF) e Respostas Ultra-Sucintas na IA',
    changes: [
      'Injetadas métricas pré-calculadas exatas por tipo de equipamento (faixas e equipamentos em operação, implantação e relocação para CEV, DAS, DIF, etc.).',
      'Configurada diretriz estrita para respostas cirúrgicas e diretas ao ponto, sem tabelas ou introduções longas não solicitadas.',
      'Diferenciação clara entre quantidade de faixas (soma) e quantidade de postos/equipamentos de fiscalização.'
    ]
  },
  {
    version: 'v3.4.0',
    date: '26/08/2026',
    tag: 'Aceleração Instantânea do Motor de IA com gemini-2.5-flash',
    changes: [
      'Configurado o modelo ultra-rápido gemini-2.5-flash com chamada direta de única etapa, eliminando loops de retentativa que causavam até 4 minutos de espera.',
      'Ajustado limite de tokens de saída (maxOutputTokens: 1000) e temperatura calibrada para respostas precisas e imediatas em 2-3 segundos.',
      'Sincronizado fallback inteligente para gemini-flash-latest e gemini-3.1-flash-lite no servidor Express e na Vercel.'
    ]
  },
  {
    version: 'v3.3.9',
    date: '26/08/2026',
    tag: 'Correção e Sincronização do Status das Faixas em Operação na IA',
    changes: [
      'Corrigida a lógica de classificação de status na IA para reconhecer "Em operação" e "Operação" exatamente como nos Indicadores do portal.',
      'Sincronizada a soma e diferenciação matemática exata de faixas em operação (~700), em implantação e em relocação.',
      'Ajustado o payload de contexto para fornecer o detalhamento fiel por contrato e corredor à IA.'
    ]
  },
  {
    version: 'v3.3.8',
    date: '26/08/2026',
    tag: 'Otimização de Latência e Resposta Ultra-Rápida do Assistente de IA',
    changes: [
      'Otimizado o tamanho do payload de contexto e dados agregados, reduzindo o tempo de processamento inicial em mais de 70%.',
      'Priorizado o modelo de baixa latência e resposta rápida (gemini-flash-latest / gemini-3.1-flash-lite) com fallback instantâneo.',
      'Eliminada sobrecarga de campos redundantes na consulta, garantindo respostas ágeis e diretas.'
    ]
  },
  {
    version: 'v3.3.7',
    date: '26/08/2026',
    tag: 'Registro de Service Worker e Banner Universal de Instalação PWA Mobile',
    changes: [
      'Implementado e registrado o Service Worker (/sw.js) com suporte offline e gatilho nativo PWA para dispositivos Android e navegadores baseados em Chromium.',
      'Criado o banner inteligente universal SmartphoneInstallPrompt que exibe automaticamente o aviso de instalação com 1 clique para smartphones Android e passo a passo para iOS (Safari).',
      'Integrado botão de instalação PWA direto no cabeçalho do portal para acesso rápido em qualquer dispositivo.'
    ]
  },
  {
    version: 'v3.3.6',
    date: '26/08/2026',
    tag: 'Especialização da IA em Locais, Equipamentos e Faixas Fiscalizadas',
    changes: [
      'Configurada instrução mandatória para máxima atenção e precisão na contagem e correlação de Locais (vias/corredores/regionais), Equipamentos (códigos/status) e Faixas.',
      'Reforçada a diferenciação matemática estrita de faixas em operação vs. em implantação vs. inoperantes para cada logradouro consultado.',
      'Aumentada a amplitude de busca contextual e tokenização inteligente para cruzamento de vias, bairros e códigos de equipamentos.'
    ]
  },
  {
    version: 'v3.3.5',
    date: '26/08/2026',
    tag: 'Otimização de Objetividade e Agregação de Faixas por Corredor na IA',
    changes: [
      'Implementada agregação matemática direta de faixas fiscalizadas (ativas, em implantação e inoperantes) por corredor de tráfego e vias principais.',
      'Refinada a instrução de sistema da IA para respostas executivas, diretas e com destaque visual numérico imediato (sem introduções prolixas).',
      'Aprimorada a busca semântica contextual para reconhecimento inteligente de nomes de avenidas, ruas e corredores de Belo Horizonte.'
    ]
  },
  {
    version: 'v3.3.4',
    date: '26/08/2026',
    tag: 'Priorização Padrão dos Contratos Vigentes (2740, 2741 e 2742) no Assistente de IA',
    changes: [
      'Configurada a priorização estrita e automática dos contratos vigentes (2740/2024, 2741/2024 e 2742/2024) para todas as consultas, estatísticas e listagens do Assistente de IA.',
      'Contratos anteriores (2585/20, 2586/20 e 2587/20) só serão incluídos caso o usuário solicite explicitamente na pergunta.',
      'Ajustado o contexto analítico enviado aos modelos para manter o foco operacional nos equipamentos atuais.'
    ]
  },
  {
    version: 'v3.3.3',
    date: '26/08/2026',
    tag: 'Atualização dos Modelos e Aliases Ativos do Gemini na API v1beta',
    changes: [
      'Corrigido o identificador dos modelos para os aliases oficiais suportados na API @google/genai (gemini-flash-latest, gemini-3.7-flash e gemini-3.1-flash-lite).',
      'Eliminado o erro 404 de modelo descontinuado, assegurando roteamento resiliente e compatibilidade total.'
    ]
  },
  {
    version: 'v3.3.2',
    date: '26/08/2026',
    tag: 'Tolerância a Falhas e Fallback Inteligente para o Assistente de IA',
    changes: [
      'Implementado mecanismo de auto-recuperação e re-tentativa automática (retry com backoff) para erros 503 (sobrecarga de servidores da API do Google).',
      'Configurado fallback dinâmico entre modelos, garantindo alta disponibilidade mesmo sob picos de demanda na cota gratuita.',
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
