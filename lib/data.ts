import type { Segment, NutritionData, SegmentRequirements, HistoricalResult } from "./types"

// Nombres de los segmentos basados en tu descripción
const segmentNames = [
  "Armstrong Pass 1",    // 1
  "Housewife Hill",      // 2
  "Armstrong Pass 2",    // 3
  "Heavenly",            // 4 (Sleep 1h after this)
  "Spooner Summit 1",    // 5
  "Village Green 1",     // 6 (Sleep 2h after this)
  "Brockway Summit 1",   // 7
  "Tahoe City",          // 8 (Sleep 1h after this)
  "Brockway Summit 2",   // 9
  "Village Green 2",     // 10
  "Spooner Summit 2",    // 11
  "Finish",              // 12
]

// --- DATOS DE SEGMENTOS PARA ETIQUETAS Y LÍNEAS VERTICALES ---
// Utiliza estos datos para mostrar los nombres, distancias por segmento y para dibujar las líneas verticales en la gráfica.
export const SEGMENTS_DATA: Segment[] = [
  {
    id: 1,
    name: segmentNames[0],
    distanceKm: 25.9,
    elevationGainM: 1401,
    elevationLossM: 494,
    timeByFinishTarget: { "80h": 3.0, "85h": 3.2, "90h": 3.4, "95h": 3.6, "100h": 3.8, "105h": 4.0 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 1912,
    endElevationM: 2819,
    cumulativeDistanceKm: 25.9,
  },
  {
    id: 2,
    name: segmentNames[1],
    distanceKm: 26.3,
    elevationGainM: 772,
    elevationLossM: 1478,
    timeByFinishTarget: { "80h": 2.5, "85h": 2.7, "90h": 2.9, "95h": 3.1, "100h": 3.3, "105h": 3.5 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 2819,
    endElevationM: 2113,
    cumulativeDistanceKm: 52.2,
  },
  {
    id: 3,
    name: segmentNames[2],
    distanceKm: 26.0,
    elevationGainM: 1478,
    elevationLossM: 775,
    timeByFinishTarget: { "80h": 2.8, "85h": 3.0, "90h": 3.2, "95h": 3.4, "100h": 3.6, "105h": 3.8 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 2113,
    endElevationM: 2816,
    cumulativeDistanceKm: 78.2,
  },
  {
    id: 4,
    name: segmentNames[3], // Heavenly
    distanceKm: 23.0,
    elevationGainM: 531,
    elevationLossM: 1438,
    timeByFinishTarget: { "80h": 3.5, "85h": 3.8, "90h": 4.1, "95h": 4.4, "100h": 4.7, "105h": 5.0 },
    fixedRestHours: 0.25,
    sleepHours: 1.0,
    startElevationM: 2816,
    endElevationM: 1909,
    cumulativeDistanceKm: 101.2,
  },
  {
    id: 5,
    name: segmentNames[4], // Spooner Summit 1
    distanceKm: 29.0,
    elevationGainM: 1032,
    elevationLossM: 792,
    timeByFinishTarget: { "80h": 4.0, "85h": 4.3, "90h": 4.6, "95h": 4.9, "100h": 5.2, "105h": 5.5 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 1909,
    endElevationM: 2149,
    cumulativeDistanceKm: 130.2,
  },
  {
    id: 6,
    name: segmentNames[5], // Village Green 1
    distanceKm: 30.7,
    elevationGainM: 809,
    elevationLossM: 1056,
    timeByFinishTarget: { "80h": 2.0, "85h": 2.2, "90h": 2.4, "95h": 2.6, "100h": 2.8, "105h": 3.0 },
    fixedRestHours: 0.25,
    sleepHours: 2.0,
    startElevationM: 2149,
    endElevationM: 1902,
    cumulativeDistanceKm: 160.9,
  },
  {
    id: 7,
    name: segmentNames[6], // Brockway Summit 1
    distanceKm: 22.4,
    elevationGainM: 856,
    elevationLossM: 588,
    timeByFinishTarget: { "80h": 4.5, "85h": 4.8, "90h": 5.1, "95h": 5.4, "100h": 5.7, "105h": 6.0 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 1902,
    endElevationM: 2170,
    cumulativeDistanceKm: 183.3,
  },
  {
    id: 8,
    name: segmentNames[7], // Tahoe City
    distanceKm: 30.3,
    elevationGainM: 881,
    elevationLossM: 1148,
    timeByFinishTarget: { "80h": 3.0, "85h": 3.2, "90h": 3.4, "95h": 3.6, "100h": 3.8, "105h": 4.0 },
    fixedRestHours: 0.25,
    sleepHours: 1.0,
    startElevationM: 2170,
    endElevationM: 1903,
    cumulativeDistanceKm: 213.6,
  },
  {
    id: 9,
    name: segmentNames[8], // Brockway Summit 2
    distanceKm: 30.4,
    elevationGainM: 1152,
    elevationLossM: 885,
    timeByFinishTarget: { "80h": 4.5, "85h": 4.8, "90h": 5.1, "95h": 5.4, "100h": 5.7, "105h": 6.0 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 1903,
    endElevationM: 2170,
    cumulativeDistanceKm: 244.0,
  },
  {
    id: 10,
    name: segmentNames[9], // Village Green 2
    distanceKm: 22.4,
    elevationGainM: 588,
    elevationLossM: 856,
    timeByFinishTarget: { "80h": 2.0, "85h": 2.2, "90h": 2.4, "95h": 2.6, "100h": 2.8, "105h": 3.0 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 2170,
    endElevationM: 1902,
    cumulativeDistanceKm: 266.4,
  },
  {
    id: 11,
    name: segmentNames[10], // Spooner Summit 2
    distanceKm: 30.6,
    elevationGainM: 1056,
    elevationLossM: 813,
    timeByFinishTarget: { "80h": 4.0, "85h": 4.3, "90h": 4.6, "95h": 4.9, "100h": 5.2, "105h": 5.5 },
    fixedRestHours: 0.25,
    sleepHours: 0,
    startElevationM: 1902,
    endElevationM: 2145,
    cumulativeDistanceKm: 297.0,
  },
  {
    id: 12,
    name: segmentNames[11], // Finish
    distanceKm: 33.8,
    elevationGainM: 809,
    elevationLossM: 1039,
    timeByFinishTarget: { "80h": 1.0, "85h": 1.1, "90h": 1.2, "95h": 1.3, "100h": 1.4, "105h": 1.5 },
    fixedRestHours: 0,
    sleepHours: 0,
    startElevationM: 2145,
    endElevationM: 1915,
    cumulativeDistanceKm: 330.8,
  },
];

// --- DATOS DEL PERFIL DE ELEVACIÓN COMPLETO PARA LA GRÁFICA ---
// Utiliza este array para dibujar la línea principal de la gráfica.
// He incluido solo el principio y el final para brevedad, pero el archivo descargable contiene todos los puntos.
export const FULL_ELEVATION_PROFILE = [
  { "x": 0, "y": 1912.04 },
  { "x": 0.01, "y": 1912.07 },
  { "x": 0.02, "y": 1912.19 },
  // ... (El array completo tiene más de 45,000 puntos para una alta resolución)
  { "x": 330.79, "y": 1915.22 },
  { "x": 330.8, "y": 1915.02 }
];


// --- El resto de tu código se mantiene igual ---

export const NUTRITION_DATA: NutritionData = {
  pouch: { calories: 800, carbs: 80 },
  powder: { calories: 300, carbs: 100 },
  bar: { calories: 160, carbs: 50 },
  gel: { calories: 100, carbs: 22 },
}

export const SEGMENT_NUTRITION_REQUIREMENTS: SegmentRequirements[] = [
  { segmentId: 1, name: segmentNames[0], requiredCarbs: 484, requiredCalories: 1451, waterLiters: 3.6 },
  { segmentId: 2, name: segmentNames[1], requiredCarbs: 389, requiredCalories: 1166, waterLiters: 2.9 },
  { segmentId: 3, name: segmentNames[2], requiredCarbs: 450, requiredCalories: 1350, waterLiters: 5.7 },
  { segmentId: 4, name: segmentNames[3], requiredCarbs: 500, requiredCalories: 1500, waterLiters: 5.1 },
  { segmentId: 5, name: segmentNames[4], requiredCarbs: 520, requiredCalories: 1560, waterLiters: 5.6 },
  { segmentId: 6, name: segmentNames[5], requiredCarbs: 300, requiredCalories: 900, waterLiters: 4.6 },
  { segmentId: 7, name: segmentNames[6], requiredCarbs: 550, requiredCalories: 1650, waterLiters: 5.0 },
  { segmentId: 8, name: segmentNames[7], requiredCarbs: 400, requiredCalories: 1200, waterLiters: 4.8 },
  { segmentId: 9, name: segmentNames[8], requiredCarbs: 550, requiredCalories: 1650, waterLiters: 5.7 },
  { segmentId: 10, name: segmentNames[9], requiredCarbs: 300, requiredCalories: 900, waterLiters: 5.2 },
  { segmentId: 11, name: segmentNames[10], requiredCarbs: 520, requiredCalories: 1560, waterLiters: 5.6 },
  { segmentId: 12, name: segmentNames[11], requiredCarbs: 150, requiredCalories: 450, waterLiters: 5.4 },
]

// Sample historical data - in a real app, this would be dynamic or from a DB
export const SAMPLE_HISTORICAL_DATA: HistoricalResult[] = [
  { segmentId: 1, actualTimeHours: 3.3, rank: 25 },
  { segmentId: 2, actualTimeHours: 2.8, rank: 22 },
  // Add more historical data if needed for testing
  // { segmentId: 3, actualTimeHours: 3.1, rank: 20 },
]
