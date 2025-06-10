// types.ts - VERSIÓN FINAL UNIFICADA

// --- Estructuras para los Datos de Entrada (data.ts) ---

export interface SegmentData {
  id: number;
  name: string;
  kms: number;
  elevation: number;
  cumulativeKms: number;
  // NUEVO: Usaremos este enfoque, es más directo que el escalado.
  timeByFinishTarget: { [key: string]: number }; // e.g., { "80h": 3.79, "85h": 4.0, ... }
  pacer: string | null;
  sleepHours: number;
  cutoff: string; // ISO string con offset, e.g., "2025-06-13T12:47:00-07:00"
}

export interface NutritionRates {
  [zone: string]: {
    carbsPerHour: number;
    caloriesPerHour: number;
  };
}

// --- Estructuras para los Inputs del Usuario ---

export interface HistoricalData {
  segmentId: number;
  // Tiempo total del segmento, desde que sale de un avituallamiento hasta que llega al siguiente.
  actualTotalTimeHours: number; 
}

export interface UserInputs {
  raceStartTime: string; // ISO string con offset, e.g., "2025-06-13T09:00:00-07:00"
  // NUEVO: El target ahora es un string para coincidir con `timeByFinishTarget`.
  targetFinishTime: "80h" | "85h" | "90h" | "95h" | "100h" | "105h";
  transitionMinutes?: number; // Minutos de descanso/transición en cada avituallamiento (opcional, usa DEFAULT_TRANSITION_MINUTES)
  
  // Para seguimiento en vivo
  currentSegmentId: number;
  historicalData: HistoricalData[];
}

// --- Estructuras para los Resultados del Cálculo (CalculationOutput) ---

export interface CalculatedNutrition {
  carbs: number;
  calories: number;
  liters: number;
}

export interface CalculatedSegment {
  id: number;
  name: string;
  category: "completed" | "current" | "future";
  
  // Tiempos
  plannedTotalTimeHours?: number; // Tiempo planificado (carrera + transición + sueño)
  actualTotalTimeHours?: number;  // Tiempo real registrado
  cumulativeTimeHours: number;
  startTimeISO: string;
  endTimeISO: string;
  cutoffISO: string;

  // Nutrición y Pacers
  nutrition: CalculatedNutrition;
  pacer: string | null;
  pacerNutrition?: CalculatedNutrition;
}

export interface PacerSummary {
  [pacerName: string]: {
    totalHours: number;
    totalKms: number;
    nutrition: CalculatedNutrition;
  };
}

export interface CalculationOutput {
  segments: CalculatedSegment[];
  projectedTotalTimeHours: number;
  pacerSummary: PacerSummary;
  totalNutrition: CalculatedNutrition;
}

// --- Constantes ---

export const TARGET_FINISH_TIMES = ["80h", "85h", "90h", "95h", "100h", "105h"] as const;
export type TargetFinishTime = typeof TARGET_FINISH_TIMES[number];

