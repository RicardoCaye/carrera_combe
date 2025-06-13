// csv-data.ts - Manejo de datos desde los archivos CSV

export interface NutritionPlan {
  segmento: string;
  pouch: number;
  polvo: number;
  barras: number;
  geles: number;
}

export interface SegmentDataFromCSV {
  pacer: string;
  clave_segmento: string;
  se_duerme_horas: number;
  segmento: string;
  km_acumulado: number;
  distancia_segmento_km: number;
  elevacion: number;
  bajada: number;
  p75_terminaron: number;
  limite_de_tiempo: string;
  transicion_tiempo_segmento: number;
  transicion_tiempo_segmento_con_dormir: number;
  tiempo_de_lentos: number;
  tiempo_ajustado: number;
  tiempo_final_ajustado_segmento: number;
  tiempo_final_ajustado_acumulado: number;
  carbs_segmento: number;
  calorias_segmento: number;
  litros_segmento: number;
  acaba: string;
  empieza: string;
}

// Función para parsear el CSV de nutrición
export function parseNutritionCSV(csvContent: string): NutritionPlan[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      segmento: values[0],
      pouch: parseInt(values[1]) || 0,
      polvo: parseInt(values[2]) || 0,
      barras: parseInt(values[3]) || 0,
      geles: parseInt(values[4]) || 0
    };
  });
}

// Función para parsear el CSV de datos finales
export function parseSegmentDataCSV(csvContent: string): SegmentDataFromCSV[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1)
    .filter(line => {
      const values = line.split(',');
      // Filtrar solo los segmentos principales (no transiciones)
      return values[3] && !values[3].includes('Trancisión');
    })
    .map(line => {
      const values = line.split(',');
      return {
        pacer: values[0] || '',
        clave_segmento: values[1] || '',
        se_duerme_horas: parseFloat(values[2]) || 0,
        segmento: values[3] || '',
        km_acumulado: parseFloat(values[4]) || 0,
        distancia_segmento_km: parseFloat(values[5]) || 0,
        elevacion: parseFloat(values[6]) || 0,
        bajada: parseFloat(values[7]) || 0,
        p75_terminaron: parseFloat(values[8]) || 0,
        limite_de_tiempo: values[9] || '',
        transicion_tiempo_segmento: parseFloat(values[10]) || 0,
        transicion_tiempo_segmento_con_dormir: parseFloat(values[11]) || 0,
        tiempo_de_lentos: parseFloat(values[12]) || 0,
        tiempo_ajustado: parseFloat(values[13]) || 0,
        tiempo_final_ajustado_segmento: parseFloat(values[14]) || 0,
        tiempo_final_ajustado_acumulado: parseFloat(values[15]) || 0,
        carbs_segmento: parseFloat(values[16]) || 0,
        calorias_segmento: parseFloat(values[17]) || 0,
        litros_segmento: parseFloat(values[18]) || 0,
        acaba: values[19] || '',
        empieza: values[20] || ''
      };
    });
}

// Función para combinar los datos de ambos CSVs
export function combineSegmentData(
  segmentData: SegmentDataFromCSV[],
  nutritionData: NutritionPlan[]
): any[] {
  return segmentData.map((segment, index) => {
    // Buscar el plan de nutrición correspondiente
    const nutrition = nutritionData.find(n => 
      n.segmento.toLowerCase().includes(segment.segmento.toLowerCase().split(' ')[0]) ||
      segment.segmento.toLowerCase().includes(n.segmento.toLowerCase().split(' ')[0])
    ) || { pouch: 0, polvo: 0, barras: 0, geles: 0 };

    return {
      id: index + 1,
      name: segment.segmento,
      distanceKm: segment.distancia_segmento_km,
      cumulativeKm: segment.km_acumulado,
      elevationGain: segment.elevacion,
      elevationLoss: segment.bajada,
      nutrition: {
        pouch: nutrition.pouch,
        polvo: nutrition.polvo,
        barras: nutrition.barras,
        geles: nutrition.geles,
        carbs: segment.carbs_segmento,
        calories: segment.calorias_segmento,
        liters: segment.litros_segmento
      },
      timing: {
        start: segment.empieza,
        end: segment.acaba,
        estimatedHours: segment.tiempo_final_ajustado_segmento,
        accumulatedHours: segment.tiempo_final_ajustado_acumulado,
        cutoff: segment.limite_de_tiempo
      },
      pacer: segment.pacer || null,
      sleepHours: segment.se_duerme_horas || 0,
      completionRate: segment.p75_terminaron
    };
  });
} 