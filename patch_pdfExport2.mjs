import fs from 'fs';

const content = fs.readFileSync('src/utils/pdfExport.ts', 'utf8');

const lines = content.split('\n');

const newBlock = `  // ----------- PAGE 2: MAPA -----------
  const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
  if (mapElement) {
    try {
      const canvas = await html2canvas(mapElement, { useCORS: true, logging: false });
      const mapDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      doc.addPage();
      
      // Bottom border line for header
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(10, 29, pageWidth - 10, 29);

      if (logoDataUrl) {
        try {
          const logoWidth = 48;
          const logoHeight = 12;
          const logoX = pageWidth - 12 - logoWidth;
          doc.addImage(logoDataUrl, 'PNG', logoX, 8, logoWidth, logoHeight);
        } catch (e) {}
      }

      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 12, 10, { maxWidth: maxTextWidth });
      
      doc.setFontSize(9.5);
      doc.text('MAPA DE LOCALIZAÇÃO DOS EQUIPAMENTOS', 12, 17, { maxWidth: maxTextWidth });

      // Draw the map image
      doc.addImage(mapDataUrl, 'JPEG', 12, 35, 186, 139.5);
      
      // Draw a black border around the map
      doc.setDrawColor(15, 23, 42); // Very dark slate (near black)
      doc.setLineWidth(0.5);
      doc.rect(12, 35, 186, 139.5);

      addCustomFooter(doc, pageWidth, doc.internal.pageSize.getHeight(), \`Página \${doc.internal.getNumberOfPages()}\`);
    } catch (e) {
      console.error('Erro ao gerar mapa pro PDF', e);
    }
  }`;

lines.splice(614, 38, newBlock);

fs.writeFileSync('src/utils/pdfExport.ts', lines.join('\n'));
