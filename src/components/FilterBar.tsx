import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FilterState, ActiveTab } from '../types';
import {
  Search,
  RotateCcw,
  FilterX,
  Calendar,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Layers,
  Check
} from 'lucide-react';

interface FilterBarProps {
  activeTab?: ActiveTab;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableContratos: string[];
  availableRegionais: string[];
  availableBairros: string[];
  availableTipos: string[];
  availableSituacoes: string[];
  availableCondicoes: string[];
  availableOS: string[];
  availableCodigos: string[];
  totalFiltered: number;
  totalRecords: number;
  onReset: () => void;
  onClearAll: () => void;
}

interface MultiSelectCheckboxDropdownProps {
  label: string;
  icon?: React.ReactNode;
  placeholderAll: string;
  pluralItemName: string;
  singularItemName?: string;
  availableOptions: string[];
  selectedValues: string[];
  onChange: (newSelected: string[]) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  popoverWidthClass?: string;
  monoFont?: boolean;
}

const MultiSelectCheckboxDropdown: React.FC<MultiSelectCheckboxDropdownProps> = ({
  label,
  icon,
  placeholderAll,
  pluralItemName,
  singularItemName,
  availableOptions,
  selectedValues,
  onChange,
  showSearch = true,
  searchPlaceholder = 'Filtrar opções...',
  popoverWidthClass = 'w-72 sm:w-80',
  monoFont = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fechar popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return availableOptions;
    const q = searchTerm.toLowerCase();
    return availableOptions.filter((opt) => opt.toLowerCase().includes(q));
  }, [availableOptions, searchTerm]);

  const handleToggle = (option: string) => {
    const exists = selectedValues.includes(option);
    const nextSelected = exists
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];
    onChange(nextSelected);
  };

  const handleSelectAll = () => {
    onChange([...availableOptions]);
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        {selectedValues.length > 0 && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
            {selectedValues.length} selec.
          </span>
        )}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs border rounded-lg px-2.5 py-1.5 transition-all text-left cursor-pointer ${
          selectedValues.length > 0
            ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-400/30'
            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
        }`}
      >
        <span className="truncate pr-2">
          {selectedValues.length === 0
            ? `${placeholderAll} (${availableOptions.length})`
            : selectedValues.length === 1
            ? `${singularItemName ? `${singularItemName}: ` : ''}${selectedValues[0]}`
            : `${selectedValues.length} ${pluralItemName} selecionados`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 sm:right-auto top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl z-50 p-2.5 ${popoverWidthClass} max-w-[calc(100vw-2rem)]`}
        >
          {showSearch && (
            <div className="relative mb-2">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-7 py-1 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
            <span className="text-slate-500 font-medium">
              {selectedValues.length} de {availableOptions.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
              >
                Marcar Todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs italic">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={() => handleToggle(opt)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // tratado no label onClick
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={`flex-1 truncate ${monoFont ? 'font-mono' : ''}`}>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </label>
                );
              })
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Concluir ({selectedValues.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Função utilitária para aplicar máscara de data brasileira DD/MM/AAAA automaticamente
const maskDateInput = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  filters,
  setFilters,
  availableContratos,
  availableRegionais,
  availableBairros,
  availableTipos,
  availableSituacoes,
  availableCondicoes,
  availableOS,
  availableCodigos,
  totalFiltered,
  totalRecords,
  onReset,
  onClearAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Garantir que no mobile a barra de filtros inicie sempre recolhida ao mudar de aba
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsExpanded(false);
    }
  }, [activeTab]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const hasActiveFilters =
    filters.contrato !== 'PRESET_NOVOS' ||
    (filters.regionais && filters.regionais.length > 0) ||
    (filters.bairros && filters.bairros.length > 0) ||
    (filters.tipos && filters.tipos.length > 0) ||
    filters.regional !== 'ALL' ||
    filters.bairro !== 'ALL' ||
    filters.tipo !== 'ALL' ||
    filters.situacao !== 'ALL' ||
    filters.condicao !== 'ALL' ||
    filters.os !== 'ALL' ||
    (filters.codigos && filters.codigos.length > 0) ||
    filters.dataInicioStart !== '' ||
    filters.dataInicioEnd !== '' ||
    filters.dataAceiteStart !== '' ||
    filters.dataAceiteEnd !== '' ||
    filters.searchQuery !== '' ||
    filters.onlyWithCoords;

  if (activeTab === 'resumo') {
    return (
      <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Header row: Clicável para expandir/recolher em desktop e mobile */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between flex-wrap gap-2 cursor-pointer select-none p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            title={isExpanded ? 'Clique para recolher os filtros do resumo' : 'Clique para expandir os filtros do resumo'}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Filtros do Resumo Gerencial
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAll();
                }}
                className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors font-semibold cursor-pointer"
                title="Limpar filtros do resumo"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Filtros</span>
                <span className="sm:hidden">Limpar</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  !isExpanded
                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 shadow-2xs'
                }`}
                aria-expanded={isExpanded}
                title={isExpanded ? 'Recolher filtros' : 'Expandir filtros'}
              >
                <span className="font-bold">{isExpanded ? 'Recolher' : 'Expandir'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Content with smooth CSS max-height and opacity transition */}
          <div
            className={`transition-[max-height,opacity,margin,padding] duration-300 ease-in-out ${
              isExpanded
                ? 'max-h-[800px] opacity-100 overflow-visible pt-2 border-t border-slate-100'
                : 'max-h-0 opacity-0 overflow-hidden pointer-events-none pt-0 border-t-0'
            }`}
          >
            <div className="space-y-3">
              {/* Row 1: Status do equipamento, OS, Regional, Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* 1. STATUS DO EQUIPAMENTO */}
              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  STATUS DO EQUIPAMENTO
                </label>
                <select
                  value={filters.situacao}
                  onChange={(e) => handleFilterChange('situacao', e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                >
                  <option value="ALL">Todas as Situações ({availableSituacoes.length})</option>
                  {availableSituacoes.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('\n', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Nº DA OS */}
              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" /> NÚMERO DA OS
                </label>
                <select
                  value={filters.os}
                  onChange={(e) => handleFilterChange('os', e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                >
                  <option value="ALL">Todas as OS ({availableOS.length})</option>
                  {availableOS.map((osNum) => (
                    <option key={osNum} value={osNum}>
                      OS {osNum}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. REGIONAL (Caixa de Seleção Múltipla) */}
              <div className="lg:col-span-3">
                <MultiSelectCheckboxDropdown
                  label="REGIONAL"
                  placeholderAll="Todas as Regionais"
                  pluralItemName="regionais"
                  singularItemName="Regional"
                  availableOptions={availableRegionais}
                  selectedValues={filters.regionais || []}
                  onChange={(newSelected) => handleFilterChange('regionais', newSelected)}
                  searchPlaceholder="Filtrar regional..."
                />
              </div>

              {/* 4. BAIRRO (Caixa de Seleção Múltipla) */}
              <div className="lg:col-span-3">
                <MultiSelectCheckboxDropdown
                  label="BAIRRO"
                  placeholderAll="Todos os Bairros"
                  pluralItemName="bairros"
                  singularItemName="Bairro"
                  availableOptions={availableBairros}
                  selectedValues={filters.bairros || []}
                  onChange={(newSelected) => handleFilterChange('bairros', newSelected)}
                  searchPlaceholder="Filtrar bairro..."
                />
              </div>
            </div>

            {/* Row 2: Situação, Data Início de Operação, Data de Aceite */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100">
              {/* 5. SITUAÇÃO */}
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-slate-400" /> SITUAÇÃO
                </label>
                <select
                  value={filters.condicao}
                  onChange={(e) => handleFilterChange('condicao', e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="ALL">Todas ({availableCondicoes.length})</option>
                  {availableCondicoes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. DATA DE INÍCIO DE OPERAÇÃO */}
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> DATA DE INÍCIO DE OPERAÇÃO
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Início (DD/MM/AAAA)"
                    value={filters.dataInicioStart}
                    onChange={(e) => handleFilterChange('dataInicioStart', e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Fim (DD/MM/AAAA)"
                    value={filters.dataInicioEnd}
                    onChange={(e) => handleFilterChange('dataInicioEnd', e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* 7. DATA DE ACEITE */}
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> DATA DE ACEITE
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="text"
                    placeholder="Início (DD/MM/AAAA)"
                    value={filters.dataAceiteStart}
                    onChange={(e) => handleFilterChange('dataAceiteStart', e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Fim (DD/MM/AAAA)"
                    value={filters.dataAceiteEnd}
                    onChange={(e) => handleFilterChange('dataAceiteEnd', e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Filter Toggle Header Bar (Desktop & Mobile) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-2 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer select-none transition-colors"
          title={isExpanded ? 'Clique para recolher os campos de pesquisa e filtros' : 'Clique para expandir os campos de pesquisa e filtros'}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">Pesquisa e Filtros</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                Ativos
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAll();
                }}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 cursor-pointer"
                title="Limpar todos os filtros"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                !isExpanded
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
              aria-expanded={isExpanded}
              title={isExpanded ? 'Recolher campos de pesquisa e filtros' : 'Expandir campos de pesquisa e filtros'}
            >
              <span className="font-bold">{isExpanded ? 'Recolher' : 'Expandir'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Filters Wrapper with smooth CSS max-height and opacity transition */}
        <div
          className={`transition-[max-height,opacity,margin,padding] duration-300 ease-in-out ${
            isExpanded
              ? 'max-h-[1400px] opacity-100 overflow-visible pt-1'
              : 'max-h-0 opacity-0 overflow-hidden pointer-events-none pt-0'
          }`}
        >
          <div className="space-y-3">
          {/* Search & Main Filter Grid - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* Quick Search */}
          <div className="lg:col-span-3 relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              PESQUISA RÁPIDA
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Endereço, bairro, código, OS..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleFilterChange('searchQuery', '')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* CONTRATO */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              CONTRATO
            </label>
            <select
              value={filters.contrato}
              onChange={(e) => handleFilterChange('contrato', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              <optgroup label="Seleções Especiais / Padrão">
                <option value="PRESET_NOVOS">★ Contratos 2740/24, 2741/24 e 2742/24 (Padrão)</option>
                <option value="PRESET_ANTIGOS">Contratos 2586/20, 2585/20 e 2587/20</option>
                <option value="ALL">Todos os Contratos ({availableContratos.length})</option>
              </optgroup>
              <optgroup label="Contratos Individuais">
                {availableContratos.map((c) => (
                  <option key={c} value={c}>
                    Contrato {c}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* REGIONAL (Caixa de Seleção Múltipla) */}
          <div className="lg:col-span-3">
            <MultiSelectCheckboxDropdown
              label="REGIONAL"
              placeholderAll="Todas as Regionais"
              pluralItemName="regionais"
              singularItemName="Regional"
              availableOptions={availableRegionais}
              selectedValues={filters.regionais || []}
              onChange={(newSelected) => handleFilterChange('regionais', newSelected)}
              searchPlaceholder="Filtrar regional..."
            />
          </div>

          {/* BAIRRO (Caixa de Seleção Múltipla) */}
          <div className="lg:col-span-3">
            <MultiSelectCheckboxDropdown
              label="BAIRRO"
              placeholderAll="Todos os Bairros"
              pluralItemName="bairros"
              singularItemName="Bairro"
              availableOptions={availableBairros}
              selectedValues={filters.bairros || []}
              onChange={(newSelected) => handleFilterChange('bairros', newSelected)}
              searchPlaceholder="Filtrar bairro..."
            />
          </div>

        </div>

        {/* Second Filter Row - TIPO (Multi-select), SITUAÇÃO, OS Dropdown & CÓDIGO Multi-Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* TIPO DE EQUIPAMENTO (Caixa de Seleção Múltipla) */}
          <div className="lg:col-span-3">
            <MultiSelectCheckboxDropdown
              label="TIPO DE EQUIPAMENTO"
              placeholderAll="Todos os Tipos"
              pluralItemName="tipos"
              singularItemName="Tipo"
              availableOptions={availableTipos}
              selectedValues={filters.tipos || []}
              onChange={(newSelected) => handleFilterChange('tipos', newSelected)}
              searchPlaceholder="Filtrar tipo..."
            />
          </div>

          {/* STATUS DO EQUIPAMENTO Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              STATUS DO EQUIPAMENTO
            </label>
            <select
              value={filters.situacao}
              onChange={(e) => handleFilterChange('situacao', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todas as Situações ({availableSituacoes.length})</option>
              {availableSituacoes.map((s) => (
                <option key={s} value={s}>
                  {s.replace('\n', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* NÚMERO DA OS (Dropdown) */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> NÚMERO DA OS
            </label>
            <select
              value={filters.os}
              onChange={(e) => handleFilterChange('os', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              <option value="ALL">Todas as OS ({availableOS.length})</option>
              {availableOS.map((osNum) => (
                <option key={osNum} value={osNum}>
                  OS {osNum}
                </option>
              ))}
            </select>
          </div>

          {/* SELEÇÃO DE EQUIPAMENTOS (Múltipla Seleção) */}
          <div className="lg:col-span-4">
            <MultiSelectCheckboxDropdown
              label="SELEÇÃO DE EQUIPAMENTOS"
              icon={<Layers className="w-3 h-3 text-blue-500" />}
              placeholderAll="Todos os Equipamentos"
              pluralItemName="equipamentos"
              singularItemName="Código"
              availableOptions={availableCodigos}
              selectedValues={filters.codigos || []}
              onChange={(newSelected) => handleFilterChange('codigos', newSelected)}
              searchPlaceholder="Filtrar códigos..."
              monoFont={true}
            />
          </div>

        </div>

        {/* Third Filter Row - SITUAÇÃO, DATA INÍCIO DE OPERAÇÃO, DATA DE ACEITE & APENAS COM COORDENADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100">
          
          {/* SITUAÇÃO (Condição de Implantação) */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-slate-400" /> SITUAÇÃO
            </label>
            <select
              value={filters.condicao}
              onChange={(e) => handleFilterChange('condicao', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              <option value="ALL">Todas ({availableCondicoes.length})</option>
              {availableCondicoes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* DATA DE INÍCIO DE OPERAÇÃO */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> INÍCIO DE OPERAÇÃO
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="text"
                placeholder="Início (DD/MM/AAAA)"
                maxLength={10}
                inputMode="numeric"
                value={filters.dataInicioStart}
                onChange={(e) => handleFilterChange('dataInicioStart', maskDateInput(e.target.value))}
                className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <input
                type="text"
                placeholder="Fim (DD/MM/AAAA)"
                maxLength={10}
                inputMode="numeric"
                value={filters.dataInicioEnd}
                onChange={(e) => handleFilterChange('dataInicioEnd', maskDateInput(e.target.value))}
                className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* DATA DE ACEITE */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> ACEITE
            </label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="text"
                placeholder="Início (DD/MM/AAAA)"
                maxLength={10}
                inputMode="numeric"
                value={filters.dataAceiteStart}
                onChange={(e) => handleFilterChange('dataAceiteStart', maskDateInput(e.target.value))}
                className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <input
                type="text"
                placeholder="Fim (DD/MM/AAAA)"
                maxLength={10}
                inputMode="numeric"
                value={filters.dataAceiteEnd}
                onChange={(e) => handleFilterChange('dataAceiteEnd', maskDateInput(e.target.value))}
                className="w-full text-[11px] bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* APENAS COM COORDENADAS */}
          <div className="lg:col-span-3 flex items-end">
            <label className={`flex items-center gap-2 text-xs border rounded-lg px-2.5 py-1.5 w-full cursor-pointer transition-all ${
              filters.onlyWithCoords
                ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-400/30'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}>
              <input
                type="checkbox"
                checked={filters.onlyWithCoords}
                onChange={(e) => handleFilterChange('onlyWithCoords', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <MapPin className={`w-3.5 h-3.5 ${filters.onlyWithCoords ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="font-medium truncate">Apenas com Coordenadas</span>
            </label>
          </div>

        </div>

        {/* Action Buttons & Active Filter Chips Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
          
          {/* Active Chips for Selected Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tipos Chips */}
            {filters.tipos && filters.tipos.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Tipos:</span>
                {filters.tipos.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200"
                  >
                    {t}
                    <button
                      onClick={() => handleFilterChange('tipos', filters.tipos.filter((item) => item !== t))}
                      className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      title={`Remover tipo ${t}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.tipos.length > 3 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    +{filters.tipos.length - 3} mais
                  </span>
                )}
                <button
                  onClick={() => handleFilterChange('tipos', [])}
                  className="text-[10px] text-rose-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Regionais Chips */}
            {filters.regionais && filters.regionais.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Regionais:</span>
                {filters.regionais.slice(0, 3).map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    {r}
                    <button
                      onClick={() => handleFilterChange('regionais', filters.regionais.filter((item) => item !== r))}
                      className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      title={`Remover regional ${r}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.regionais.length > 3 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    +{filters.regionais.length - 3} mais
                  </span>
                )}
                <button
                  onClick={() => handleFilterChange('regionais', [])}
                  className="text-[10px] text-rose-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Bairros Chips */}
            {filters.bairros && filters.bairros.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Bairros:</span>
                {filters.bairros.slice(0, 3).map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200"
                  >
                    {b}
                    <button
                      onClick={() => handleFilterChange('bairros', filters.bairros.filter((item) => item !== b))}
                      className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      title={`Remover bairro ${b}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.bairros.length > 3 && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    +{filters.bairros.length - 3} mais
                  </span>
                )}
                <button
                  onClick={() => handleFilterChange('bairros', [])}
                  className="text-[10px] text-rose-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Active Chips for Selected Codigos */}
            {filters.codigos && filters.codigos.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Códigos:</span>
                {filters.codigos.slice(0, 4).map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-200"
                  >
                    {code}
                    <button
                      onClick={() => handleFilterChange('codigos', filters.codigos.filter((c) => c !== code))}
                      className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      title="Remover este código"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.codigos.length > 4 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    +{filters.codigos.length - 4} mais
                  </span>
                )}
                <button
                  onClick={() => handleFilterChange('codigos', [])}
                  className="text-[10px] text-rose-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            )}

            {/* Situação / Condição Chip */}
            {filters.condicao !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                Situação: {filters.condicao}
                <button
                  onClick={() => handleFilterChange('condicao', 'ALL')}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Remover filtro de situação"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Início de Operação Chip */}
            {(filters.dataInicioStart || filters.dataInicioEnd) && (
              <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-cyan-200">
                Início: {filters.dataInicioStart || '...'} a {filters.dataInicioEnd || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('dataInicioStart', '');
                    handleFilterChange('dataInicioEnd', '');
                  }}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Limpar período de início de operação"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Aceite Chip */}
            {(filters.dataAceiteStart || filters.dataAceiteEnd) && (
              <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                Aceite: {filters.dataAceiteStart || '...'} a {filters.dataAceiteEnd || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('dataAceiteStart', '');
                    handleFilterChange('dataAceiteEnd', '');
                  }}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Limpar período de aceite"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Apenas com Coordenadas Chip */}
            {filters.onlyWithCoords && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                <MapPin className="w-3 h-3 text-blue-600" /> Com Coordenadas
                <button
                  onClick={() => handleFilterChange('onlyWithCoords', false)}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  title="Remover filtro de coordenadas"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors font-semibold shadow-2xs cursor-pointer"
              title="Limpar todos os campos, pesquisas e seleções (mantém seleção padrão de contratos 2740/24, 2741/24 e 2742/24)"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          </div>

        </div>

        {/* Filter Summary Badges */}
        {(filters.contrato === 'PRESET_NOVOS' || (hasActiveFilters && filters.contrato !== 'PRESET_NOVOS')) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.contrato === 'PRESET_NOVOS' && (
                <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  Filtro Padrão Ativo: Contratos 2740/24, 2741/24 e 2742/24
                </span>
              )}
              {hasActiveFilters && filters.contrato !== 'PRESET_NOVOS' && (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  Filtros Personalizados
                </span>
              )}
            </div>
          </div>
        )}

          </div>
        </div>

      </div>
    </div>
  );
};
