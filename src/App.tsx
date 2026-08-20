import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ActiveTab, EquipmentRecord, FilterState } from './types';
import { fetchEquipmentData, parseBRDate } from './services/dataService';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { IndicatorsView } from './components/IndicatorsView';
import { TableView } from './components/TableView';
import { GestaoContratualView } from './components/GestaoContratualView';
import { InterrupcoesView } from './components/InterrupcoesView';
import { BHDigitalView } from './components/BHDigitalView';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { ReportView } from './components/ReportView';
import { FooterLegend } from './components/FooterLegend';
import { MobileBottomNav } from './components/MobileBottomNav';
import { VercelGuideModal } from './components/VercelGuideModal';
import { LockScreen } from './components/LockScreen';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const initialFilters: FilterState = {
  contrato: 'PRESET_NOVOS',
  regional: 'ALL',
  bairro: 'ALL',
  tipo: 'ALL',
  situacao: 'ALL',
  condicao: 'ALL',
  os: 'ALL',
  codigos: [],
  dataInicioStart: '',
  dataInicioEnd: '',
  dataAceiteStart: '',
  dataAceiteEnd: '',
  searchQuery: '',
  onlyWithCoords: false,
};

const emptyFilters: FilterState = {
  contrato: 'PRESET_NOVOS', // Mantém seleção dos contratos 2740/24, 2741/24 e 2742/24
  regional: 'ALL',
  bairro: 'ALL',
  tipo: 'ALL',
  situacao: 'ALL',
  condicao: 'ALL',
  os: 'ALL',
  codigos: [],
  dataInicioStart: '',
  dataInicioEnd: '',
  dataAceiteStart: '',
  dataAceiteEnd: '',
  searchQuery: '',
  onlyWithCoords: false,
};

