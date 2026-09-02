export interface VersionRelease {
  version: string;
  date: string;
  tag: string;
  isLatest?: boolean;
  changes: string[];
}

export const APP_VERSION = 'v3.7.30';
export const BUILD_DATE = '02/09/2026';

export const VERSION_HISTORY: VersionRelease[] = [
  {
    version: 'v3.7.30',
    date: '02/09/2026',
    tag: 'Tratamento de Contingência e Motor Analítico Local do Assistente IA',
    isLatest: true,
    changes: [
      'Adicionado motor analítico e semântico local de contingência para o Assistente GEAPI, garantindo respostas instantâneas, precisas e estruturadas (com botões de ação e navegação) mesmo se a chave do Gemini estiver temporariamente ausente no ambiente.',
      'Corrigido tratamento de erros e exceções de rede no fluxo do chatbot de inteligência artificial.'
    ]
  },
  {
    version: 'v3.7.29',
    date: '02/09/2026',
    tag: 'Reativação do Assistente de Inteligência Artificial GEAPI',
    changes: [
      'Reativado o Assistente Inteligente GEAPI (alimentado por Gemini) tanto pelo botão de acesso rápido no cabeçalho superior quanto pelo botão flutuante no canto inferior da tela.',
      'Janela modal do assistente IA totalmente integrada com a base de dados oficial, permitindo consultas instantâneas de radares, coordenadas geográficas, contratos, situações operacionais, prazos de aferição e geração de relatórios.'
    ]
  },
  {
    version: 'v3.7.28',
    date: '02/09/2026',
    tag: 'Limpeza Visual dos Cabeçalhos dos Gráficos de Contrato e Tipo na Aba Indicadores',
    changes: [
      'Removidos os badges duplicados ao lado do título dos gráficos "Consolidação por Contrato" e "Consolidação por Tipo de Equipamento", mantendo a identificação das séries na legenda interativa inferior do Recharts.',
      'Aprimorada a clareza e elegância visual dos cabeçalhos dos cards de gráficos no dashboard.'
    ]
  },
  {
    version: 'v3.7.27',
    date: '02/09/2026',
    tag: 'Disposição Lado a Lado dos Gráficos de Contrato e Tipo + Simplificação de Legendas',
    changes: [
      'Organizados os gráficos de "Consolidação por Contrato" e "Consolidação por Tipo de Equipamento" em grid responsivo de 2 colunas lado a lado no desktop (com empilhamento automático em telas menores), proporcionando visão executiva panorâmica sem rolagem excessiva.',
      'Simplificada a nomenclatura do badge, barras, legenda e tooltip de "Locais Únicos" para "Locais" no gráfico de tipos de equipamento, garantindo consistência visual com os demais gráficos.',
      'Ajustadas as proporções, margens e inclinação das legendas dos eixos dos dois gráficos para sincronia e legibilidade perfeita em qualquer resolução.'
    ]
  },
  {
    version: 'v3.7.26',
    date: '02/09/2026',
    tag: 'Interatividade Cruzada Bidirecional Total entre Gráficos, Tabelas e Filtros da Aba Indicadores',
    changes: [
      'Implementada reatividade bidirecional completa: o clique em qualquer barra dos gráficos ou em qualquer linha das tabelas (Contratos, Tipos, Ano, Mês, Corredores e Situação) filtra instantaneamente todos os demais gráficos, tabelas e a lista de equipamentos.',
      'Criada filtragem cruzada independente por dimensão com useMemo e recordMatchesIndicatorsFilters, permitindo que cada tabela e gráfico mantenha seu contexto dimensional enquanto recalcula dinamicamente em relação aos outros filtros ativos.',
      'Adicionado feedback visual com destaque de linha selecionada, badges de filtro no topo com botão individual de remoção e botão "Restaurar Filtros" para reset global.',
      'Tornados interativos também os cards de KPI (Em Operação, Em Implantação e Em Relocação) com clique direto nas métricas para filtragem imediata por situação.'
    ]
  },
  {
    version: 'v3.7.25',
    date: '02/09/2026',
    tag: 'Unificação Consolidada do Gráfico por Tipo de Equipamento (Faixas e Locais)',
    changes: [
      'Unificados os gráficos de "Faixas por Tipo de Equipamento" e "Locais Fiscalizados por Tipo" em um único card panorâmico consolidado na aba Indicadores.',
      'Implementada comparação visual direta entre Faixas (verde esmeralda) e Locais Únicos (roxo violeta) por tecnologia, com barras agrupadas, legendas interativas e rótulos numéricos no topo.',
      'Integrado o novo gráfico unificado por tipo na rotina de exportação em PDF oficial, com proporção automática e alta fidelidade.'
    ]
  },
  {
    version: 'v3.7.24',
    date: '02/09/2026',
    tag: 'Suporte Nativo a Cores Modernas (OKLCH) na Captura dos Gráficos para PDF',
    changes: [
      'Substituído o motor de renderização gráfica por html2canvas-pro com suporte total a funções de cor modernas (oklch, oklab, color spaces e variáveis CSS do Tailwind v4).',
      'Resolvido o erro "Attempting to parse an unsupported color function oklch" durante a captura dos cards de gráficos dos Indicadores.',
      'Garantida a exportação completa, nítida e sem falhas dos 3 gráficos no PDF gerado da aba Indicadores.'
    ]
  },
  {
    version: 'v3.7.23',
    date: '02/09/2026',
    tag: 'Correção Definitiva de Renderização e Escala dos Gráficos no PDF',
    changes: [
      'Eliminada a distorção e corte no Gráfico 1 (Consolidação por Contrato) através da captura completa do card com html2canvas sanitizado para cores Tailwind.',
      'Implementado cálculo dinâmico da proporção natural (aspect ratio via doc.getImageProperties) para todos os gráficos no PDF, impedindo qualquer achatamento ou esticamento visual.',
      'Preservados cabeçalho, badges, eixos, barras coloridas, rótulos de valores e legendas exatamente como aparecem na interface web.'
    ]
  },
  {
    version: 'v3.7.22',
    date: '02/09/2026',
    tag: 'Correção de Renderização Integral do Gráfico Consolidado por Contrato no PDF',
    changes: [
      'Corrigida a proporção e preservação de coordenadas (viewBox e width/height) na extração SVG dos gráficos para o relatório PDF, solucionando o corte/zoom de barras.',
      'Desativadas as animações transitórias (isAnimationActive={false}) nos gráficos de barras da aba Indicadores para garantir geometria estática imediata e fiel durante a captura.',
      'Expandidos os clip-paths e ajustado o dimensionamento do card consolidado no PDF para visualização nítida e completa de todas as séries (Faixas, Equipamentos e Locais).'
    ]
  },
  {
    version: 'v3.7.21',
    date: '02/09/2026',
    tag: 'Correção na Captura e Inclusão dos 3 Gráficos no PDF do Painel Executivo',
    changes: [
      'Reformulada a rotina de captura de gráficos do Painel Executivo para renderização direta via SVG/XMLSerializer e Canvas 2D de alta definição, eliminando falhas de compatibilidade com CSS moderno.',
      'Garantida a inclusão completa dos 3 gráficos no PDF exportado da aba Indicadores: 1) Consolidação por Contrato (Faixas, Equipamentos e Locais), 2) Faixas por Tipo de Equipamento, e 3) Locais Fiscalizados por Tipo.'
    ]
  },
  {
    version: 'v3.7.20',
    date: '02/09/2026',
    tag: 'Ajustes no Gráfico Consolidado, Tabela de Indicadores e Exportação PDF',
    changes: [
      'Renomeado o badge e o rótulo do gráfico consolidado de "Locais Únicos" para "Locais" na aba Indicadores.',
      'Reordenada a coluna "Situação" para ser exibida após a coluna "Bairro" na tabela Lista de Equipamentos da aba Indicadores.',
      'Aprimorada a captura e renderização do gráfico "Consolidação por Contrato (Faixas, Equipamentos e Locais)" garantindo sua perfeita inclusão no PDF exportado.'
    ]
  },
  {
    version: 'v3.7.19',
    date: '02/09/2026',
    tag: 'Unificação dos Gráficos por Contrato em Gráfico Consolidado Único',
    changes: [
      'Unificados os três gráficos de Contrato (Faixas, Equipamentos e Locais Únicos) em um único gráfico consolidado comparativo na aba Indicadores.',
      'Configuradas barras agrupadas com cores temáticas (Azul para Faixas, Roxo para Equipamentos e Laranja para Locais Únicos), legendas interativas, tooltips completos e filtragem dinâmica ao clicar nas barras.',
      'Atualizada a exportação de relatórios PDF de Indicadores para incluir a captura em largura total do novo gráfico consolidado por contrato.'
    ]
  },
  {
    version: 'v3.7.18',
    date: '02/09/2026',
    tag: 'Centralização dos Dados da Tabela Lista de Equipamentos na Aba Indicadores',
    changes: [
      'Centralizados todos os cabeçalhos, colunas e células de dados (Código, Contrato, Tipo, Faixas, Situação, Endereço Completo, Bairro e Ações) na tabela Lista de Equipamentos da aba Indicadores.'
    ]
  },
  {
    version: 'v3.7.17',
    date: '02/09/2026',
    tag: 'Padronização de Relatórios PDF: Centralização de Dados e Ajuste de Fonte na Coluna Condição',
    changes: [
      'Centralizados todos os dados e cabeçalhos de todas as tabelas exportadas em relatórios PDF no portal (exceto na Ficha Individual do Equipamento, que mantém o alinhamento de propriedades).',
      'Configurado tamanho de fonte ligeiramente reduzido para a coluna "CONDIÇÃO" em todas as tabelas exportadas em PDF (Tabela Geral de Equipamentos, Relação Sintética em Indicadores e Relação Nominal do Mapa).'
    ]
  },
  {
    version: 'v3.7.16',
    date: '01/09/2026',
    tag: 'Atualização do Acervo Legal: Remoção da Portaria INMETRO Nº 258/2020',
    changes: [
      'Removido o card e todas as referências à Portaria INMETRO Nº 258/2020 na aba Legislação (seção Não Metrológico: DIF, DAS e DCP).'
    ]
  },
  {
    version: 'v3.7.15',
    date: '01/09/2026',
    tag: 'Exibição e Otimização do Rodapé Mobile (Versão, Atualizar e Desenvolvedor)',
    changes: [
      'Ajustada a exibição no rodapé abaixo da caixa de legenda no mobile, organizando em destaque o botão de Versão (com modal de histórico), botão Atualizar dados e créditos do desenvolvedor (Caio Henriques de O. L. Cordeiro).',
      'Adicionado espaçamento inferior seguro (pb-20) no mobile para garantir visibilidade total e impedir sobreposição pela barra de navegação inferior fixa.'
    ]
  },
  {
    version: 'v3.7.14',
    date: '01/09/2026',
    tag: 'Remoção do Botão "Instalar WebApp" do Cabeçalho',
    changes: [
      'Removido o botão de atalho "Instalar WebApp" do cabeçalho superior do portal, preservando toda a infraestrutura e recursos de PWA.'
    ]
  },
  {
    version: 'v3.7.13',
    date: '01/09/2026',
    tag: 'Filtro de Contrato com Seleção Múltipla por Checkbox e Presets Rápidos',
    changes: [
      'Transformado o campo de filtro CONTRATO em seleção múltipla com caixas de marcação (checkboxes) nas abas Monitoramento Espacial, Indicadores e Lista de Equipamentos.',
      'Preservado o filtro padrão ativo com os novos contratos vigentes (2740/24, 2741/24 e 2742/24) pré-selecionados ao carregar e ao limpar filtros.',
      'Adicionados atalhos rápidos destacados no dropdown: "★ Atuais (2740, 2741, 2742)", "Anteriores (2586, 2585, 2587)", "Marcar Todos", "Limpar" e campo de busca rápida.',
      'Compatibilidade total implementada na exportação de relatórios PDF com os contratos selecionados.'
    ]
  },
  {
    version: 'v3.7.12',
    date: '01/09/2026',
    tag: 'Correção do Ícone de Radar na Área de Trabalho do iOS (PWA/Safari)',
    changes: [
      'Corrigida a compatibilidade com o iOS Safari removendo a declaração SVG indevida em apple-touch-icon que impedia a exibição do ícone.',
      'Gerados ícones PNG dedicados em alta resolução e fundo sólido (180x180, 167x167, 152x152, 120x120) com enquadramento otimizado para a máscara nativa do iOS (squircle).',
      'Atualizado o Service Worker com cache v2 para propagação imediata dos novos ícones.'
    ]
  },
  {
    version: 'v3.7.11',
    date: '31/08/2026',
    tag: 'Inclusão da Portaria DENATRAN Nº 1.113/2011 na Aba Legislação',
    changes: [
      'Adicionada a "PORTARIA DENATRAN Nº 1.113, DE 21 DE DEZEMBRO DE 2011" à lista de normativos de equipamentos não metrológicos (DIF • DAS • DCP), com link oficial do SENATRAN.'
    ]
  },
  {
    version: 'v3.7.10',
    date: '31/08/2026',
    tag: 'Padronização do Título da Portaria DENATRAN Nº 27/2005 na Aba Legislação',
    changes: [
      'Atualizado o título do normativo para "PORTARIA DENATRAN Nº 27, DE 30 DE JUNHO DE 2005", padronizando a identificação do órgão emissor na lista de não metrológicos.'
    ]
  },
  {
    version: 'v3.7.9',
    date: '31/08/2026',
    tag: 'Limpeza Visual e Simplificação dos Cabeçalhos das Seções de Legislação',
    changes: [
      'Removido o texto complementar "— Cinemômetros com aferição e aprovação metrológica compulsória" da seção do CEV.',
      'Removidos os cards/badges descritivos "Medição de Velocidade" e "Detecção por Imagem & Vídeo" dos títulos das seções.'
    ]
  },
  {
    version: 'v3.7.8',
    date: '31/08/2026',
    tag: 'Remoção dos Contadores Numéricos na Aba Legislação',
    changes: [
      'Removida a contagem numérica de itens do botão de filtro "Todos".',
      'Removidos os cards de contagem numérica de normativos dos cabeçalhos das seções Metrológico (CEV) e Não Metrológico (DIF / DAS / DCP / DTLP).'
    ]
  },
  {
    version: 'v3.7.7',
    date: '31/08/2026',
    tag: 'Ajuste Tipográfico no Cabeçalho de Legislação Vigente',
    changes: [
      'Ajustado o título principal para "Legislação Vigente".',
      'Refinado o subtítulo para "Normas, resoluções e portarias."'
    ]
  },
  {
    version: 'v3.7.6',
    date: '31/08/2026',
    tag: 'Ajuste do Cabeçalho da Aba Legislação Vigente',
    changes: [
      'Atualizado o título principal para "Legislação vigente".',
      'Removido o badge "Fiscalização Eletrônica de Trânsito" do cabeçalho.',
      'Ajustado o subtítulo para "Normas, resoluções, e portarias."'
    ]
  },
  {
    version: 'v3.7.5',
    date: '31/08/2026',
    tag: 'Aba Legislação: Identidade Visual Wheat (#F5DEB3) e Botão de Ação "LINK"',
    changes: [
      'Atualizada a identidade visual da aba "Legislação" e seus componentes internos para o tom palha / trigo sofisticado (#F5DEB3).',
      'Substituído o texto dos botões de ação de todos os cards de legislação de "Acessar Normativo" para "LINK".'
    ]
  },
  {
    version: 'v3.7.4',
    date: '31/08/2026',
    tag: 'Ajuste no Rótulo dos Cards de Legislação para DTLP',
    changes: [
      'Atualizado o rótulo descritivo do rodapé dos cards de legislação de restrição de tráfego de caminhões para exibir a sigla "DTLP" à esquerda do botão "Acessar Normativo".'
    ]
  },
  {
    version: 'v3.7.3',
    date: '31/08/2026',
    tag: 'Ajuste no Rótulo de Tipo de Equipamento nos Cards de Legislação (CEV)',
    changes: [
      'Atualizado o rótulo descritivo do rodapé dos cards de legislação metrológica para exibir a sigla "CEV" à esquerda do botão "Acessar Normativo".'
    ]
  },
  {
    version: 'v3.7.2',
    date: '31/08/2026',
    tag: 'Ajuste Textual dos Subtítulos da Aba Legislação',
    changes: [
      'Ajustado o subtítulo da seção de equipamentos Não Metrológicos para especificar "restrição de tráfego (caminhões)".',
      'Refinado o cabeçalho da subseção DTLP para "DETECTOR DE TRÁFEGO EM LOCAL PROIBIDO (DTLP) — FISCALIZAÇÃO DE CAMINHÕES (BHTRANS / PBH)".'
    ]
  },
  {
    version: 'v3.7.1',
    date: '31/08/2026',
    tag: 'Ajustes na Aba Legislação: Tema Lilás, Filtro Unificado e Limpeza Visual',
    changes: [
      'Atualizada a identidade visual da aba "Legislação" para o tema lilás / roxo no menu superior, navegação mobile e componentes internos.',
      'Unificados os submenus de Não Metrológico (DIF / DAS / DCP e DTLP Caminhão) em um único botão de filtro dinâmico "Não Metrológico (DIF / DAS / DCP / DTLP)".',
      'Removidos os cards numéricos de contagem de documentos (Metrológicos e Não Metrológicos) no topo do cabeçalho da visão de legislação.'
    ]
  },
  {
    version: 'v3.7.0',
    date: '31/08/2026',
    tag: 'Nova Aba Legislação com Marco Regulatório Metrológico e Não Metrológico',
    changes: [
      'Criada a nova aba "Legislação" posicionada entre "BHDIGITAL" e "OUTROS".',
      'Estruturada a seção METROLÓGICO dedicada ao Controlador Eletrônico de Velocidade (CEV) com Resoluções CONTRAN 798/2020 e 804/2020, Portaria INMETRO 158/2022 e Levantamentos Técnicos da PBH.',
      'Estruturada a seção NÃO METROLÓGICO com duas subseções: DIF, DAS e DCP (Resolução CONTRAN 920/2022, Portarias DENATRAN 16/2004, 27/2005, 85/2014, 263/2007 e Portarias INMETRO 258/2020 e 492/2021) e DTLP Caminhão (Portarias BHTRANS DPR 138/2009, 139/2013, 077/2014 e 004/2019).',
      'Implementada barra dinâmica de filtros rápidos e busca em tempo real com direcionamento direto para os atos oficiais publicados na íntegra.'
    ]
  },
  {
    version: 'v3.6.3',
    date: '31/08/2026',
    tag: 'Hiperlink de Levantamentos Técnicos nos Equipamentos CEV no Modal',
    changes: [
      'Adicionado hiperlink oficial de Levantamentos Técnicos da PBH/BHTRANS no código dos equipamentos do tipo CEV dentro do modal de detalhes (cabeçalho e campo CÓDIGO).',
      'Configurado direcionamento direto para a página oficial da PBH de levantamentos técnicos de controladores eletrônicos de velocidade.'
    ]
  },
  {
    version: 'v3.6.2',
    date: '31/08/2026',
    tag: 'Ajuste de Rótulo no Popup do Mapa (Data de Desligamento)',
    changes: [
      'Ajustado o rótulo exibido no popup interativo do mapa de "Data Desligamento" para "Data de Desligamento", padronizando com a nomenclatura oficial da planilha e dos modais.'
    ]
  },
  {
    version: 'v3.6.1',
    date: '31/08/2026',
    tag: 'Suporte à Coluna Data de Desligamento na Planilha Matriz e Exportações',
    changes: [
      'Integrada a leitura da nova coluna "Data de Desligamento" da aba Lista Geral da planilha matriz mantendo a integridade de todos os dados pré-existentes.',
      'Contemplada a exibição da "Data de Desligamento" na seção "Datas Importantes" do modal de detalhes do equipamento (ficha completa).',
      'Adicionado aviso de Data de Desligamento no popup interativo ao clicar nos marcadores do mapa.',
      'Incluída a "Data de Desligamento" nas exportações em PDF pertinentes (Ficha Individual do Equipamento e Relatório Customizado).'
    ]
  },
  {
    version: 'v3.6.0',
    date: '28/08/2026',
    tag: 'Nova Aba OUTROS (Verde Escuro) & Migração do Gráfico Sistema eTrânsito',
    changes: [
      'Criada a nova aba "OUTROS" no menu superior desktop e na barra inferior mobile, posicionada imediatamente à direita da aba BHDIGITAL.',
      'Identidade visual configurada na cor verde escuro (Emerald/Green) com destaque ativo e estados de foco/hover integrados.',
      'Transferido o gráfico "Sistema eTransito - Número médio de registros/mês recebidos em 2026" para a aba OUTROS.',
      'Removido o gráfico eTrânsito da aba Indicadores, mantendo a visualização de indicadores focada nos equipamentos e contratos de fiscalização eletrônica.'
    ]
  },
  {
    version: 'v3.5.9',
    date: '28/08/2026',
    tag: 'Hiperlinks de Reajuste (1º e 2º Reajustes) do CT 2743/24 na Gestão Contratual',
    changes: [
      'Configurado link direto para o PDF oficial do 1º Reajuste (4,75%) do CT 2743/24 (apostila01-ct2743_24.pdf).',
      'Configurado link direto para o PDF oficial do 2º Reajuste (4,68%) do CT 2743/24 (apostila02-ct2743_24.pdf).',
      'Aplicado nas tabelas "Custo por Faixa e por Contrato" e "Custo por Relocação e por Contrato" na aba Gestão Contratual.'
    ]
  },
  {
    version: 'v3.5.8',
    date: '28/08/2026',
    tag: 'Hiperlink Direto do CT 2743/24 (PDF PBH) na Gestão Contratual',
    changes: [
      'Configurado link direto e interativo para o PDF oficial do Contrato 2743/2024 (2743/24) (ct2743_24.pdf) no Portal de Transparência da PBH.',
      'Aplicado na coluna CONTRATO de todas as tabelas e cards da aba Gestão Contratual.',
      'Abertura segura em nova aba com indicador visual de link externo.'
    ]
  },
  {
    version: 'v3.5.7',
    date: '28/08/2026',
    tag: 'Hiperlink do 1º Reajuste do CT 2741/24 na Gestão Contratual',
    changes: [
      'Configurado link direto e interativo para o PDF oficial de apostilamento no valor de 1º Reajuste (4,75%) do CT 2741/24 nas tabelas "Custo por Faixa e por Contrato" e "Custo por Relocação e por Contrato".',
      'Contrato 2741/24 - 1º Reajuste (4,75%) vinculado a apostila01-ct2741_24.pdf.',
      'Abertura direta do documento de apostilamento em nova aba com segurança.'
    ]
  },
  {
    version: 'v3.5.6',
    date: '28/08/2026',
    tag: 'Hiperlinks dos Documentos de Reajuste (1º e 2º Reajustes) na Gestão Contratual',
    changes: [
      'Configurados links diretos e interativos para os PDFs oficiais de Termos Aditivos e Apostilamentos nos valores de 1º e 2º Reajustes das tabelas "Custo por Faixa e por Contrato" e "Custo por Relocação e por Contrato".',
      'Contrato 2740/24 - 1º Reajuste (4,87%) vinculado a 1ta-ct2740_24.pdf.',
      'Contrato 2740/24 - 2º Reajuste (4,46%) vinculado a apostila01-ct2740_24.pdf.',
      'Contrato 2742/24 - 1º Reajuste (4,87%) vinculado a apostila01-ct2742_24.pdf.',
      'Contrato 2742/24 - 2º Reajuste (4,46%) vinculado a apostila02-ct2742_25.pdf.',
      'Estilização dos valores clicáveis com destaque azul, sublinhado em hover e ícone discreto de documento externo.'
    ]
  },
  {
    version: 'v3.5.5',
    date: '28/08/2026',
    tag: 'Hiperlinks Diretos dos Contratos (PDF PBH) na Gestão Contratual',
    changes: [
      'Configurados links diretos e interativos para os PDFs oficiais do Portal de Transparência da PBH na coluna CONTRATO de todas as tabelas da aba Gestão Contratual.',
      'Contrato 2740/2024 (2740/24) vinculado a ct2740_24.pdf.',
      'Contrato 2741/2024 (2741/24) vinculado a ct2741_24.pdf.',
      'Contrato 2742/2024 (2742/24) vinculado a ct2742_24.pdf.',
      'Adicionado ícone indicador de link externo e abertura em nova aba com segurança.'
    ]
  },
  {
    version: 'v3.5.4',
    date: '28/08/2026',
    tag: 'Atualização de Nomenclatura para 1º Reajuste e 2º Reajuste na Gestão Contratual',
    changes: [
      'Atualizada a nomenclatura das colunas nas tabelas "Custo por Faixa e por Contrato" e "Custo por Relocação e por Contrato" de "1ª TA / 2ª TA" para "1º REAJUSTE / 2º REAJUSTE".',
      'Refatorado o parser de dados da planilha matriz de Controle Geral dos Contratos para reconhecer dinamicamente as variações de cabeçalho de reajuste.',
      'Ajustados os crachás informativos das tabelas para "Valores, BDI, 1º Reajuste e 2º Reajuste".'
    ]
  },
  {
    version: 'v3.5.3',
    date: '28/08/2026',
    tag: 'Inclusão da Tabela "Custo por Relocação e por Contrato" na Gestão Contratual',
    changes: [
      'Inserida nova tabela "CUSTO POR RELOCAÇÃO E POR CONTRATO" posicionada imediatamente após a tabela "Custo por Faixa e por Contrato" na aba Gestão Contratual.',
      'Configurada a extração e sincronização em tempo real dos dados de custos de relocação a partir da planilha matriz de Controle Geral dos Contratos.',
      'Exibição completa das colunas: Contrato, Empresa, Valor de Relocação (Contratado), BDI, 1ª TA, 2ª TA e Valor de Relocação Atual com tipografia monospace e formatação financeira.'
    ]
  },
  {
    version: 'v3.5.2',
    date: '27/08/2026',
    tag: 'Máscara Automática de Data (DD/MM/AAAA) nos Filtros de Início de Operação e Aceite',
    changes: [
      'Implementada máscara inteligente de data (DD/MM/AAAA) nos 4 campos de intervalo dos filtros "Início de Operação" e "Aceite" (Início e Fim).',
      'Adicionada inserção automática das barras "/" durante a digitação contínua (ex: "01012026" formata instantaneamente para "01/01/2026").',
      'Configurado modo numérico (inputMode="numeric") e limitação a 10 caracteres para otimização da digitação no teclado móvel e desktop.'
    ]
  },
  {
    version: 'v3.5.1',
    date: '27/08/2026',
    tag: 'Padronização da Relação "Em implantação" na Tabela de Implantações por Mês',
    changes: [
      'Ajustada a tabela "Implantações por Mês" na aba Indicadores para exibir "Em implantação" para registros sem data de início de operação (mês/ano) definida, alinhando a nomenclatura com a tabela "Implantações por Ano".',
      'Refatorada a ordenação temporal e a agregação de dados para posicionamento consistente de itens em processo de implantação.',
      'Refletida a mesma padronização e totalização nos relatórios executivos em PDF.'
    ]
  },
  {
    version: 'v3.5.0',
    date: '27/08/2026',
    tag: 'Visibilidade Direta dos Filtros de Situação, Início de Operação, Aceite e Coordenadas',
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
