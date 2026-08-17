import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EquipmentRecord } from '../types';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  records: EquipmentRecord[];
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

export const MapView: React.FC<MapViewProps> = ({ records, onSelectRecord }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter records that actually have valid coordinates
  const validRecords = records.filter((r) => r.hasValidCoord && r.lat !== undefined && r.lng !== undefined);

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
      if (record.lat === undefined || record.lng === undefined) return;

      const color = getTypeColor(record.TIPO);
      const rawTipo = (record.TIPO || '').trim();
      const displayTipo = rawTipo || 'EQUIP';

      // Create custom HTML marker icon with TIPO written inside
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-clean',
        html: `
          <div style="
            background-color: ${color};
            color: #ffffff;
            padding: 3px 7px;
            border-radius: 12px;
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.38);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: 0.2px;
            white-space: nowrap;
            cursor: pointer;
          " title="${record.CÓDIGO || ''} (${displayTipo}) - ${record['ENDEREÇO COMPLETO'] || ''}">
            <span>${displayTipo}</span>
          </div>
        `,
        iconSize: [undefined, 22] as any,
        iconAnchor: [20, 11],
        popupAnchor: [0, -11],
      });

      const marker = L.marker([record.lat, record.lng], { icon: customIcon });

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
      bounds.extend([record.lat, record.lng]);
    });

    if (validRecords.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [validRecords, onSelectRecord]);

  return (
    <div className="relative w-full h-[calc(100vh-230px)] min-h-[520px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-md">
      
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Top Floating Bar - Coordinates Stats */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-lg border border-slate-700/80 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Equipamentos no Mapa: <strong className="text-emerald-400">{validRecords.length}</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="text-slate-400 text-[11px]">
          {records.length - validRecords.length > 0 ? (
            <span>Sem coordenadas: <strong className="text-amber-400">{records.length - validRecords.length}</strong></span>
          ) : (
            <span>100% no mapa</span>
          )}
        </div>
      </div>

    </div>
  );
};