export default function App() {
  useEffect(() => {
    document.title = "GEAPI-FE";
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('geapi_portal_auth') === 'GEAPIFE_AUTHORIZED';
  });

  const [records, setRecords] = useState<EquipmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<ActiveTab>('mapa');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [resetSignal, setResetSignal] = useState<number>(0);
  
  const [selectedRecord, setSelectedRecord] = useState<EquipmentRecord | null>(null);
  const [isVercelGuideOpen, setIsVercelGuideOpen] = useState<boolean>(false);

  // Load data from published Google Sheet CSV
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEquipmentData();
      setRecords(data.records);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error('Failed to load Google Sheet:', err);
      setError('Não foi possível carregar os dados da planilha do Google. Verifique a conexão com a internet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Atualização automática em segundo plano a cada 3 minutos
    const interval = setInterval(() => {
      loadData();
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Helper function for crossed filters
  const recordMatchesFilters = (r: EquipmentRecord, currentFilters: FilterState, excludeKey?: string): boolean => {
    const novosContratos = ['2740/24', '2741/24', '2742/24'];
    const antigosContratos = ['2586/20', '2585/20', '2587/20'];

    // 1. Contrato
    if (excludeKey !== 'contrato') {
      if (currentFilters.contrato === 'PRESET_NOVOS') {
        if (!novosContratos.some((c) => r.CONTRATO?.includes(c))) return false;
      } else if (currentFilters.contrato === 'PRESET_ANTIGOS') {
        if (!antigosContratos.some((c) => r.CONTRATO?.includes(c))) return false;
      } else if (currentFilters.contrato !== 'ALL') {
        if (r.CONTRATO !== currentFilters.contrato) return false;
      }
    }

    // 2. Regional
    if (excludeKey !== 'regional') {
      if (currentFilters.regional !== 'ALL' && r.REGIONAL?.trim() !== currentFilters.regional) return false;
    }

    // 3. Bairro
    if (excludeKey !== 'bairro') {
      if (currentFilters.bairro !== 'ALL' && r.BAIRRO?.trim() !== currentFilters.bairro) return false;
    }

    // 4. Tipo
    if (excludeKey !== 'tipo') {
      if (currentFilters.tipo !== 'ALL' && r.TIPO !== currentFilters.tipo) return false;
    }

    // 5. Situação
    if (excludeKey !== 'situacao') {
      if (currentFilters.situacao !== 'ALL' && r.Situação !== currentFilters.situacao) return false;
    }

    // 6. Condição
    if (excludeKey !== 'condicao') {
      if (currentFilters.condicao !== 'ALL' && r.CONDIÇÃO !== currentFilters.condicao) return false;
    }

    // 7. OS
    if (excludeKey !== 'os') {
      if (currentFilters.os && currentFilters.os !== 'ALL' && r.OS?.trim() !== currentFilters.os) return false;
    }

    // 8. Codigos Multi-Selection
    if (excludeKey !== 'codigos') {
      if (currentFilters.codigos && currentFilters.codigos.length > 0) {
        if (!r.CÓDIGO || !currentFilters.codigos.includes(r.CÓDIGO.trim())) return false;
      }
    }

    // 9. Coords
    if (excludeKey !== 'onlyWithCoords') {
      if (currentFilters.onlyWithCoords && !r.hasValidCoord) return false;
    }

    // 10. Data início operação Range
    if (excludeKey !== 'dataInicio') {
      if (currentFilters.dataInicioStart || currentFilters.dataInicioEnd) {
        const itemDate = parseBRDate(r['Data início operação']);
        if (!itemDate) return false;
        if (currentFilters.dataInicioStart) {
          const startDate = parseBRDate(currentFilters.dataInicioStart);
          if (startDate && itemDate < startDate) return false;
        }
        if (currentFilters.dataInicioEnd) {
          const endDate = parseBRDate(currentFilters.dataInicioEnd);
          if (endDate && itemDate > endDate) return false;
        }
      }
    }

    // 11. Data de aceite Range
    if (excludeKey !== 'dataAceite') {
      if (currentFilters.dataAceiteStart || currentFilters.dataAceiteEnd) {
        const itemDate = parseBRDate(r['Data de aceite']);
        if (!itemDate) return false;
        if (currentFilters.dataAceiteStart) {
          const startDate = parseBRDate(currentFilters.dataAceiteStart);
          if (startDate && itemDate < startDate) return false;
        }
        if (currentFilters.dataAceiteEnd) {
          const endDate = parseBRDate(currentFilters.dataAceiteEnd);
          if (endDate && itemDate > endDate) return false;
        }
      }
    }

    // 12. Quick Search
    if (excludeKey !== 'searchQuery') {
      if (currentFilters.searchQuery) {
        const q = currentFilters.searchQuery.toLowerCase();
        const searchTarget = [
          r['ENDEREÇO COMPLETO'],
          r['ENDEREÇOS DOS EQUIPAMENTOS'],
          r.BAIRRO,
          r.CORREDOR,
          r.REGIONAL,
          r.CÓDIGO,
          r['Nº DE SÉRIE'],
          r.CONTRATADA,
          r.CONTRATO,
          r.TIPO,
          r.OS,
          r.Observações
        ]
          .join(' ')
          .toLowerCase();

        if (!searchTarget.includes(q)) return false;
      }
    }

    return true;
  };

  // Extract crossed-filtered unique values for filter dropdowns
  const availableContratos = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'contrato')) {
        if (r.CONTRATO && r.CONTRATO.trim()) set.add(r.CONTRATO.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableRegionais = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'regional')) {
        if (r.REGIONAL && r.REGIONAL.trim()) set.add(r.REGIONAL.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableBairros = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'bairro')) {
        if (r.BAIRRO && r.BAIRRO.trim()) set.add(r.BAIRRO.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableTipos = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'tipo')) {
        if (r.TIPO && r.TIPO.trim()) set.add(r.TIPO.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableSituacoes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'situacao')) {
        if (r.Situação && r.Situação.trim()) set.add(r.Situação.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableCondicoes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'condicao')) {
        if (r.CONDIÇÃO && r.CONDIÇÃO.trim()) set.add(r.CONDIÇÃO.trim());
      }
    });
    return Array.from(set).sort();
  }, [records, filters]);

  const availableOS = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'os')) {
        if (r.OS && r.OS.trim()) set.add(r.OS.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [records, filters]);

  const availableCodigos = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (recordMatchesFilters(r, filters, 'codigos')) {
        if (r.CÓDIGO && r.CÓDIGO.trim()) set.add(r.CÓDIGO.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [records, filters]);

  // Clean up selected filter values if they become unavailable due to cross-filtering
  useEffect(() => {
    setFilters((prev) => {
      let updated = false;
      const next = { ...prev };

      // Clean selected codigos
      if (next.codigos && next.codigos.length > 0) {
        const validCodesSet = new Set(availableCodigos);
        const validCodigos = next.codigos.filter((code) => validCodesSet.has(code));
        if (validCodigos.length !== next.codigos.length) {
          next.codigos = validCodigos;
          updated = true;
        }
      }

      // Reset single select dropdowns if selected value is no longer available
      if (next.regional !== 'ALL' && !availableRegionais.includes(next.regional)) {
        next.regional = 'ALL';
        updated = true;
      }
      if (next.bairro !== 'ALL' && !availableBairros.includes(next.bairro)) {
        next.bairro = 'ALL';
        updated = true;
      }
      if (next.tipo !== 'ALL' && !availableTipos.includes(next.tipo)) {
        next.tipo = 'ALL';
        updated = true;
      }
      if (next.situacao !== 'ALL' && !availableSituacoes.includes(next.situacao)) {
        next.situacao = 'ALL';
        updated = true;
      }
      if (next.condicao !== 'ALL' && !availableCondicoes.includes(next.condicao)) {
        next.condicao = 'ALL';
        updated = true;
      }
      if (next.os !== 'ALL' && !availableOS.includes(next.os)) {
        next.os = 'ALL';
        updated = true;
      }

      return updated ? next : prev;
    });
  }, [
    availableCodigos,
    availableRegionais,
    availableBairros,
    availableTipos,
    availableSituacoes,
    availableCondicoes,
    availableOS,
  ]);

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => recordMatchesFilters(r, filters));
  }, [records, filters]);

  // Count items with coordinates in total dataset
  const coordCount = useMemo(() => {
    return records.filter((r) => r.hasValidCoord).length;
  }, [records]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleClearAllFilters = () => {
    setFilters(emptyFilters);
    setResetSignal((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRecords={records.length}
        coordRecords={coordCount}
        loading={loading}
        onRefresh={loadData}
        lastUpdated={lastUpdated}
      />

      {/* Filter Bar - Hidden in Gestão Contratual, Interrupções, BHDIGITAL and Relatórios */}
      {activeTab !== 'relatorios' && activeTab !== 'gestao_contratual' && activeTab !== 'interrupcoes' && activeTab !== 'bhdigital' && (
        <FilterBar
          activeTab={activeTab}
          filters={filters}
          setFilters={setFilters}
          availableContratos={availableContratos}
          availableRegionais={availableRegionais}
          availableBairros={availableBairros}
          availableTipos={availableTipos}
          availableSituacoes={availableSituacoes}
          availableCondicoes={availableCondicoes}
          availableOS={availableOS}
          availableCodigos={availableCodigos}
          totalFiltered={filteredRecords.length}
          totalRecords={records.length}
          onReset={handleResetFilters}
          onClearAll={handleClearAllFilters}
        />
      )}

      {/* Main Container Content */}
      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-8">
        
        {loading && records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 my-8 shadow-xs">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-800">Carregando dados da Planilha GEAPI...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Conectando à origem dos dados no Google Sheets ({records.length} equipamentos processados)
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4 my-8 shadow-xs">
            <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-rose-900">Erro ao Conectar à Planilha</h3>
              <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tab 1: Map View */}
            {activeTab === 'mapa' && (
              <MapView
                records={filteredRecords}
                filters={filters}
                onSelectRecord={(rec) => setSelectedRecord(rec)}
              />
            )}

            {/* Tab 2: Indicators Dashboard */}
            {activeTab === 'indicadores' && (
              <IndicatorsView
                records={filteredRecords}
                onSelectRecord={(rec) => setSelectedRecord(rec)}
                resetSignal={resetSignal}
                onClearAllFilters={handleClearAllFilters}
              />
            )}

            {/* Tab 3: Full Table View */}
            {activeTab === 'tabela' && (
              <TableView
                records={filteredRecords}
                onSelectRecord={(rec) => setSelectedRecord(rec)}
              />
            )}

            {/* Tab 4: Gestao Contratual (Replica Oficial da aba CONTROLE GERAL CTs) */}
            {activeTab === 'gestao_contratual' && (
              <GestaoContratualView records={records} lastUpdated={lastUpdated} />
            )}

            {/* Tab 5: Interrupções de Equipamentos (EQUIPAMENTOS OFF) */}
            {activeTab === 'interrupcoes' && (
              <InterrupcoesView />
            )}

            {/* Tab 6: BHDIGITAL */}
            {activeTab === 'bhdigital' && (
              <BHDigitalView />
            )}
            
            {/* Tab 7: Relatorios */}
            {activeTab === 'relatorios' && (
              <ReportView records={records} />
            )}
          </>
        )}

      </main>

      {/* Footer Legend */}
      <FooterLegend
        loading={loading}
        onRefresh={loadData}
        lastUpdated={lastUpdated}
      />

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRecords={records.length}
        coordRecords={coordCount}
      />

      {/* Modals */}
      <EquipmentDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      <VercelGuideModal
        isOpen={isVercelGuideOpen}
        onClose={() => setIsVercelGuideOpen(false)}
      />

    </div>
  );
}
