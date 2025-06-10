// data.ts - VERSIÓN FINAL Y COMPLETA

import type { SegmentData, NutritionRates, HistoricalData } from "./types";

// EXPLICACIÓN:
// Esta es la "única fuente de verdad" para tu carrera.
// - timeByFinishTarget: Horas de CARRERA (sin paradas) para cada objetivo.
//   He usado los tiempos de tu plan de 85h y los he extrapolado. AJUSTA ESTOS VALORES.
// - transitionMinutes: Tiempo de parada estándar en el avituallamiento.
// - sleepHours: Horas de sueño específicas en ciertos avituallamientos.
// - pacer: Nombre del pacer asignado a ese tramo.
// - cutoff: Hora límite oficial del puesto.

export const SEGMENTS_DATA: SegmentData[] = [
    // id, name, kms, elevation, cumulativeKms, timeByFinishTarget, pacer, sleepHours, cutoff
    { id: 1, name: "Armstrong Pass", kms: 24.0, elevation: 889, cumulativeKms: 24.0, timeByFinishTarget: { "80h": 3.8, "85h": 4.0, "90h": 4.3, "95h": 4.5, "100h": 4.7, "105h": 5.0 }, pacer: null, sleepHours: 0, cutoff: "2025-06-13T12:47:00-07:00" },
    { id: 2, name: "Housewife Hill", kms: 27.0, elevation: 717, cumulativeKms: 50.9, timeByFinishTarget: { "80h": 3.1, "85h": 3.3, "90h": 3.5, "95h": 3.7, "100h": 3.9, "105h": 4.1 }, pacer: null, sleepHours: 0, cutoff: "2025-06-13T15:50:00-07:00" },
    { id: 3, name: "Armstrong Pass", kms: 27.0, elevation: 1260, cumulativeKms: 77.9, timeByFinishTarget: { "80h": 7.2, "85h": 7.6, "90h": 8.0, "95h": 8.4, "100h": 8.8, "105h": 9.2 }, pacer: null, sleepHours: 0, cutoff: "2025-06-13T23:00:00-07:00" },
    { id: 4, name: "Heavenly", kms: 24.0, elevation: 646, cumulativeKms: 101.8, timeByFinishTarget: { "80h": 5.4, "85h": 5.7, "90h": 6.0, "95h": 6.3, "100h": 6.6, "105h": 6.9 }, pacer: null, sleepHours: 1.0, cutoff: "2025-06-14T15:00:00-07:00" },
    { id: 5, name: "Spooner Summit", kms: 28.9, elevation: 909, cumulativeKms: 130.7, timeByFinishTarget: { "80h": 7.1, "85h": 7.5, "90h": 7.9, "95h": 8.3, "100h": 8.7, "105h": 9.1 }, pacer: 'luis', sleepHours: 0, cutoff: "2025-06-14T23:30:00-07:00" },
    { id: 6, name: "Village Green", kms: 29.6, elevation: 849, cumulativeKms: 160.3, timeByFinishTarget: { "80h": 5.8, "85h": 6.1, "90h": 6.4, "95h": 6.7, "100h": 7.0, "105h": 7.3 }, pacer: 'huevo', sleepHours: 0, cutoff: "2025-06-15T08:30:00-07:00" },
    { id: 7, name: "Brockway Summit", kms: 21.3, elevation: 972, cumulativeKms: 181.6, timeByFinishTarget: { "80h": 6.3, "85h": 6.6, "90h": 6.9, "95h": 7.2, "100h": 7.5, "105h": 7.8 }, pacer: 'gavilan', sleepHours: 2.0, cutoff: "2025-06-15T15:30:00-07:00" },
    { id: 8, name: "Tahoe City", kms: 30.3, elevation: 755, cumulativeKms: 211.9, timeByFinishTarget: { "80h": 6.1, "85h": 6.4, "90h": 6.7, "95h": 7.0, "100h": 7.3, "105h": 7.6 }, pacer: 'gavilan', sleepHours: 0, cutoff: "2025-06-16T02:30:00-07:00" },
    { id: 9, name: "Brockway Summit", kms: 30.3, elevation: 1060, cumulativeKms: 242.2, timeByFinishTarget: { "80h": 7.2, "85h": 7.6, "90h": 8.0, "95h": 8.4, "100h": 8.8, "105h": 9.2 }, pacer: null, sleepHours: 1.0, cutoff: "2025-06-16T13:30:00-07:00" },
    { id: 10, name: "Village Green", kms: 21.3, elevation: 720, cumulativeKms: 263.4, timeByFinishTarget: { "80h": 6.6, "85h": 6.9, "90h": 7.2, "95h": 7.5, "100h": 7.8, "105h": 8.1 }, pacer: 'luis', sleepHours: 0, cutoff: "2025-06-16T20:00:00-07:00" },
    { id: 11, name: "Spooner Summit", kms: 30.3, elevation: 1071, cumulativeKms: 293.7, timeByFinishTarget: { "80h": 7.1, "85h": 7.5, "90h": 7.9, "95h": 8.3, "100h": 8.7, "105h": 9.1 }, pacer: 'huevo', sleepHours: 0, cutoff: "2025-06-17T07:00:00-07:00" },
    { id: 12, name: "Finish", kms: 28.2, elevation: 1017, cumulativeKms: 321.9, timeByFinishTarget: { "80h": 6.8, "85h": 7.1, "90h": 7.4, "95h": 7.7, "100h": 8.0, "105h": 8.3 }, pacer: 'gavilan', sleepHours: 0, cutoff: "2025-06-17T18:00:00-07:00" },
];

// Tasas de nutrición por hora, deducidas de tu Excel.
// Se mantiene el enfoque por zonas, ya que es fisiológicamente más preciso.
export const NUTRITION_RATES: NutritionRates = {
    'early': { carbsPerHour: 100, caloriesPerHour: 300 }, // Primeros ~100k
    'mid':   { carbsPerHour: 80, caloriesPerHour: 275 },   // Parte media
    'late':  { carbsPerHour: 60, caloriesPerHour: 250 },   // Parte final
};

// Constantes globales para el plan
export const DEFAULT_TRANSITION_MINUTES = 15;
export const WATER_LITERS_PER_HOUR = 0.75;

// Datos de ejemplo para testing (puedes modificar estos para simular progreso)
export const SAMPLE_HISTORICAL_DATA: HistoricalData[] = [
    // Ejemplo: si ya completaste los primeros segmentos, descomenta estas líneas:
    { segmentId: 1, actualTotalTimeHours: 4.2 },  // Armstrong Pass - un poco más lento que lo planeado
    { segmentId: 2, actualTotalTimeHours: 3.4 },  // Housewife Hill - ligeramente más rápido
    { segmentId: 3, actualTotalTimeHours: 7.8 },  // Armstrong Pass vuelta - dentro del plan
    { segmentId: 4, actualTotalTimeHours: 6.1 },  // Heavenly - incluyendo 1h de sueño
    // { segmentId: 5, actualTotalTimeHours: 7.7 },  // Spooner Summit
    // { segmentId: 6, actualTotalTimeHours: 6.3 },  // Village Green
];