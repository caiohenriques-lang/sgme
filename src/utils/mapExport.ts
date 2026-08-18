import L from 'leaflet';
import html2canvas from 'html2canvas';

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

  L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    crossOrigin: true
  }).addTo(map);

  const bounds = L.latLngBounds([]);
  let hasValid = false;

  records.forEach(r => {
    if (r.hasValidCoord && isValidLatLng(r.lat, r.lng)) {
      hasValid = true;
      bounds.extend([r.lat, r.lng]);
      
      const color = getTypeColor(r.TIPO);
      const displayTipo = (r.TIPO || '').trim() || 'EQUIP';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-pdf',
        html: `
          <div style="
            background-color: ${color};
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            border: 4px solid #ffffff;
            box-shadow: 0 6px 12px rgba(0,0,0,0.4);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, sans-serif;
            font-size: 18px;
            font-weight: 800;
            line-height: 1;
            white-space: nowrap;
          ">
            ${displayTipo}
          </div>
        `,
        iconSize: [undefined, 40] as any,
        iconAnchor: [40, 20],
      });

      L.marker([r.lat, r.lng], { icon: customIcon }).addTo(map);
    }
  });

  if (!hasValid || !bounds.isValid()) {
    document.body.removeChild(mapDiv);
    return null;
  }

  map.invalidateSize();
  map.fitBounds(bounds, { padding: [150, 150], maxZoom: 16 });

  // wait for tiles to load and animations to finish
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const canvas = await html2canvas(mapDiv, {
      useCORS: true,
      allowTaint: false,
      logging: false,
      scale: 2,
      // Fix for leaflet + html2canvas offset issues
      windowWidth: 1920,
      windowHeight: 1440
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
