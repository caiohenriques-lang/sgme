import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EquipmentRecord, FilterState } from '../types';
import { exportMapWithFiltersPdf } from '../utils/pdfExport';
import { FileDown, Loader2, Layers } from 'lucide-react';

interface MapViewProps {
  records: EquipmentRecord[];
  filters?: FilterState;
  onSelectRecord: (record: EquipmentRecord) => void;
}

export interface TipoColorInfo {
  type: string;
  color: string;
  label: string;
  description: string;
}

export const TIPO_COLOR_MAP: Record<string, TipoColorInfo> = {
  'CEV': {
    type: 'CEV',
    color: '#2563eb', // Azul Royal
    label: 'CEV',
    description: 'Controlador Eletrônico de Velocidade',
  },
  'DAS': {
    type: 'DAS',
    color: '#dc2626', // Vermelho Semáforo
    label: 'DAS',
    description: 'Avanço de Semáforo Vermelho',
  },
  'DIF': {
    type: 'DIF',
    color: '#059669', // Verde Esmeralda
    label: 'DIF',
    description: 'Invasão de Faixa Exclusiva de Ônibus',
  },
  'DTLP': {
    type: 'DTLP',
    color: '#d97706', // Âmbar / Laranja Queimado
    label: 'DTLP',
    description: 'Tráfego Proibido (Caminhões/Horário)',
  },
  'DAS+DIF': {
    type: 'DAS+DIF',
    color: '#e11d48', // Rosa Carmim / Framboesa
    label: 'DAS+DIF',
    description: 'Avanço de Semáforo + Faixa Exclusiva',
  },
  'DAS+DCP': {
    type: 'DAS+DCP',
    color: '#7c3aed', // Roxo Violeta
    label: 'DAS+DCP',
    description: 'Avanço de Semáforo + Conversão Proibida',
  },
  'DAS+DTLP': {
    type: 'DAS+DTLP',
    color: '#ea580c', // Laranja Vivo
    label: 'DAS+DTLP',
    description: 'Avanço de Semáforo + Tráfego Proibido',
  },
  'DAS+DCP+DIF': {
    type: 'DAS+DCP+DIF',
    color: '#4338ca', // Índigo Profundo
    label: 'DAS+DCP+DIF',
    description: 'Semáforo + Conversão + Faixa Exclusiva',
  },
};

export const getTypeColor = (tipo: string): string => {
  const t = (tipo || '').toUpperCase().trim().replace(/\s+/g, '').replace(/[/,]/g, '+');

  if (TIPO_COLOR_MAP[t]) {
    return TIPO_COLOR_MAP[t].color;
  }

  // Permutations or fallback matches
  if (t === 'DIF+DAS') return TIPO_COLOR_MAP['DAS+DIF'].color;
  if (t === 'DCP+DAS') return TIPO_COLOR_MAP['DAS+DCP'].color;
  if (t === 'DTLP+DAS') return TIPO_COLOR_MAP['DAS+DTLP'].color;

  if (t.includes('DAS') && t.includes('DCP') && t.includes('DIF')) return TIPO_COLOR_MAP['DAS+DCP+DIF'].color;
  if (t.includes('DAS') && t.includes('DIF')) return TIPO_COLOR_MAP['DAS+DIF'].color;
  if (t.includes('DAS') && t.includes('DCP')) return TIPO_COLOR_MAP['DAS+DCP'].color;
  if (t.includes('DAS') && t.includes('DTLP')) return TIPO_COLOR_MAP['DAS+DTLP'].color;

  if (t.includes('CEV')) return TIPO_COLOR_MAP['CEV'].color;
  if (t.includes('DAS')) return TIPO_COLOR_MAP['DAS'].color;
  if (t.includes('DIF')) return TIPO_COLOR_MAP['DIF'].color;
  if (t.includes('DTLP')) return TIPO_COLOR_MAP['DTLP'].color;
  if (t.includes('DCP')) return TIPO_COLOR_MAP['DAS+DCP'].color;

  return '#475569'; // Slate
};

