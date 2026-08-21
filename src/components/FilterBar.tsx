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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCodigoPopoverOpen, setIsCodigoPopoverOpen] = useState(false);
  const [codigoSearch, setCodigoSearch] = useState('');
  const codigoPopoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (codigoPopoverRef.current && !codigoPopoverRef.current.contains(event.target as Node)) {
        setIsCodigoPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Multi-select equipment code helpers
  const filteredAvailableCodigos = useMemo(() => {
    if (!codigoSearch.trim()) return availableCodigos;
    const q = codigoSearch.toLowerCase();
    return availableCodigos.filter((c) => c.toLowerCase().includes(q));
  }, [availableCodigos, codigoSearch]);

  const handleToggleCodigo = (code: string) => {
    setFilters((prev) => {
      const exists = prev.codigos.includes(code);
      const nextCodigos = exists
        ? prev.codigos.filter((c) => c !== code)
        : [...prev.codigos, code];
      return {
        ...prev,
        codigos: nextCodigos,
      };
    });
  };

  const handleSelectAllCodigos = () => {
    setFilters((prev) => ({
      ...prev,
      codigos: [...availableCodigos],
    }));
  };

  const handleClearCodigos = () => {
    setFilters((prev) => ({
      ...prev,
      codigos: [],
    }));
  };

  const hasActiveFilters =
    filters.contrato !== 'PRESET_NOVOS' ||
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
      <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Filtros do Resumo Gerencial
            </span>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors font-semibold cursor-pointer"
              title="Limpar filtros do resumo"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          </div>

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

            {/* 3. REGIONAL */}
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                REGIONAL
              </label>
              <select
                value={filters.regional}
                onChange={(e) => handleFilterChange('regional', e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="ALL">Todas ({availableRegionais.length})</option>
                {availableRegionais.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. BAIRRO */}
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                BAIRRO
              </label>
              <select
                value={filters.bairro}
                onChange={(e) => handleFilterChange('bairro', e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white truncate"
              >
                <option value="ALL">Todos ({availableBairros.length})</option>
                {availableBairros.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
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

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="font-medium text-slate-700">
              Exibindo <span className="text-blue-700 font-bold">{totalFiltered}</span> de {totalRecords} equipamentos no Resumo
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-3">
        
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

          {/* REGIONAL Dropdown */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              REGIONAL
            </label>
            <select
              value={filters.regional}
              onChange={(e) => handleFilterChange('regional', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todas ({availableRegionais.length})</option>
              {availableRegionais.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* BAIRRO Dropdown */}
          <div className="lg:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              BAIRRO
            </label>
            <select
              value={filters.bairro}
              onChange={(e) => handleFilterChange('bairro', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white truncate"
            >
              <option value="ALL">Todos ({availableBairros.length})</option>
              {availableBairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Second Filter Row - TIPO, SITUAÇÃO, OS Dropdown & CÓDIGO Multi-Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* TIPO Dropdown */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              TIPO DE EQUIPAMENTO
            </label>
            <select
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="ALL">Todos os Tipos ({availableTipos.length})</option>
              {availableTipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
          <div className="lg:col-span-4 relative" ref={codigoPopoverRef}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-500" /> SELEÇÃO DE EQUIPAMENTOS
              </span>
              {filters.codigos.length > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                  {filters.codigos.length} selec.
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={() => setIsCodigoPopoverOpen(!isCodigoPopoverOpen)}
              className={`w-full flex items-center justify-between text-xs border rounded-lg px-2.5 py-1.5 transition-all text-left cursor-pointer ${
                filters.codigos.length > 0
                  ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-400/30'
                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span className="truncate pr-2">
                {filters.codigos.length === 0
                  ? `Seleção de Equipamentos (${availableCodigos.length})`
                  : filters.codigos.length === 1
                  ? `Código: ${filters.codigos[0]}`
                  : `${filters.codigos.length} equipamentos selecionados`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isCodigoPopoverOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {isCodigoPopoverOpen && (
              <div className="absolute left-0 sm:right-auto top-full mt-1.5 bg-white border border-slate-300 rounded-xl shadow-xl z-50 p-2.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)]">
                {/* Search inside list */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Filtrar códigos..."
                    value={codigoSearch}
                    onChange={(e) => setCodigoSearch(e.target.value)}
                    className="w-full pl-7 pr-7 py-1 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  {codigoSearch && (
                    <button
                      onClick={() => setCodigoSearch('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Selection Action Bar */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {filters.codigos.length} de {availableCodigos.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCodigos}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearCodigos}
                      className="text-rose-600 hover:text-rose-800 font-semibold hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Scrollable Checkbox List */}
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
                  {filteredAvailableCodigos.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs italic">
                      Nenhum código encontrado
                    </div>
                  ) : (
                    filteredAvailableCodigos.map((code) => {
                      const isSelected = filters.codigos.includes(code);
                      return (
                        <label
                          key={code}
                          onClick={() => handleToggleCodigo(code)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by label onClick
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="flex-1 font-mono">{code}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Done Button */}
                <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCodigoPopoverOpen(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Concluir ({filters.codigos.length})
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
          
          {/* Active Chips for Selected Codigos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filters.codigos.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Códigos filtrados:</span>
                {filters.codigos.slice(0, 5).map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-blue-200"
                  >
                    {code}
                    <button
                      onClick={() => handleToggleCodigo(code)}
                      className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      title="Remover este código"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {filters.codigos.length > 5 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    +{filters.codigos.length - 5} mais
                  </span>
                )}
                <button
                  onClick={handleClearCodigos}
                  className="text-[10px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Limpar seleção
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                showAdvanced || filters.dataInicioStart || filters.dataAceiteStart || filters.condicao !== 'ALL' || filters.onlyWithCoords
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Menos Filtros' : 'Datas/Cond.'}</span>
            </button>

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

        {/* Secondary Row: Expanded Filters (Condição, Datas de Início e Aceite) */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border">
            
            {/* Situação */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-slate-400" /> SITUAÇÃO
              </label>
              <select
                value={filters.condicao}
                onChange={(e) => handleFilterChange('condicao', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
              >
                <option value="ALL">Todas ({availableCondicoes.length})</option>
                {availableCondicoes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Data De Início de Operação */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> INÍCIO DE OPERAÇÃO
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  placeholder="Início (DD/MM/AAAA)"
                  value={filters.dataInicioStart}
                  onChange={(e) => handleFilterChange('dataInicioStart', e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Fim (DD/MM/AAAA)"
                  value={filters.dataInicioEnd}
                  onChange={(e) => handleFilterChange('dataInicioEnd', e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>
            </div>

            {/* Data de Aceite */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> ACEITE
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  placeholder="Início (DD/MM/AAAA)"
                  value={filters.dataAceiteStart}
                  onChange={(e) => handleFilterChange('dataAceiteStart', e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Fim (DD/MM/AAAA)"
                  value={filters.dataAceiteEnd}
                  onChange={(e) => handleFilterChange('dataAceiteEnd', e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>
            </div>

            {/* Coordinates Filter Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg p-2 w-full cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={filters.onlyWithCoords}
                  onChange={(e) => handleFilterChange('onlyWithCoords', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Apenas com Coordenadas</span>
              </label>
            </div>

          </div>
        )}

        {/* Filter Summary Badge */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-700">
              Exibindo <span className="text-blue-700 font-bold">{totalFiltered}</span> de {totalRecords} equipamentos
            </span>
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

      </div>
    </div>
  );
};
