import React, { useState, useMemo, useEffect, useRef } from 'react';
import { EquipmentRecord } from '../types';
import { Printer, X, CheckSquare, Search, Calendar, FileText, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { exportCustomReportPDF } from '../utils/pdfExport';
import { parseBRDate } from '../services/dataService';

interface SearchableDropdownProps {
  title: string;
  options: string[];
  selected: Set<string>;
  setter: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterText: string;
  setFilterText: React.Dispatch<React.SetStateAction<string>>;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  title,
  options,
  selected,
  setter,
  filterText,
  setFilterText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()));

  const toggleOption = (val: string) => {
    const newSet = new Set(selected);
    if (newSet.has(val)) newSet.delete(val);
    else newSet.add(val);
    setter(newSet);
  };

  return (
    <div className="relative bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-600" /> {title}
          {selected.size > 0 && <span className="ml-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full">{selected.size} selecionados</span>}
        </h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 flex flex-col">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full text-xs border-slate-200 rounded-lg shadow-2xs focus:border-blue-500 focus:ring-blue-500 mb-3 shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-2 custom-scrollbar" style={{ maxHeight: '15rem' }}>
            {filteredOptions.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-slate-900 transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={selected.has(opt)}
                  onChange={() => toggleOption(opt)}
                />
                <span className="truncate" title={opt}>{opt}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && <span className="text-xs text-slate-400">Nenhum resultado</span>}
          </div>
        </div>
      )}
    </div>
  );
};

interface ReportViewProps {
  records: EquipmentRecord[];
}