export const isValidCoordNumber = (n: any): n is number => {
  return typeof n === 'number' && !isNaN(n) && isFinite(n);
};

export const isValidLatLng = (lat?: any, lng?: any): lat is number => {
  return isValidCoordNumber(lat) && isValidCoordNumber(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0);
};

export const getSituacaoBadgeHtml = (situacaoRaw?: string): string => {
  const sit = (situacaoRaw || '').trim();
  if (!sit || sit === '-') {
    return `<span style="display: inline-block; padding: 1px 7px; font-size: 10px; font-weight: 600; border-radius: 9999px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;">Não informada</span>`;
  }
  const lower = sit.toLowerCase();

  // Relocação (Roxo institucional)
  if (lower.includes('relocação') || lower.includes('relocacao')) {
    return `<span style="display: inline-block; padding: 1px 7.5px; font-size: 10px; font-weight: 700; border-radius: 9999px; background-color: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe;">${sit}</span>`;
  }

  // Em operação / Operação (Verdinho esmeralda institucional)
  if (lower.includes('em operação') || lower.includes('em operacao') || lower.includes('operação') || lower.includes('operacao')) {
    return `<span style="display: inline-block; padding: 1px 7.5px; font-size: 10px; font-weight: 700; border-radius: 9999px; background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;">${sit}</span>`;
  }

  // Desligado / Inoperante / Desativado (Vermelho / Rosa institucional)
  if (lower.includes('desligado') || lower.includes('inoperante') || lower.includes('desativado')) {
    return `<span style="display: inline-block; padding: 1px 7.5px; font-size: 10px; font-weight: 700; border-radius: 9999px; background-color: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3;">${sit}</span>`;
  }

  // Implantação / Projetado / Outros (Laranja / Âmbar institucional)
  return `<span style="display: inline-block; padding: 1px 7.5px; font-size: 10px; font-weight: 700; border-radius: 9999px; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;">${sit}</span>`;
};

