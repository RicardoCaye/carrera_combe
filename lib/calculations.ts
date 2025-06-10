// calculations.ts - VERSIÓN FINAL UNIFICADA

import type {
  UserInputs,
  CalculationOutput,
  CalculatedSegment,
  PacerSummary,
  CalculatedNutrition,
  HistoricalData
} from "./types";
import {
  SEGMENTS_DATA,
  NUTRITION_RATES,
  WATER_LITERS_PER_HOUR,
  DEFAULT_TRANSITION_MINUTES
} from "./data";

export function calculateRacePlan(inputs: UserInputs): CalculationOutput {
  const {
    raceStartTime,
    targetFinishTime,
    transitionMinutes = DEFAULT_TRANSITION_MINUTES,
    currentSegmentId,
    historicalData,
  } = inputs;

  let cumulativeTimeHours = 0;
  const raceStartDate = new Date(raceStartTime);
  const pacerSummary: PacerSummary = {};
  const totalNutrition: CalculatedNutrition = { carbs: 0, calories: 0, liters: 0 };
  const calculatedSegments: CalculatedSegment[] = [];

  // Validar que tenemos datos históricos para todos los segmentos completados
  const completedSegmentIds = SEGMENTS_DATA
    .filter(s => s.id < currentSegmentId)
    .map(s => s.id);
  
  const missingHistoricalData = completedSegmentIds.filter(
    segmentId => !historicalData.find(h => h.segmentId === segmentId)
  );

  // Si faltan datos históricos, generar datos automáticamente basados en el plan
  const extendedHistoricalData = [...historicalData];
  for (const segmentId of missingHistoricalData) {
    const segment = SEGMENTS_DATA.find(s => s.id === segmentId);
    if (segment) {
      const plannedRunningTime = segment.timeByFinishTarget[targetFinishTime];
      const transitionTime = (segment.id === SEGMENTS_DATA.length - 1) ? 0 : transitionMinutes / 60;
      const sleepTime = segment.sleepHours || 0;
      const estimatedTotalTime = plannedRunningTime + transitionTime + sleepTime;
      
      extendedHistoricalData.push({
        segmentId: segment.id,
        actualTotalTimeHours: estimatedTotalTime
      });
    }
  }

  for (const segment of SEGMENTS_DATA) {
    let category: "completed" | "current" | "future";
    let segmentTotalTime: number;
    let segmentRunningTimeHours: number;
    let actualTotalTimeHours: number | undefined = undefined;
    let plannedTotalTimeHours: number | undefined = undefined;

    const startTime = new Date(raceStartDate.getTime() + cumulativeTimeHours * 3600000);

    // 1. Determinar categoría y tiempo del segmento
    if (segment.id < currentSegmentId) {
      category = "completed";
      const history = extendedHistoricalData.find(h => h.segmentId === segment.id);
      if (!history) {
        // Esto no debería pasar ahora, pero por seguridad
        throw new Error(`Error interno: Faltan datos históricos para el segmento completado ID: ${segment.id}`);
      }
      
      actualTotalTimeHours = history.actualTotalTimeHours;
      segmentTotalTime = actualTotalTimeHours;
      
      const plannedTransition = (segment.id === SEGMENTS_DATA.length - 1) ? 0 : transitionMinutes / 60;
      const plannedSleep = segment.sleepHours || 0;
      segmentRunningTimeHours = Math.max(0, actualTotalTimeHours - plannedTransition - plannedSleep);

    } else {
      category = segment.id === currentSegmentId ? "current" : "future";

      segmentRunningTimeHours = segment.timeByFinishTarget[targetFinishTime];
      if (segmentRunningTimeHours === undefined) {
        throw new Error(`No se encontró el tiempo para el objetivo ${targetFinishTime} en el segmento ${segment.id}`);
      }

      const transitionTimeHours = (segment.id === SEGMENTS_DATA.length - 1) ? 0 : transitionMinutes / 60;
      const sleepTimeHours = segment.sleepHours || 0;
      
      plannedTotalTimeHours = segmentRunningTimeHours + transitionTimeHours + sleepTimeHours;
      segmentTotalTime = plannedTotalTimeHours;
    }

    cumulativeTimeHours += segmentTotalTime;
    const endTime = new Date(startTime.getTime() + segmentTotalTime * 3600000);

    // 2. Cálculo de Nutrición y Pacers
    let nutritionZone = 'late';
    if (segment.cumulativeKms <= 102) nutritionZone = 'early';
    else if (segment.cumulativeKms <= 212) nutritionZone = 'mid';
    
    const nutritionRate = NUTRITION_RATES[nutritionZone];
    const nutrition: CalculatedNutrition = {
      carbs: segmentRunningTimeHours * nutritionRate.carbsPerHour,
      calories: segmentRunningTimeHours * nutritionRate.caloriesPerHour,
      liters: segmentRunningTimeHours * WATER_LITERS_PER_HOUR,
    };
    totalNutrition.carbs += nutrition.carbs;
    totalNutrition.calories += nutrition.calories;
    totalNutrition.liters += nutrition.liters;

    let pacerNutrition: CalculatedNutrition | undefined = undefined;
    if (segment.pacer) {
      pacerNutrition = { carbs: nutrition.carbs / 2, calories: nutrition.calories / 2, liters: nutrition.liters / 2 };
      if (!pacerSummary[segment.pacer]) {
        pacerSummary[segment.pacer] = { totalHours: 0, totalKms: 0, nutrition: { carbs: 0, calories: 0, liters: 0 } };
      }
      pacerSummary[segment.pacer].totalHours += segmentRunningTimeHours;
      pacerSummary[segment.pacer].totalKms += segment.kms;
      pacerSummary[segment.pacer].nutrition.carbs += pacerNutrition.carbs;
      pacerSummary[segment.pacer].nutrition.calories += pacerNutrition.calories;
      pacerSummary[segment.pacer].nutrition.liters += pacerNutrition.liters;
    }

    // 3. Ensamblar el objeto final del segmento
    calculatedSegments.push({
      id: segment.id,
      name: segment.name,
      category,
      plannedTotalTimeHours: plannedTotalTimeHours ? parseFloat(plannedTotalTimeHours.toFixed(2)) : undefined,
      actualTotalTimeHours: actualTotalTimeHours ? parseFloat(actualTotalTimeHours.toFixed(2)) : undefined,
      cumulativeTimeHours: parseFloat(cumulativeTimeHours.toFixed(2)),
      startTimeISO: startTime.toISOString(),
      endTimeISO: endTime.toISOString(),
      cutoffISO: segment.cutoff,
      nutrition,
      pacer: segment.pacer,
      pacerNutrition,
    });
  }

  return {
    segments: calculatedSegments,
    projectedTotalTimeHours: cumulativeTimeHours,
    pacerSummary,
    totalNutrition,
  };
}