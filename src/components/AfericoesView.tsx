import React, { useState, useMemo } from 'react';
import { EquipmentRecord } from '../types';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  AlertCircle,
  Eye
} from 'lucide-react';

interface AfericoesViewProps {
  records: EquipmentRecord[];
  onSelectRecord: (record: EquipmentRecord) => void;
  lastUpdated?: Date;
  loading?: boolean;
  onRefresh?: () => void;
}

type SortField =
  | 'CÓDIGO'
  | 'Nº DE SÉRIE'
  | 'ENDEREÇO COMPLETO'
  | 'BAIRRO'
  | 'Velocidade Fiscalizada'
  | 'Data da Aferição'
  | 'Data de Vencimento da Aferição'
  | 'STATUS PRAZO';

interface VencimentoStatus {
  formattedText: string;
  badgeClass: string;
  diffDays: number | null;
  isValid: boolean;
  statusPrazoText: string;
  statusPrazoBadgeClass: string;
}

/**
 * Remove acentos e normaliza para minúsculas para busca tolerante
 */
function normalizeSearchText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Converte data DD/MM/AAAA para objeto Date zerado no início do dia
 */
function parseDateBR(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (!clean || clean === '-') return null;
  const parts = clean.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m, d);
}

/**
 * Extrai número de velocidade para ordenação numérica (ex: "60 km/h" -> 60)
 */
function extractSpeedNumber(speedStr?: string): number | null {
  if (!speedStr) return null;
  const match = String(speedStr).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Determina o status visual e a regra de vencimento e status prazo da aferição
 */
function getVencimentoStatus(dateStr?: string): VencimentoStatus {
  const date = parseDateBR(dateStr);
  if (!date) {
    return {
      formattedText: '-',
      badgeClass: 'text-slate-400 font-normal',
      diffDays: null,
      isValid: false,
      statusPrazoText: '-',
      statusPrazoBadgeClass: 'text-slate-400 font-normal'
    };
  }

  // Normaliza hoje para início do dia local
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((dateStart - todayStart) / dayMs);

  const cleanText = (dateStr || '').trim();

  // A) VENCIDA: dataVencimento < hoje
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    const prazoText = absDays === 1 ? 'Vencido há 1 dia' : `Vencido há ${absDays} dias`;
    return {
      formattedText: cleanText,
      badgeClass: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
      diffDays,
      isValid: true,
      statusPrazoText: prazoText,
      statusPrazoBadgeClass: 'bg-red-100 text-red-700 border border-red-200 font-semibold'
    };
  }

  // B) VENCE HOJE: dataVencimento = hoje (diffDays === 0) -> Status Crítico Vermelho
  if (diffDays === 0) {
    return {
      formattedText: cleanText,
      badgeClass: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
      diffDays,
      isValid: true,
      statusPrazoText: 'Vence hoje',
      statusPrazoBadgeClass: 'bg-red-100 text-red-700 border border-red-200 font-semibold'
    };
  }

  // C) VENCE EM 1 DIA: vencimento = amanhã (diffDays === 1)
  if (diffDays === 1) {
    return {
      formattedText: cleanText,
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
      diffDays,
      isValid: true,
      statusPrazoText: 'Vence em 1 dia',
      statusPrazoBadgeClass: 'bg-amber-100 text-amber-700 border border-amber-200'
    };
  }

  // D) VENCE EM ATÉ 20 DIAS: diffDays > 1 && diffDays <= 20
  if (diffDays <= 20) {
    return {
      formattedText: cleanText,
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
      diffDays,
      isValid: true,
      statusPrazoText: `Vence em ${diffDays} dias`,
      statusPrazoBadgeClass: 'bg-amber-100 text-amber-700 border border-amber-200'
    };
  }

  // E) VENCE EM MAIS DE 20 DIAS: diffDays > 20
  return {
    formattedText: cleanText,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    diffDays,
    isValid: true,
    statusPrazoText: `Vence em ${diffDays} dias`,
    statusPrazoBadgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  };
}

