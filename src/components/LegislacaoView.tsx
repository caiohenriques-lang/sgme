import React, { useState, useMemo } from 'react';
import {
  Scale,
  ExternalLink,
  BookOpen,
  Search,
  Gauge,
  Truck,
  ShieldCheck,
  Tag,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';

interface LegislationItem {
  id: string;
  category: 'metrologico' | 'nao_metrologico';
  subCategory?: 'dinamico' | 'dtlp';
  categoryLabel: string;
  equipmentType: string;
  title: string;
  organ: 'CONTRAN' | 'INMETRO' | 'DENATRAN' | 'BHTRANS / PBH' | 'PBH';
  date: string;
  summary: string;
  url: string;
  isPortalLink?: boolean;
}

const LEGISLATION_DATA: LegislationItem[] = [
  // --- METROLÓGICO: CEV ---
  {
    id: 'res-contran-798-2020',
    category: 'metrologico',
    categoryLabel: 'Metrológico',
    equipmentType: 'CEV',
    title: 'RESOLUÇÃO Nº 798, DE 02 DE SETEMBRO DE 2020',
    organ: 'CONTRAN',
    date: '02/09/2020',
    summary: 'Dispõe sobre requisitos técnicos mínimos para a fiscalização da velocidade de veículos automotores, reboques e semirreboques por meio de medidores de velocidade.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao798-2020.pdf',
  },
  {
    id: 'res-contran-804-2020',
    category: 'metrologico',
    categoryLabel: 'Metrológico',
    equipmentType: 'CEV',
    title: 'RESOLUÇÃO CONTRAN Nº 804, DE 16 DE NOVEMBRO DE 2020',
    organ: 'CONTRAN',
    date: '16/11/2020',
    summary: 'Altera a Resolução CONTRAN nº 798/2020, ajustando critérios e prazos de vigência para a adequação dos equipamentos medidores de velocidade aos novos requisitos técnicos.',
    url: 'https://www.in.gov.br/en/web/dou/-/resolucao-contran-n-804-de-16-de-novembro-de-2020-289766021',
  },
  {
    id: 'port-inmetro-158-2022',
    category: 'metrologico',
    categoryLabel: 'Metrológico',
    equipmentType: 'CEV',
    title: 'PORTARIA INMETRO Nº 158, DE 31 DE MARÇO DE 2022',
    organ: 'INMETRO',
    date: '31/03/2022',
    summary: 'Aprova o Regulamento Técnico Metrológico (RTM) consolidado para instrumentos medidores de velocidade de veículos automotores (cinemômetros).',
    url: 'https://www.in.gov.br/web/dou/-/portaria-n-158-de-31-de-marco-de-2022-389937328',
  },
  {
    id: 'pbh-levantamentos-tecnicos',
    category: 'metrologico',
    categoryLabel: 'Metrológico',
    equipmentType: 'CEV',
    title: 'LEVANTAMENTOS TÉCNICOS - PORTAL PBH',
    organ: 'PBH',
    date: 'Vigente',
    summary: 'Página oficial de publicação dos levantamentos e estudos técnicos de controladores eletrônicos de velocidade homologados no município de Belo Horizonte.',
    url: 'https://prefeitura.pbh.gov.br/bhtrans/informacoes/transportes/veiculos/fiscalizacao-eletronica/controladores-eletronicos-de-velocidade/levantamentos-tecnicos',
    isPortalLink: true,
  },

  // --- NÃO METROLÓGICO: DIF / DAS / DCP ---
  {
    id: 'res-contran-920-2022',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'RESOLUÇÃO CONTRAN Nº 920, DE 28 DE MARÇO DE 2022',
    organ: 'CONTRAN',
    date: '28/03/2022',
    summary: 'Estabelece os requisitos técnicos mínimos para a fiscalização eletrônica não metrológica de trânsito (avanço de semáforo, invasão de faixa e conversões proibidas).',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9202022.pdf',
  },
  {
    id: 'port-denatran-16-2004',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA DENATRAN Nº 16, DE 21 DE SETEMBRO DE 2004',
    organ: 'DENATRAN',
    date: '21/09/2004',
    summary: 'Disciplina o uso de sistemas automáticos não metrológicos de fiscalização de trânsito, definindo requisitos e procedimentos de validação.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2004/portaria162004.pdf',
  },
  {
    id: 'port-denatran-27-2005',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA DENATRAN Nº 27, DE 30 DE JUNHO DE 2005',
    organ: 'DENATRAN',
    date: '30/06/2005',
    summary: 'Fixa prazos e especificações complementares para adequação de sistemas automáticos não metrológicos de trânsito no território nacional.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2005/Portaria0272005.pdf',
  },
  {
    id: 'port-denatran-1113-2011',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA DENATRAN Nº 1.113, DE 21 DE DEZEMBRO DE 2011',
    organ: 'DENATRAN',
    date: '21/12/2011',
    summary: 'Estabelece instruções e requisitos técnicos adicionais para a fiscalização eletrônica de trânsito por equipamentos e sistemas não metrológicos.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2011/portaria11132011.pdf',
  },
  {
    id: 'port-denatran-85-2014',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA DENATRAN Nº 85, DE 12 DE JUNHO DE 2014',
    organ: 'DENATRAN',
    date: '12/06/2014',
    summary: 'Atualiza especificações de homologação, registro e testes de sistemas de imagem e detecção automática de infrações não metrológicas.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2014/portaria0852014.pdf',
  },
  {
    id: 'port-denatran-263-2007',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA DENATRAN Nº 263, DE 28 DE NOVEMBRO DE 2007',
    organ: 'DENATRAN',
    date: '28/11/2007',
    summary: 'Estabelece instruções e padrões operacionais complementares para a fiscalização por sistemas automáticos não metrológicos.',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2007/portaria_denatran_263_07.pdf',
  },
  {
    id: 'port-inmetro-258-2020',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA INMETRO Nº 258, DE 6 DE AGOSTO DE 2020',
    organ: 'INMETRO',
    date: '06/08/2020',
    summary: 'Aprova o Regulamento de Avaliação da Conformidade para sistemas automáticos não metrológicos de fiscalização de trânsito.',
    url: 'https://www.in.gov.br/en/web/dou/-/portaria-n-258-de-6-de-agosto-de-2020-270969318',
  },
  {
    id: 'port-inmetro-492-2021',
    category: 'nao_metrologico',
    subCategory: 'dinamico',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DIF • DAS • DCP',
    title: 'PORTARIA INMETRO Nº 492, DE 10 DE DEZEMBRO DE 2021',
    organ: 'INMETRO',
    date: '10/12/2021',
    summary: 'Aperfeiçoa as regras de certificação, laudos de ensaio e conformidade para equipamentos de trânsito não metrológicos.',
    url: 'http://in.gov.br/web/dou/-/portaria-n-492-de-10-de-dezembro-de-2021-367535962',
  },

  // --- NÃO METROLÓGICO: DTLP (CAMINHÃO) ---
  {
    id: 'port-bhtrans-138-2009',
    category: 'nao_metrologico',
    subCategory: 'dtlp',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DTLP',
    title: 'PORTARIA BHTRANS DPR N.º 138/2009, DE 16 DE DEZEMBRO DE 2009',
    organ: 'BHTRANS / PBH',
    date: '16/12/2009',
    summary: 'Regulamenta as restrições à circulação de veículos de transporte de carga e trânsito pesado nas vias públicas de Belo Horizonte.',
    url: 'https://dom-web.pbh.gov.br/visualizacao/ato/199503',
  },
  {
    id: 'port-bhtrans-139-2013',
    category: 'nao_metrologico',
    subCategory: 'dtlp',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DTLP',
    title: 'PORTARIA BHTRANS DPR N.º 139/2013, DE 03 DE SETEMBRO DE 2013',
    organ: 'BHTRANS / PBH',
    date: '03/09/2013',
    summary: 'Altera os artigos da Portaria BHTRANS DPR nº 138/2009 referentes aos horários, vias restritas e autorizações especiais para caminhões.',
    url: 'https://dom-web.pbh.gov.br/visualizacao/ato/276691',
  },
  {
    id: 'port-bhtrans-077-2014',
    category: 'nao_metrologico',
    subCategory: 'dtlp',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DTLP',
    title: 'PORTARIA BHTRANS DPR N.º 077/2014, DE 25 DE JUNHO DE 2014',
    organ: 'BHTRANS / PBH',
    date: '25/06/2014',
    summary: 'Estabelece diretrizes operacionais para fiscalização eletrônica de veículos de grande porte em corredores e perímetros urbanos restritos.',
    url: 'https://dom-web.pbh.gov.br/visualizacao/ato/293524',
  },
  {
    id: 'port-bhtrans-004-2019',
    category: 'nao_metrologico',
    subCategory: 'dtlp',
    categoryLabel: 'Não Metrológico',
    equipmentType: 'DTLP',
    title: 'PORTARIA BHTRANS DPR N.º 004/2019, DE 25 DE JANEIRO DE 2019',
    organ: 'BHTRANS / PBH',
    date: '25/01/2019',
    summary: 'Consolida regras operacionais e procedimentos de autorização especial de trânsito (AET) para veículos pesados no município de Belo Horizonte.',
    url: 'https://dom-web.pbh.gov.br/visualizacao/ato/375340',
  },
];

export const LegislacaoView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'metrologico' | 'nao_metrologico'>('all');

  const filteredItems = useMemo(() => {
    return LEGISLATION_DATA.filter((item) => {
      const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.organ.toLowerCase().includes(term) ||
        item.equipmentType.toLowerCase().includes(term) ||
        item.categoryLabel.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [searchTerm, selectedFilter]);

  const metrologicos = useMemo(
    () => filteredItems.filter((i) => i.category === 'metrologico'),
    [filteredItems]
  );

  const naoMetrologicosDinamicos = useMemo(
    () => filteredItems.filter((i) => i.category === 'nao_metrologico' && i.subCategory === 'dinamico'),
    [filteredItems]
  );

  const naoMetrologicosDtlp = useMemo(
    () => filteredItems.filter((i) => i.category === 'nao_metrologico' && i.subCategory === 'dtlp'),
    [filteredItems]
  );

  const getOrganBadge = (organ: LegislationItem['organ']) => {
    switch (organ) {
      case 'CONTRAN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INMETRO':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'DENATRAN':
        return 'bg-amber-100/80 text-amber-900 border-amber-300';
      case 'BHTRANS / PBH':
      case 'PBH':
        return 'bg-[#F5DEB3]/60 text-[#45270c] border-[#DEB887]';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const renderCard = (item: LegislationItem) => {
    return (
      <div
        key={item.id}
        className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#DEB887] transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group"
      >
        <div>
          {/* Header do Card */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getOrganBadge(item.organ)}`}>
                {item.organ}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {item.date}
              </span>
            </div>
            {item.isPortalLink && (
              <span className="text-[10.5px] font-bold bg-[#F5DEB3]/40 text-[#45270c] border border-[#DEB887] px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#8B5A2B]" />
                Portal PBH
              </span>
            )}
          </div>

          {/* Título com Link */}
          <h4 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#45270c] transition-colors leading-snug mb-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#DEB887] rounded-sm"
              title="Clique para abrir o documento oficial"
            >
              <span>{item.title}</span>
              <ArrowUpRight className="w-4 h-4 text-[#8B5A2B] shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </h4>

          {/* Resumo / Ementa */}
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
            {item.summary}
          </p>
        </div>

        {/* Rodapé do Card com Ação (LINK) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600 truncate max-w-[200px]">
            {item.equipmentType}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45270c] hover:text-black bg-[#F5DEB3] hover:bg-[#ebd09f] px-3 py-1 rounded-lg border border-[#DEB887] transition-colors shadow-2xs shrink-0"
          >
            <span>LINK</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8B5A2B]" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Principal no Tema #F5DEB3 (Wheat / Trigo) */}
      <div className="bg-white rounded-2xl border border-[#DEB887]/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#3e2715] via-[#59391e] to-[#784d28] text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-[#F5DEB3] border border-[#DEB887] rounded-2xl text-[#45270c] shrink-0 shadow-xs">
                <Scale className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Legislação Vigente
                </h2>
                <p className="text-xs sm:text-sm text-[#F5DEB3]/90 font-medium mt-1">
                  Normas, resoluções e portarias.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca Dinâmica */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-[#DEB887]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs de Filtro de Categoria Unificadas */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#F5DEB3] text-[#45270c] border border-[#DEB887] shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#F5DEB3]/30 hover:text-[#45270c] border border-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('metrologico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'metrologico'
                  ? 'bg-[#F5DEB3] text-[#45270c] border border-[#DEB887] shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#F5DEB3]/30 hover:text-[#45270c] border border-slate-200'
              }`}
            >
              Metrológico (CEV)
            </button>
            <button
              onClick={() => setSelectedFilter('nao_metrologico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === 'nao_metrologico'
                  ? 'bg-[#F5DEB3] text-[#45270c] border border-[#DEB887] shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-[#F5DEB3]/30 hover:text-[#45270c] border border-slate-200'
              }`}
            >
              Não Metrológico (DIF / DAS / DCP / DTLP)
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar resolução, portaria, órgão..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#DEB887] focus:border-[#DEB887] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Seção 1: METROLÓGICO */}
      {(selectedFilter === 'all' || selectedFilter === 'metrologico') && metrologicos.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#F5DEB3]/35 via-[#F5DEB3]/15 to-white p-4 rounded-2xl border border-[#DEB887]/60 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#59391e] text-[#F5DEB3] rounded-xl shadow-2xs">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#3e2715]">
                  EQUIPAMENTOS METROLÓGICOS
                </h3>
                <p className="text-xs text-[#59391e] font-medium">
                  Controlador Eletrônico de Velocidade (CEV)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrologicos.map(renderCard)}
          </div>
        </div>
      )}

      {/* Seção 2: NÃO METROLÓGICO (Unificado) */}
      {(selectedFilter === 'all' || selectedFilter === 'nao_metrologico') &&
        (naoMetrologicosDinamicos.length > 0 || naoMetrologicosDtlp.length > 0) && (
          <div className="space-y-6 pt-2">
            {/* Header da Grande Seção Não Metrológica */}
            <div className="bg-gradient-to-r from-[#F5DEB3]/35 via-[#F5DEB3]/15 to-white p-4 rounded-2xl border border-[#DEB887]/60 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#59391e] text-[#F5DEB3] rounded-xl shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#3e2715]">
                    EQUIPAMENTOS NÃO METROLÓGICOS
                  </h3>
                  <p className="text-xs text-[#59391e] font-medium">
                    Sistemas automáticos para fiscalização de invasão de faixa, avanço de semáforo, conversão proibida e restrição de tráfego (caminhões)
                  </p>
                </div>
              </div>
            </div>

            {/* Subseção 2.1: DIF, DAS e DCP */}
            {naoMetrologicosDinamicos.length > 0 && (
              <div className="space-y-3 pl-1 sm:pl-2">
                <div className="flex items-center gap-2 border-b border-[#DEB887]/30 pb-2">
                  <Tag className="w-4 h-4 text-[#8B5A2B]" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    DETECTOR DE INVASÃO DE FAIXA (DIF) • DETECTOR DE AVANÇO SEMAFÓRICO (DAS) • DETECTOR DE CONVERSÃO PROIBIDA (DCP)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {naoMetrologicosDinamicos.map(renderCard)}
                </div>
              </div>
            )}

            {/* Subseção 2.2: DTLP (Caminhão) */}
            {naoMetrologicosDtlp.length > 0 && (
              <div className="space-y-3 pl-1 sm:pl-2 pt-2">
                <div className="flex items-center gap-2 border-b border-[#DEB887]/30 pb-2">
                  <Truck className="w-4 h-4 text-[#8B5A2B]" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    DETECTOR DE TRÁFEGO EM LOCAL PROIBIDO (DTLP) — FISCALIZAÇÃO DE CAMINHÕES (BHTRANS / PBH)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {naoMetrologicosDtlp.map(renderCard)}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Nenhum resultado encontrado */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">Nenhum normativo encontrado</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Não encontramos resultados para o termo "{searchTerm}". Tente buscar por CONTRAN, INMETRO, DENATRAN, BHTRANS ou número do ato.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#F5DEB3] text-[#45270c] border border-[#DEB887] text-xs font-bold rounded-xl hover:bg-[#ebd09f] transition-colors shadow-xs"
          >
            Limpar Filtros e Busca
          </button>
        </div>
      )}

      {/* Nota Informativa de Rodapé */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#8B5A2B] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-800">
            Orientações sobre a Validade e Atualização dos Normativos:
          </p>
          <p>
            Os links disponibilizados direcionam diretamente para os portais oficiais dos órgãos emissores (Diário Oficial da União - Imprensa Nacional, Ministério dos Transportes / SENATRAN, INMETRO e Diário Oficial do Município de Belo Horizonte - DOM/PBH).
          </p>
        </div>
      </div>
    </div>
  );
};
