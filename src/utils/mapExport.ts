import L from 'leaflet';
import html2canvas from 'html2canvas';
import { parseCoordinates } from '../services/dataService';

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
  if (t === 'DIF+DAS') return TIPO_COLOR_MAP['DAS+DIF'].color;
  if (t === 'DCP+DAS') return TIPO_COLOR_MAP['DAS+DCP'].color;
  if (t === 'DTLP+DAS') return TIPO_COLOR_MAP['DAS+DTLP'].color;
  if (t.includes('DCP')) return '#8b5cf6';
  if (t.includes('DTLP')) return '#f59e0b';
  return '#64748b'; // default slate
};

export const isValidCoordNumber = (n: any): n is number => {
  return typeof n === 'number' && !isNaN(n) && isFinite(n);
};

export const isValidLatLng = (lat?: any, lng?: any): lat is number => {
  return isValidCoordNumber(lat) && isValidCoordNumber(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0);
};

export const extractRecordCoordinates = (r: any): { lat: number; lng: number } | null => {
  if (!r) return null;
  let lat = r.lat;
  let lng = r.lng;

  if (typeof lat === 'string') lat = parseFloat(lat.replace(',', '.'));
  if (typeof lng === 'string') lng = parseFloat(lng.replace(',', '.'));

  if (isValidCoordNumber(lat) && isValidCoordNumber(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }

  // Fallback to COORD_LAT_LONG or raw fields
  const coordStr = r['COORD_LAT_LONG'] || r['COORDENADAS'] || r['COORD'] || (r.rawFields && r.rawFields['COORD_LAT_LONG']);
  if (coordStr) {
    const parsed = parseCoordinates(coordStr);
    if (parsed.hasValidCoord && parsed.lat !== undefined && parsed.lng !== undefined) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  }

  return null;
};

export async function captureMap(records: any[]): Promise<string | null> {
  const mapDiv = document.createElement('div');
  mapDiv.style.width = '1920px';
  mapDiv.style.height = '1440px';
  mapDiv.style.position = 'absolute';
  mapDiv.style.top = '0px';
  mapDiv.style.left = '-10000px';
  mapDiv.style.zIndex = '-9999';
  document.body.appendChild(mapDiv);

  const map = L.map(mapDiv, {
    zoomControl: false,
    attributionControl: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
  });

  const tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    crossOrigin: true
  }).addTo(map);

  const bounds = L.latLngBounds([]);
  let pointsCount = 0;

  records.forEach(r => {
    const coords = extractRecordCoordinates(r);
    if (coords) {
      pointsCount += 1;
      bounds.extend([coords.lat, coords.lng]);
      
      const color = getTypeColor(r.TIPO);
      const displayTipo = (r.TIPO || '').trim() || 'EQUIP';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-pdf',
        html: `
          <div style="
            position: absolute;
            transform: translate(-50%, -50%);
            background-color: ${color};
            color: #ffffff;
            height: 36px;
            padding: 0 14px;
            border-radius: 18px;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: 0.4px;
            white-space: nowrap;
            box-sizing: border-box;
          ">
            <span style="display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1; margin: auto;">
              ${displayTipo}
            </span>
          </div>
        `,
        iconSize: [0, 0] as any,
        iconAnchor: [0, 0],
      });

      L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
    }
  });

  if (pointsCount === 0 || !bounds.isValid()) {
    document.body.removeChild(mapDiv);
    return null;
  }

  map.invalidateSize();
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    map.setView(bounds.getCenter(), 15);
  } else {
    // Generous padding to prevent labels from touching edges and appropriate maxZoom
    map.fitBounds(bounds, { padding: [120, 120], maxZoom: 15 });
  }

  // Wait for tiles to finish loading
  await new Promise<void>((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve();
      }
    }, 2200);

    tileLayer.once('load', () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        setTimeout(resolve, 300);
      }
    });
  });

  try {
    const canvas = await html2canvas(mapDiv, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 2,
      // Fix for leaflet + html2canvas offset issues
      windowWidth: 1920,
      windowHeight: 1440,
      onclone: (clonedDoc) => {
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((style) => {
          if (style.textContent && style.textContent.includes('oklch')) {
            style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#64748b');
          }
        });
      },
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    document.body.removeChild(mapDiv);
    return dataUrl;
  } catch (err) {
    console.error('Failed to capture map', err);
    document.body.removeChild(mapDiv);
    return null;
  }
}
