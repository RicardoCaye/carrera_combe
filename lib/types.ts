export interface Segment {
  id: number
  name: string
  distanceKm: number
  elevationGainM?: number
  elevationLossM?: number
  timeByFinishTarget: { [key: string]: number } // e.g., { "80h": 3.5, "85h": 4.0 }
  fixedRestHours: number
  sleepHours?: number // Only for specific segments
  // Add new elevation profile properties
  startElevationM?: number
  endElevationM?: number
  cumulativeDistanceKm?: number
}

export interface NutritionItemDetail {
  calories: number
  carbs: number
}

export interface NutritionData {
  pouch: NutritionItemDetail
  powder: NutritionItemDetail
  bar: NutritionItemDetail
  gel: NutritionItemDetail
}

export interface SegmentRequirements {
  segmentId: number
  name: string
  requiredCarbs: number
  requiredCalories: number
  waterLiters: number
}

export interface HistoricalResult {
  segmentId: number
  actualTimeHours: number
  rank?: number
}

export interface UserInputs {
  raceStartTime: string // ISO string or a Date object
  targetFinishTime: string // e.g., "85h"
  currentSegmentId: number
  historicalData: HistoricalResult[]
}

export interface CalculatedNutritionPlan {
  pouch: number
  powder: number
  bar: number
  gel: number
  totalCalories: number
  totalCarbs: number
}

export interface CalculatedSegment {
  id: number
  name: string
  category: "completed" | "current" | "future"
  segmentStartTime?: string // ISO string
  segmentEndTime?: string // ISO string
  plannedTimeHours?: number // Includes segment time + rest + sleep
  actualTimeHours?: number
  rank?: number
  nutritionPlan?: CalculatedNutritionPlan
  waterLiters?: number
  waterLitersPerHour?: number
}

export interface CalculationOutput {
  segments: CalculatedSegment[]
  projectedTotalTimeHours: number
}

export const TARGET_FINISH_TIMES = ["80h", "85h", "90h", "95h", "100h", "105h"]
