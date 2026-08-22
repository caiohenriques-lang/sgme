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

    validRecords.forEach((record) => {
      if (!isValidLatLng(record.lat, record.lng)) return;

      const lat = record.lat!;
      const lng = record.lng!;

      const color = getTypeColor(record.TIPO);
      const rawTipo = (record.TIPO || '').trim();
      const displayTipo = rawTipo || 'EQUIP';

      // Create custom HTML marker icon with TIPO written inside
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
          " title="${record.CÓDIGO || ''} (${displayTipo}) - ${record['ENDEREÇO COMPLETO'] || ''}">
            <span style="display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1;">${displayTipo}</span>
          </div>
        `,
        iconSize: [0, 0] as any,
        iconAnchor: [0, 0],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-900 max-w-xs';
      popupDiv.innerHTML = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${record.CÓDIGO || 'Sem Código'}</strong>
            <span style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}40; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 9999px;">
              ${record.TIPO || 'TIPO N/A'}
            </span>
          </div>
          <div style="margin-bottom: 4px; color: #334155; font-weight: 600;">
            📍 ${record['ENDEREÇO COMPLETO'] || 'Sem endereço'}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            Contrato: <strong>${record.CONTRATO || '-'}</strong> | Faixas: <strong>${record.FAIXAS}</strong> | Situação: <strong>${record.Situação || '-'}</strong>
          </div>
          <button id="btn-detail-${record.id}" style="
            width: 100%;
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            <span>🔍 Ver Todos os Dados (Ficha Completa)</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${record.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectRecord(record);
          };
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