export const MapView: React.FC<MapViewProps> = ({ records, filters, onSelectRecord }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Filter records that actually have valid coordinates
  const validRecords = records.filter((r) => r.hasValidCoord && isValidLatLng(r.lat, r.lng));

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const activeFilters: FilterState = filters || {
        contrato: 'ALL',
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
      await exportMapWithFiltersPdf(records, activeFilters);
    } catch (err) {
      console.error('Falha ao exportar PDF do mapa:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not created yet
    if (!mapInstanceRef.current) {
      // Default center: Belo Horizonte, MG (-19.92, -43.94)
      const map = L.map(mapContainerRef.current, {
        center: [-19.92, -43.94],
        zoom: 12,
        zoomControl: true,
      });

      // Google Maps Tile Layer
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps | GEAPI PBH',
        maxZoom: 20,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (validRecords.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);

    // Group records sharing exact same coordinate (rounded to 5 decimals ~ 1 meter)
    const coordMap = new Map<string, EquipmentRecord[]>();
    validRecords.forEach((record) => {
      if (!isValidLatLng(record.lat, record.lng)) return;
      const key = `${record.lat!.toFixed(5)},${record.lng!.toFixed(5)}`;
      if (!coordMap.has(key)) {
        coordMap.set(key, []);
      }
      coordMap.get(key)!.push(record);
    });

    coordMap.forEach((groupRecords) => {
      // Sort in ascending order by CÓDIGO (natural alphanumeric: e.g. KBH00021, KBH00022, KBH00023)
      groupRecords.sort((a, b) => {
        const codA = (a.CÓDIGO || '').trim();
        const codB = (b.CÓDIGO || '').trim();
        return codA.localeCompare(codB, undefined, { numeric: true, sensitivity: 'base' });
      });

      const primaryRecord = groupRecords[0];
      const lat = primaryRecord.lat!;
      const lng = primaryRecord.lng!;
      const isCoLocated = groupRecords.length > 1;

      const color = getTypeColor(primaryRecord.TIPO);
      const rawTipo = (primaryRecord.TIPO || '').trim();
      const displayTipo = rawTipo || 'EQUIP';

      // Title tooltip
      const tooltipText = isCoLocated
        ? `${groupRecords.length} equipamentos neste ponto: ${groupRecords.map((r) => `${r.CÓDIGO || ''} (${r.TIPO || ''})`).join(', ')} - ${primaryRecord['ENDEREÇO COMPLETO'] || ''}`
        : `${primaryRecord.CÓDIGO || ''} (${displayTipo}) - ${primaryRecord['ENDEREÇO COMPLETO'] || ''}`;

      // Create custom HTML marker icon with TIPO written inside (strictly NO counter badge on pin)
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-clean',
        html: `
          <div style="
            position: absolute;
            transform: translate(-50%, -50%);
            background-color: ${color};
            color: #ffffff;
            height: 24px;
            padding: 0 8px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.38);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: 0.2px;
            white-space: nowrap;
            cursor: pointer;
            box-sizing: border-box;
          " title="${tooltipText}">
            <span style="display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1;">${displayTipo}</span>
          </div>
        `,
        iconSize: [0, 0] as any,
        iconAnchor: [0, 0],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content - Alinhado aos padrões institucionais claros do portal GEAPI
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-900 max-w-xs';
      popupDiv.innerHTML = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a; min-width: 220px;">
          
          <!-- Cabeçalho: Código e Badge de Tipo -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            <strong style="color: #0f172a; font-size: 13.5px; font-weight: 800; letter-spacing: -0.2px;">${primaryRecord.CÓDIGO || 'Sem Código'}</strong>
            <span style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}40; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 9999px;">
              ${primaryRecord.TIPO || 'TIPO N/A'}
            </span>
          </div>

          <!-- Endereço -->
          <div style="margin-bottom: 6px; color: #334155; font-size: 11.5px; font-weight: 600; line-height: 1.35;">
            📍 ${primaryRecord['ENDEREÇO COMPLETO'] || 'Sem endereço'}
          </div>

          <!-- Informações de Contrato e Faixas -->
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
            Contrato: <strong style="color: #1e293b;">${primaryRecord.CONTRATO || '-'}</strong> | Faixas: <strong style="color: #1e293b;">${primaryRecord.FAIXAS || '-'}</strong>
          </div>

          <!-- Destaque visual da Situação (Verdinho, Roxo, Laranja/Âmbar, Rosa/Vermelho) -->
          <div style="font-size: 11px; margin-bottom: ${primaryRecord['Data de Desligamento'] ? '5px' : '8px'}; display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
            <span style="color: #64748b; font-weight: 600;">Situação:</span>
            ${getSituacaoBadgeHtml(primaryRecord.Situação)}
          </div>

          <!-- Data de Desligamento (se houver) -->
          ${primaryRecord['Data de Desligamento'] ? `
            <div style="font-size: 10.5px; color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 3px 7px; margin-bottom: 8px; font-weight: 600;">
              Data de Desligamento: <strong>${primaryRecord['Data de Desligamento']}</strong>
            </div>
          ` : ''}

          <!-- Botão Ver Ficha Completa (com Lupa Vetorial SVG branca nítida e harmônica) -->
          <button id="btn-detail-${primaryRecord.id}" style="
            width: 100%;
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            padding: 7px 12px;
            border-radius: 7px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.25);
            transition: background-color 0.15s ease;
          ">
            <svg style="width: 13.5px; height: 13.5px; color: #ffffff; shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>${isCoLocated ? `Ver Ficha Completa (${groupRecords.length} Equipamentos)` : 'Ver Ficha Completa'}</span>
          </button>

          <!-- Quadro de Equipamentos Co-localizados (ABAIXO do botão "Ver Ficha Completa", ordenado em ordem crescente) -->
          ${isCoLocated ? `
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 9px; margin-top: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #334155; margin-bottom: 5px;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <svg style="width: 13px; height: 13px; color: #2563eb; shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  ${groupRecords.length} equipamentos neste ponto:
                </span>
                <span style="background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 700;">Mesmo Ponto</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${groupRecords.map((r, i) => {
                  const isPrimary = r.id === primaryRecord.id;
                  return `
                    <button id="btn-popup-chip-${primaryRecord.id}-${i}" style="
                      background-color: ${isPrimary ? '#2563eb' : '#ffffff'};
                      color: ${isPrimary ? '#ffffff' : '#1e293b'};
                      border: 1px solid ${isPrimary ? '#1d4ed8' : '#cbd5e1'};
                      font-size: 10px;
                      font-weight: 700;
                      padding: 2.5px 6.5px;
                      border-radius: 5px;
                      cursor: pointer;
                      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                      transition: all 0.15s;
                    " title="Abrir ficha de ${r.CÓDIGO || 'Sem Cód.'} (${r.TIPO || 'N/A'})">
                      ${r.CÓDIGO || 'Sem Cód.'} (${r.TIPO || 'N/A'})
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${primaryRecord.id}`);
        if (btn) {
          btn.onmouseenter = () => { btn.style.backgroundColor = '#1d4ed8'; };
          btn.onmouseleave = () => { btn.style.backgroundColor = '#2563eb'; };
          btn.onclick = () => {
            onSelectRecord(primaryRecord);
          };
        }
        if (isCoLocated) {
          groupRecords.forEach((r, idx) => {
            const chipBtn = document.getElementById(`btn-popup-chip-${primaryRecord.id}-${idx}`);
            if (chipBtn) {
              if (r.id !== primaryRecord.id) {
                chipBtn.onmouseenter = () => {
                  chipBtn.style.backgroundColor = '#f1f5f9';
                  chipBtn.style.borderColor = '#94a3b8';
                };
                chipBtn.onmouseleave = () => {
                  chipBtn.style.backgroundColor = '#ffffff';
                  chipBtn.style.borderColor = '#cbd5e1';
                };
              }
              chipBtn.onclick = () => {
                onSelectRecord(r);
              };
            }
          });
        }
      });

      markersLayer.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    if (validRecords.length > 0 && bounds.isValid()) {
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.setView(bounds.getCenter(), 16);
      } else {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
      }
    }
  }, [validRecords, onSelectRecord]);

  return (
    <div className="relative isolate z-0 w-full h-[calc(100vh-230px)] min-h-[520px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-md">
      
      {/* Floating Map Controls & Export Bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
        {/* Legend Toggle Button - Hidden on mobile */}
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all ${
            showLegend
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          title="Ver legenda de cores das tipologias"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Legenda</span>
        </button>

        {/* Export Map PDF Button */}
        <button
          type="button"
          id="btn-export-map-pdf"
          onClick={handleExportPdf}
          disabled={isExportingPdf || records.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Exporta a visualização do mapa e a ficha de parâmetros aplicados em PDF"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando PDF do Mapa...</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF do Mapa</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Legend Overlay - Hidden on mobile */}
      {showLegend && (
        <div className="hidden sm:block absolute top-14 right-3 z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-xl max-w-xs w-72 max-h-[calc(100%-80px)] overflow-y-auto space-y-2 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tipologia dos Equipamentos</h4>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {Object.values(TIPO_COLOR_MAP).map((tipo) => (
              <div key={tipo.type} className="flex items-start gap-2 text-xs">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border border-white shadow-xs"
                  style={{ backgroundColor: tipo.color }}
                />
                <div>
                  <strong className="text-slate-900 font-semibold">{tipo.label}:</strong>{' '}
                  <span className="text-slate-600 text-[11px]">{tipo.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

    </div>
  );
};