export const AfericoesView: React.FC<AfericoesViewProps> = ({ records, onSelectRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Ordenação padrão inicial: Data de Vencimento da Aferição em ordem cronológica crescente
  const [sortField, setSortField] = useState<SortField>('Data de Vencimento da Aferição');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // 1. Filtro fixo de equipamentos: estritamente TIPO = CEV e CONTRATO = 2740/24
  const cevRecords = useMemo(() => {
    return records.filter((r) => {
      const tipo = (r.TIPO || '').trim().toUpperCase();
      const contrato = (r.CONTRATO || '').trim();

      const isCev = tipo === 'CEV';
      const is2740 =
        contrato === '2740/24' ||
        contrato === 'CT 2740/24' ||
        contrato === '2740/2024';

      return isCev && is2740;
    });
  }, [records]);

  // 2. Busca geral em todos os campos exibidos (incluindo Código, Nº de Série e Status Prazo)
  const filteredRecords = useMemo(() => {
    const query = normalizeSearchText(searchQuery);
    if (!query) return cevRecords;

    return cevRecords.filter((r) => {
      const codigo = normalizeSearchText(r.CÓDIGO || '');
      const numSerie = normalizeSearchText(r['Nº DE SÉRIE'] || '');
      const endereco = normalizeSearchText(r['ENDEREÇO COMPLETO'] || '');
      const bairro = normalizeSearchText(r.BAIRRO || '');
      const velocidade = normalizeSearchText(r['Velocidade Fiscalizada'] || '');
      const dataAfericao = normalizeSearchText(r['Data da Aferição'] || '');
      const dataVencimento = normalizeSearchText(r['Data de Vencimento da Aferição'] || '');
      const vencimentoStatus = getVencimentoStatus(r['Data de Vencimento da Aferição']);
      const statusPrazo = normalizeSearchText(vencimentoStatus.statusPrazoText || '');

      return (
        codigo.includes(query) ||
        numSerie.includes(query) ||
        endereco.includes(query) ||
        bairro.includes(query) ||
        velocidade.includes(query) ||
        dataAfericao.includes(query) ||
        dataVencimento.includes(query) ||
        statusPrazo.includes(query)
      );
    });
  }, [cevRecords, searchQuery]);

  // 3. Ordenação completa de todas as colunas de dados
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];

    return list.sort((a, b) => {
      const rawA = sortField === 'STATUS PRAZO' ? a['Data de Vencimento da Aferição'] : a[sortField];
      const rawB = sortField === 'STATUS PRAZO' ? b['Data de Vencimento da Aferição'] : b[sortField];

      const strA = (rawA ? String(rawA).trim() : '');
      const strB = (rawB ? String(rawB).trim() : '');

      const isBlankA = !strA || strA === '-';
      const isBlankB = !strB || strB === '-';

      // Campos vazios sempre ao final independente da direção
      if (isBlankA && !isBlankB) return 1;
      if (!isBlankA && isBlankB) return -1;
      if (isBlankA && isBlankB) return 0;

      let comparison = 0;

      if (sortField === 'Velocidade Fiscalizada') {
        const numA = extractSpeedNumber(strA);
        const numB = extractSpeedNumber(strB);
        if (numA !== null && numB !== null) {
          comparison = numA - numB;
        } else {
          comparison = strA.localeCompare(strB, 'pt-BR');
        }
      } else if (
        sortField === 'Data da Aferição' ||
        sortField === 'Data de Vencimento da Aferição' ||
        sortField === 'STATUS PRAZO'
      ) {
        const dateA = parseDateBR(strA);
        const dateB = parseDateBR(strB);
        if (dateA && dateB) {
          comparison = dateA.getTime() - dateB.getTime();
        } else if (dateA && !dateB) {
          return -1;
        } else if (!dateA && dateB) {
          return 1;
        } else {
          comparison = strA.localeCompare(strB, 'pt-BR');
        }
      } else if (sortField === 'CÓDIGO' || sortField === 'Nº DE SÉRIE') {
        // Ordenação alfanumérica natural (ex: 123 antes de 200, ou ABC2 antes de ABC10)
        comparison = strA.localeCompare(strB, 'pt-BR', {
          numeric: true,
          sensitivity: 'base'
        });
      } else {
        // Ordenação textual pt-BR (Endereço, Bairro)
        comparison = strA.localeCompare(strB, 'pt-BR', {
          sensitivity: 'base'
        });
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // 4. Paginação
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Manipulador de clique de ordenação
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Manipulador da busca geral (reseta página para 1)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Bloco Principal: Card da Tabela com Título à Esquerda e Busca à Direita */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Controle de Aferições
          </h2>

          {/* Caixa de Busca Geral Integrada */}
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar em qualquer campo..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-barra de paginação e controles */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            Página <strong className="text-slate-900">{currentPage}</strong> de{' '}
            <strong className="text-slate-900">{totalPages}</strong> (Exibindo{' '}
            {paginatedRecords.length} de {sortedRecords.length} registros)
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Itens por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                {/* 1. CÓDIGO (Compacta) */}
                <th
                  onClick={() => handleSort('CÓDIGO')}
                  className="py-2.5 px-2 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[75px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Código</span>
                    {renderSortIndicator('CÓDIGO')}
                  </div>
                </th>

                {/* 2. Nº DE SÉRIE (Compacta) */}
                <th
                  onClick={() => handleSort('Nº DE SÉRIE')}
                  className="py-2.5 px-2 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[85px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Nº de Série</span>
                    {renderSortIndicator('Nº DE SÉRIE')}
                  </div>
                </th>

                {/* 3. ENDEREÇO COMPLETO (Mais larga) */}
                <th
                  onClick={() => handleSort('ENDEREÇO COMPLETO')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors group text-center min-w-[200px] max-w-[340px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Endereço Completo</span>
                    {renderSortIndicator('ENDEREÇO COMPLETO')}
                  </div>
                </th>

                {/* 4. BAIRRO (Média) */}
                <th
                  onClick={() => handleSort('BAIRRO')}
                  className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[105px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Bairro</span>
                    {renderSortIndicator('BAIRRO')}
                  </div>
                </th>

                {/* 5. VELOCIDADE FISCALIZADA (Compacta) */}
                <th
                  onClick={() => handleSort('Velocidade Fiscalizada')}
                  className="py-2.5 px-2 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[75px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Velocidade</span>
                    {renderSortIndicator('Velocidade Fiscalizada')}
                  </div>
                </th>

                {/* 6. AFERIÇÃO (Compacta) */}
                <th
                  onClick={() => handleSort('Data da Aferição')}
                  className="py-2.5 px-2 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[85px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Aferição</span>
                    {renderSortIndicator('Data da Aferição')}
                  </div>
                </th>

                {/* 7. VENCIMENTO DA AFERIÇÃO (Média/Compacta) */}
                <th
                  onClick={() => handleSort('Data de Vencimento da Aferição')}
                  className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[125px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Vencimento da Aferição</span>
                    {renderSortIndicator('Data de Vencimento da Aferição')}
                  </div>
                </th>

                {/* 8. PRAZO (Média/Compacta com Quebra) */}
                <th
                  onClick={() => handleSort('STATUS PRAZO')}
                  className="py-2.5 px-1.5 cursor-pointer hover:bg-slate-100 transition-colors group text-center whitespace-nowrap min-w-[80px] max-w-[100px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Prazo</span>
                    {renderSortIndicator('STATUS PRAZO')}
                  </div>
                </th>

                {/* 9. AÇÕES (Estreita) */}
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-12 min-w-[50px]">
                  <div className="flex items-center justify-center">
                    <span>Ações</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        Nenhum equipamento encontrado.
                      </p>
                      <p className="text-xs text-slate-400">
                        {searchQuery
                          ? 'Tente ajustar os termos da sua pesquisa para localizar o registro.'
                          : 'Não há registros disponíveis para os critérios CEV e CT 2740/24.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, idx) => {
                  const codigo = r.CÓDIGO?.trim() || '-';
                  const numSerie = r['Nº DE SÉRIE']?.trim() || '-';
                  const endereco = r['ENDEREÇO COMPLETO']?.trim() || '-';
                  const bairro = r.BAIRRO?.trim() || '-';
                  const velocidade = r['Velocidade Fiscalizada']?.trim() || '-';
                  const dataAfericao = r['Data da Aferição']?.trim() || '-';
                  const vencimentoStatus = getVencimentoStatus(r['Data de Vencimento da Aferição']);

                  // Equipamento com aferição vencida: dataVencimento < hoje
                  const isVencida =
                    vencimentoStatus.isValid &&
                    vencimentoStatus.diffDays !== null &&
                    vencimentoStatus.diffDays < 0;

                  return (
                    <tr
                      key={r.id || `${codigo}-${idx}`}
                      className={`transition-colors ${
                        isVencida
                          ? 'bg-red-50/60 hover:bg-red-100/60 font-bold text-slate-900'
                          : 'hover:bg-slate-50/80 font-normal text-slate-700'
                      }`}
                    >
                      {/* 1. CÓDIGO */}
                      <td
                        className={`py-2 px-2 text-center whitespace-nowrap ${
                          isVencida ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'
                        }`}
                      >
                        {codigo}
                      </td>

                      {/* 2. Nº DE SÉRIE */}
                      <td
                        className={`py-2 px-2 text-center whitespace-nowrap ${
                          isVencida ? 'font-bold text-slate-900' : 'font-normal text-slate-700'
                        }`}
                      >
                        {numSerie}
                      </td>

                      {/* 3. ENDEREÇO COMPLETO */}
                      <td
                        className={`py-2 px-3 text-center leading-snug min-w-[200px] max-w-[340px] ${
                          isVencida ? 'font-bold text-slate-900' : 'font-normal text-slate-700'
                        }`}
                      >
                        {endereco}
                      </td>

                      {/* 4. BAIRRO */}
                      <td
                        className={`py-2 px-2.5 text-center whitespace-nowrap ${
                          isVencida ? 'font-bold text-slate-900' : 'font-normal text-slate-600'
                        }`}
                      >
                        {bairro}
                      </td>

                      {/* 5. VELOCIDADE FISCALIZADA */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {velocidade !== '-' ? (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 ${
                              isVencida ? 'font-bold' : 'font-semibold'
                            }`}
                          >
                            {velocidade}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* 6. AFERIÇÃO */}
                      <td
                        className={`py-2 px-2 text-center whitespace-nowrap ${
                          isVencida ? 'font-bold text-slate-900' : 'font-normal text-slate-700'
                        }`}
                      >
                        {dataAfericao}
                      </td>

                      {/* 7. VENCIMENTO DA AFERIÇÃO (BADGE CROMÁTICA) */}
                      <td className="py-2 px-2.5 text-center whitespace-nowrap">
                        {vencimentoStatus.isValid ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] tracking-tight ${vencimentoStatus.badgeClass}`}
                          >
                            {vencimentoStatus.formattedText}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* 8. PRAZO (PÍLULA COMPACTA COM QUEBRA EM ATÉ 2 LINHAS) */}
                      <td className="py-2 px-1 text-center min-w-[80px] max-w-[100px]">
                        {vencimentoStatus.isValid ? (
                          <span
                            className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-lg text-[10.5px] font-medium leading-tight whitespace-normal break-words max-w-[88px] mx-auto ${vencimentoStatus.statusPrazoBadgeClass}`}
                          >
                            {vencimentoStatus.statusPrazoText}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>

                      {/* 9. AÇÕES (BOTÃO OLHO PARA FICHA DO EQUIPAMENTO) */}
                      <td
                        className="py-2 px-1.5 text-center whitespace-nowrap w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectRecord(r)}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Ver ficha do equipamento"
                          aria-label="Ver ficha do equipamento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra inferior de paginação */}
        <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Página <strong className="text-slate-900">{currentPage}</strong> de{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium cursor-pointer transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 font-semibold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium cursor-pointer transition-colors"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