export const ReportView: React.FC<ReportViewProps> = ({ records }) => {
  const [selectedContratos, setSelectedContratos] = useState<Set<string>>(new Set(['2740/24', '2741/24', '2742/24']));
  const [contratoFilterText, setContratoFilterText] = useState('');
  const [selectedCondicoes, setSelectedCondicoes] = useState<Set<string>>(new Set());
  const [condicaoFilterText, setCondicaoFilterText] = useState('');
  const [selectedSituacoes, setSelectedSituacoes] = useState<Set<string>>(new Set());
  const [situacaoFilterText, setSituacaoFilterText] = useState('');
  const [selectedRegionais, setSelectedRegionais] = useState<Set<string>>(new Set());
  const [regionalFilterText, setRegionalFilterText] = useState('');
  
  const [selectedBairros, setSelectedBairros] = useState<Set<string>>(new Set());
  const [bairroFilterText, setBairroFilterText] = useState('');
  const [selectedTipos, setSelectedTipos] = useState<Set<string>>(new Set());
  const [tipoFilterText, setTipoFilterText] = useState('');
  const [selectedOS, setSelectedOS] = useState<Set<string>>(new Set());
  const [osFilterText, setOsFilterText] = useState('');
  
  const [selectedCodigos, setSelectedCodigos] = useState<Set<string>>(new Set());
  const [codigoFilterText, setCodigoFilterText] = useState('');
  const [selectedCorredores, setSelectedCorredores] = useState<Set<string>>(new Set());
  const [corredorFilterText, setCorredorFilterText] = useState('');
  
  const [dataInicioDe, setDataInicioDe] = useState('');
  const [dataInicioAte, setDataInicioAte] = useState('');
  const [dataAceiteDe, setDataAceiteDe] = useState('');
  const [dataAceiteAte, setDataAceiteAte] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  // Extract unique options
  const options = useMemo(() => {
    const convertInputDate = (d: string) => {
      if (!d) return null;
      const parts = d.split('-');
      return parseBRDate(`${parts[2]}/${parts[1]}/${parts[0]}`)?.getTime();
    };

    const inicioDe = convertInputDate(dataInicioDe);
    const inicioAte = convertInputDate(dataInicioAte);
    const aceiteDe = convertInputDate(dataAceiteDe);
    const aceiteAte = convertInputDate(dataAceiteAte);

    const matches = (r: EquipmentRecord, excludeField: string) => {
      if (excludeField !== 'contrato' && selectedContratos.size > 0 && (!r.CONTRATO || !selectedContratos.has(r.CONTRATO))) return false;
      if (excludeField !== 'condicao' && selectedCondicoes.size > 0 && (!r.CONDIÇÃO || !selectedCondicoes.has(r.CONDIÇÃO))) return false;
      if (excludeField !== 'situacao' && selectedSituacoes.size > 0 && (!r.Situação || !selectedSituacoes.has(r.Situação))) return false;
      if (excludeField !== 'regional' && selectedRegionais.size > 0 && (!r.REGIONAL || !selectedRegionais.has(r.REGIONAL))) return false;
      if (excludeField !== 'bairro' && selectedBairros.size > 0 && (!r.BAIRRO || !selectedBairros.has(r.BAIRRO))) return false;
      if (excludeField !== 'tipo' && selectedTipos.size > 0 && (!r.TIPO || !selectedTipos.has(r.TIPO))) return false;
      if (excludeField !== 'os' && selectedOS.size > 0 && (!r.OS || !selectedOS.has(r.OS))) return false;
      if (excludeField !== 'codigo' && selectedCodigos.size > 0 && (!r.CÓDIGO || !selectedCodigos.has(r.CÓDIGO))) return false;
      if (excludeField !== 'corredor' && selectedCorredores.size > 0 && (!r.CORREDOR || !selectedCorredores.has(r.CORREDOR))) return false;

      if (inicioDe || inicioAte) {
        const rowDate = parseBRDate(r['Data início operação'] || r.rawFields['INÍCIO OPERAÇÃO'] || '')?.getTime();
        if (rowDate) {
          if (inicioDe && rowDate < inicioDe) return false;
          if (inicioAte && rowDate > inicioAte) return false;
        } else {
           return false;
        }
      }

      if (aceiteDe || aceiteAte) {
        const rowDate = parseBRDate(r['Data de aceite'] || r.rawFields['DATA DO ACEITE'] || '')?.getTime();
        if (rowDate) {
          if (aceiteDe && rowDate < aceiteDe) return false;
          if (aceiteAte && rowDate > aceiteAte) return false;
        } else {
           return false;
        }
      }

      return true;
    };

    const contratos = new Set<string>();
    const condicoes = new Set<string>();
    const situacoes = new Set<string>();
    const regionais = new Set<string>();
    const codigos = new Set<string>();
    const corredores = new Set<string>();
    const bairros = new Set<string>();
    const tipos = new Set<string>();
    const os = new Set<string>();

    records.forEach(r => {
      if (r.CONTRATO && matches(r, 'contrato')) contratos.add(r.CONTRATO);
      if (r.CONDIÇÃO && matches(r, 'condicao')) condicoes.add(r.CONDIÇÃO);
      if (r.Situação && matches(r, 'situacao')) situacoes.add(r.Situação);
      if (r.REGIONAL && matches(r, 'regional')) regionais.add(r.REGIONAL);
      if (r.CÓDIGO && matches(r, 'codigo')) codigos.add(r.CÓDIGO);
      if (r.CORREDOR && matches(r, 'corredor')) corredores.add(r.CORREDOR);
      if (r.BAIRRO && matches(r, 'bairro')) bairros.add(r.BAIRRO);
      if (r.TIPO && matches(r, 'tipo')) tipos.add(r.TIPO);
      if (r.OS && matches(r, 'os')) os.add(r.OS);
    });

    return {
      contratos: Array.from(contratos).sort(),
      condicoes: Array.from(condicoes).sort(),
      situacoes: Array.from(situacoes).sort(),
      regionais: Array.from(regionais).sort(),
      bairros: Array.from(bairros).sort(),
      tipos: Array.from(tipos).sort(),
      os: Array.from(os).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      codigos: Array.from(codigos).sort(),
      corredores: Array.from(corredores).sort()
    };
  }, [
    records,
    selectedContratos, selectedCondicoes, selectedSituacoes, selectedRegionais,
    selectedCodigos, selectedCorredores, selectedBairros, selectedTipos, selectedOS,
    dataInicioDe, dataInicioAte, dataAceiteDe, dataAceiteAte
  ]);

  const handleClearFilters = () => {
    setSelectedContratos(new Set(['2740/24', '2741/24', '2742/24']));
    setSelectedCondicoes(new Set());
    setSelectedSituacoes(new Set());
    setSelectedRegionais(new Set());
    setSelectedBairros(new Set());
    setSelectedTipos(new Set());
    setSelectedOS(new Set());
    setSelectedCodigos(new Set());
    setSelectedCorredores(new Set());
    setDataInicioDe('');
    setDataInicioAte('');
    setDataAceiteDe('');
    setDataAceiteAte('');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const filtered = records.filter(r => {
        if (selectedContratos.size > 0 && (!r.CONTRATO || !selectedContratos.has(r.CONTRATO))) return false;
        if (selectedCondicoes.size > 0 && (!r.CONDIÇÃO || !selectedCondicoes.has(r.CONDIÇÃO))) return false;
        if (selectedSituacoes.size > 0 && (!r.Situação || !selectedSituacoes.has(r.Situação))) return false;
        if (selectedRegionais.size > 0 && (!r.REGIONAL || !selectedRegionais.has(r.REGIONAL))) return false;
        if (selectedBairros.size > 0 && (!r.BAIRRO || !selectedBairros.has(r.BAIRRO))) return false;
        if (selectedTipos.size > 0 && (!r.TIPO || !selectedTipos.has(r.TIPO))) return false;
        if (selectedOS.size > 0 && (!r.OS || !selectedOS.has(r.OS))) return false;
        
        if (selectedCodigos.size > 0 && (!r.CÓDIGO || !selectedCodigos.has(r.CÓDIGO))) return false;
        if (selectedCorredores.size > 0 && (!r.CORREDOR || !selectedCorredores.has(r.CORREDOR))) return false;

        // Date filtering
        const convertInputDate = (d: string) => {
          if (!d) return null;
          const parts = d.split('-');
          return parseBRDate(`${parts[2]}/${parts[1]}/${parts[0]}`)?.getTime();
        };

        if (dataInicioDe || dataInicioAte) {
          const rowDate = parseBRDate(r['Data início operação'] || r.rawFields['INÍCIO OPERAÇÃO'] || '')?.getTime();
          if (rowDate) {
            const start = convertInputDate(dataInicioDe);
            const end = convertInputDate(dataInicioAte);
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
          } else {
             return false;
          }
        }

        if (dataAceiteDe || dataAceiteAte) {
          const rowDate = parseBRDate(r['Data de aceite'] || r.rawFields['DATA DO ACEITE'] || '')?.getTime();
          if (rowDate) {
            const start = convertInputDate(dataAceiteDe);
            const end = convertInputDate(dataAceiteAte);
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
          } else {
             return false;
          }
        }

        return true;
      });

      const formatDataForPDF = (d: string) => {
        if (!d) return '';
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
      };

      const filtersApplied = {
        contratos: Array.from(selectedContratos),
        condicoes: Array.from(selectedCondicoes),
        situacoes: Array.from(selectedSituacoes),
        regionais: Array.from(selectedRegionais),
        bairros: Array.from(selectedBairros),
        tipos: Array.from(selectedTipos),
        os: Array.from(selectedOS),
        corredores: Array.from(selectedCorredores),
        codigo: Array.from(selectedCodigos).join(', '),
        inicioOp: { de: formatDataForPDF(dataInicioDe), ate: formatDataForPDF(dataInicioAte) },
        aceite: { de: formatDataForPDF(dataAceiteDe), ate: formatDataForPDF(dataAceiteAte) }
      };

      await exportCustomReportPDF(filtered, filtersApplied);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório.');
    }
    setIsGenerating(false);
  };

  const currentFiltersSummary = useMemo(() => {
    let text = '';
    if (selectedCodigos.size > 0) text += `Códigos: ${Array.from(selectedCodigos).join(', ')}; `;
    if (selectedCorredores.size > 0) text += `Corredores: ${Array.from(selectedCorredores).join(', ')}; `;
    if (selectedContratos.size > 0) text += `Contratos: ${Array.from(selectedContratos).join(', ')}; `;
    if (selectedSituacoes.size > 0) text += `Status do equipamento: ${Array.from(selectedSituacoes).join(', ')}; `;
    if (selectedCondicoes.size > 0) text += `Situações: ${Array.from(selectedCondicoes).join(', ')}; `;
    if (selectedRegionais.size > 0) text += `Regionais: ${Array.from(selectedRegionais).join(', ')}; `;
    if (selectedBairros.size > 0) text += `Bairros: ${Array.from(selectedBairros).join(', ')}; `;
    if (selectedTipos.size > 0) text += `Tipo de equipamento: ${Array.from(selectedTipos).join(', ')}; `;
    if (selectedOS.size > 0) text += `Nº Ordem de Serviço: ${Array.from(selectedOS).join(', ')}; `;
    
    if (dataInicioDe || dataInicioAte) {
      const formatData = (d: string) => {
        if (!d) return '---';
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
      };
      text += `Início de Operação: ${formatData(dataInicioDe)} até ${formatData(dataInicioAte)}; `;
    }
    if (dataAceiteDe || dataAceiteAte) {
      const formatData = (d: string) => {
        if (!d) return '---';
        const parts = d.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
      };
      text += `Aceite: ${formatData(dataAceiteDe)} até ${formatData(dataAceiteAte)}; `;
    }
    
    return text || 'Relatório Global (Nenhum filtro aplicado)';
  }, [
    selectedCodigos, selectedCorredores, selectedContratos, selectedSituacoes, 
    selectedCondicoes, selectedRegionais, selectedBairros, selectedTipos, selectedOS,
    dataInicioDe, dataInicioAte, dataAceiteDe, dataAceiteAte
  ]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Emissão de Relatórios
          </h1>
          <p className="text-slate-500 mt-1">Configure os filtros abaixo para gerar um relatório executivo em PDF.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <Printer className="w-5 h-5" />
          {isGenerating ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
        </button>
      </div>

      {/* Current Filters Summary Bar */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm text-sm text-blue-900">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <Filter className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900">Filtros Selecionados:</span>
              <p className="mt-1 text-blue-800 leading-relaxed">
                {currentFiltersSummary}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-sm"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Coluna 1: Contratos, Corredor, Equipamentos */}
        <div className="space-y-6">
          <SearchableDropdown
            title="Contratos"
            options={options.contratos}
            selected={selectedContratos}
            setter={setSelectedContratos}
            filterText={contratoFilterText}
            setFilterText={setContratoFilterText}
          />
          <SearchableDropdown
            title="Selecionar Corredor"
            options={options.corredores}
            selected={selectedCorredores}
            setter={setSelectedCorredores}
            filterText={corredorFilterText}
            setFilterText={setCorredorFilterText}
          />
          <SearchableDropdown
            title="Equipamentos"
            options={options.codigos}
            selected={selectedCodigos}
            setter={setSelectedCodigos}
            filterText={codigoFilterText}
            setFilterText={setCodigoFilterText}
          />
        </div>

        {/* Coluna 2: Tipos, Bairros, Regionais */}
        <div className="space-y-6">
          <SearchableDropdown
            title="Tipo de equipamento"
            options={options.tipos}
            selected={selectedTipos}
            setter={setSelectedTipos}
            filterText={tipoFilterText}
            setFilterText={setTipoFilterText}
          />
          <SearchableDropdown
            title="Bairros"
            options={options.bairros}
            selected={selectedBairros}
            setter={setSelectedBairros}
            filterText={bairroFilterText}
            setFilterText={setBairroFilterText}
          />
          <SearchableDropdown
            title="Regionais"
            options={options.regionais}
            selected={selectedRegionais}
            setter={setSelectedRegionais}
            filterText={regionalFilterText}
            setFilterText={setRegionalFilterText}
          />
        </div>
        
        {/* Coluna 3: Situação, Condição, OS */}
        <div className="space-y-6">
          <SearchableDropdown
            title="Status do equipamento"
            options={options.situacoes}
            selected={selectedSituacoes}
            setter={setSelectedSituacoes}
            filterText={situacaoFilterText}
            setFilterText={setSituacaoFilterText}
          />
          <SearchableDropdown
            title="Situação"
            options={options.condicoes}
            selected={selectedCondicoes}
            setter={setSelectedCondicoes}
            filterText={condicaoFilterText}
            setFilterText={setCondicaoFilterText}
          />
          <SearchableDropdown
            title="Nº Ordem de Serviço"
            options={options.os}
            selected={selectedOS}
            setter={setSelectedOS}
            filterText={osFilterText}
            setFilterText={setOsFilterText}
          />
        </div>

        {/* Coluna 4: Períodos */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Períodos
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Início de Operação</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">De</label>
                    <input type="date" value={dataInicioDe} onChange={e => setDataInicioDe(e.target.value)} className="w-full text-xs rounded-md border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Até</label>
                    <input type="date" value={dataInicioAte} onChange={e => setDataInicioAte(e.target.value)} className="w-full text-xs rounded-md border-slate-300" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Aceite</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">De</label>
                    <input type="date" value={dataAceiteDe} onChange={e => setDataAceiteDe(e.target.value)} className="w-full text-xs rounded-md border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Até</label>
                    <input type="date" value={dataAceiteAte} onChange={e => setDataAceiteAte(e.target.value)} className="w-full text-xs rounded-md border-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
