import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Petición GET simple, sin headers personalizados
    const response = await fetch('https://trackleaders.com/spot/tahoe200-25/Jorge_Combe.js', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    
    // Extraer los datos relevantes del JavaScript
    const data: any = {
      puntos: [],
      bandera: null,
      tooltipText: '',
      popupHtml: ''
    };

    // Extraer el array LLarray con regex mejorado
    const llMatch = text.match(/LLarray\s*=\s*(\[[\s\S]*?\])\s*;/);
    if (llMatch) {
      try {
        data.puntos = JSON.parse(llMatch[1]);
        console.log(`Puntos extraídos: ${data.puntos.length}`);
      } catch (e) {
        console.error("Error parseando LLarray:", e);
      }
    }

    // Buscar el marcador especial con icon9999 (última posición real)
    const markerMatch = text.match(/imarker(\d+)\s*=\s*L\.marker\(\[([^\]]+)\],\s*\{\s*icon:\s*icon9999/);
    if (markerMatch) {
      const coords = markerMatch[2].split(',').map(n => parseFloat(n.trim()));
      data.bandera = [coords[0], coords[1]];

      // Extraer el tooltip del marcador especial
      const tooltipMatch = text.match(new RegExp(`imarker${markerMatch[1]}\\.bindTooltip\\("([^"]+)"`));
      if (tooltipMatch) {
        data.tooltipText = tooltipMatch[1];
      }

      // Extraer el popup del marcador especial
      const popupMatch = text.match(new RegExp(`imarker${markerMatch[1]}\\.bindPopup\\('([^']+)'\\)`));
      if (popupMatch) {
        data.popupHtml = popupMatch[1];
      }
    } else if (data.puntos.length > 0) {
      // Fallback: usar el último punto de la ruta
      data.bandera = data.puntos[data.puntos.length - 1];
      data.tooltipText = "Último punto de la ruta";
      data.popupHtml = "<div><b>Jorge Combe (57)</b><br/>Última posición conocida</div>";
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tracker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracker data' },
      { status: 500 }
    );
  }
} 