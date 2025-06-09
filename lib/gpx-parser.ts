import { SEGMENTS_DATA } from './data'

interface GPXPoint {
  lat: number
  lon: number
  ele?: number
  time?: string
}

interface GPXTrack {
  name: string
  points: GPXPoint[]
}

interface GPXData {
  tracks: GPXTrack[]
  totalDistance: number
  elevationGain: number
  elevationLoss: number
  minElevation: number
  maxElevation: number
}

// Funciones de conversión
function feetToMeters(feet: number): number {
  return feet * 0.3048
}

function milesToKilometers(miles: number): number {
  return miles * 1.60934
}

// Función para calcular distancia entre dos puntos usando la fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c // Distancia en km
  return d
}

// Función para parsear archivo GPX
export function parseGPXFile(gpxText: string): GPXData | null {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(gpxText, 'text/xml')
    
    const tracks: GPXTrack[] = []
    const trkElements = xmlDoc.getElementsByTagName('trk')
    
    for (let i = 0; i < trkElements.length; i++) {
      const trkElement = trkElements[i]
      const nameElement = trkElement.getElementsByTagName('name')[0]
      const trackName = nameElement ? nameElement.textContent || `Track ${i + 1}` : `Track ${i + 1}`
      
      const points: GPXPoint[] = []
      const trkptElements = trkElement.getElementsByTagName('trkpt')
      
      for (let j = 0; j < trkptElements.length; j++) {
        const trkpt = trkptElements[j]
        const lat = parseFloat(trkpt.getAttribute('lat') || '0')
        const lon = parseFloat(trkpt.getAttribute('lon') || '0')
        
        const eleElement = trkpt.getElementsByTagName('ele')[0]
        let elevation = 0
        if (eleElement && eleElement.textContent) {
          const elevationInFeet = parseFloat(eleElement.textContent)
          elevation = feetToMeters(elevationInFeet) // Convertir de pies a metros
        }
        
        const timeElement = trkpt.getElementsByTagName('time')[0]
        const time = timeElement ? timeElement.textContent || undefined : undefined
        
        points.push({ lat, lon, ele: elevation, time })
      }
      
      tracks.push({ name: trackName, points })
    }
    
    if (tracks.length === 0 || tracks[0].points.length === 0) {
      return null
    }
    
    // Calcular estadísticas
    const mainTrack = tracks[0]
    let totalDistance = 0
    let elevationGain = 0
    let elevationLoss = 0
    let minElevation = mainTrack.points[0].ele || 0
    let maxElevation = mainTrack.points[0].ele || 0
    
    for (let i = 1; i < mainTrack.points.length; i++) {
      const prevPoint = mainTrack.points[i - 1]
      const currentPoint = mainTrack.points[i]
      
      // Calcular distancia
      const distance = calculateDistance(
        prevPoint.lat, prevPoint.lon,
        currentPoint.lat, currentPoint.lon
      )
      totalDistance += distance
      
      // Calcular ganancia/pérdida de elevación
      const prevEle = prevPoint.ele || 0
      const currentEle = currentPoint.ele || 0
      
      if (currentEle > prevEle) {
        elevationGain += (currentEle - prevEle)
      } else {
        elevationLoss += (prevEle - currentEle)
      }
      
      // Actualizar min/max elevación
      minElevation = Math.min(minElevation, currentEle)
      maxElevation = Math.max(maxElevation, currentEle)
    }
    
    return {
      tracks,
      totalDistance,
      elevationGain,
      elevationLoss,
      minElevation,
      maxElevation
    }
  } catch (error) {
    console.error('Error parsing GPX:', error)
    return null
  }
}

// Función para generar datos de elevación a partir de puntos GPX
export function generateElevationDataFromGPX(points: GPXPoint[]): Array<{distance: number, elevation: number}> {
  const data: Array<{distance: number, elevation: number}> = []
  let cumulativeDistance = 0
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    
    if (i > 0) {
      const prevPoint = points[i - 1]
      const distance = calculateDistance(
        prevPoint.lat, prevPoint.lon,
        point.lat, point.lon
      )
      cumulativeDistance += distance
    }
    
    // Usar elevación real del GPX (ya convertida a metros)
    const elevation = point.ele || 0
    
    data.push({
      distance: cumulativeDistance,
      elevation: Math.round(elevation) // Redondear a metros enteros
    })
  }
  
  return data
}

// Función de respaldo para generar datos detallados de elevación
export function generateDetailedElevationData(): Array<{distance: number, elevation: number}> {
  const data: Array<{distance: number, elevation: number}> = []
  const totalDistance = 320 // km
  const pointsPerKm = 5 // 5 puntos por kilómetro para mayor detalle
  
  // Crear un mapa de distancias acumuladas de los segmentos para interpolación
  const segmentDistances = SEGMENTS_DATA.map(segment => segment.cumulativeDistanceKm || 0)
  const segmentElevations = SEGMENTS_DATA.map(segment => segment.endElevationM || 2000)
  
  for (let i = 0; i <= totalDistance * pointsPerKm; i++) {
    const distance = i / pointsPerKm
    
    // Interpolar elevación basándose en SEGMENTS_DATA
    let elevation = 2000
    const segmentDistances = SEGMENTS_DATA.map(segment => segment.cumulativeDistanceKm || 0)
    const segmentElevations = SEGMENTS_DATA.map(segment => segment.endElevationM || 2000)
    
    // Encontrar los dos segmentos más cercanos para interpolar
    let lowerIndex = 0
    let upperIndex = segmentDistances.length - 1
    
    for (let j = 0; j < segmentDistances.length - 1; j++) {
      if (distance >= segmentDistances[j] && distance <= segmentDistances[j + 1]) {
        lowerIndex = j
        upperIndex = j + 1
        break
      }
    }
    
    if (lowerIndex !== upperIndex) {
      const lowerDistance = segmentDistances[lowerIndex]
      const upperDistance = segmentDistances[upperIndex]
      const lowerElevation = segmentElevations[lowerIndex]
      const upperElevation = segmentElevations[upperIndex]
      
      const ratio = (distance - lowerDistance) / (upperDistance - lowerDistance)
      elevation = lowerElevation + (upperElevation - lowerElevation) * ratio
    } else {
      elevation = segmentElevations[lowerIndex]
    }
    
    // Agregar algo de variación natural
    const variation = (Math.sin(distance * 0.1) + Math.cos(distance * 0.05)) * 20
    elevation += variation
    
    data.push({
      distance,
      elevation: Math.round(elevation)
    })
  }
  
  return data
}

// Función para calcular datos específicos de segmentos desde GPX
export function calculateSegmentDataFromGPX(points: GPXPoint[], segmentDistances: number[]): Array<{
  segmentId: number,
  distanceKm: number,
  startElevationM: number,
  endElevationM: number,
  elevationGainM: number,
  elevationLossM: number
}> {
  const segmentData: Array<{
    segmentId: number,
    distanceKm: number,
    startElevationM: number,
    endElevationM: number,
    elevationGainM: number,
    elevationLossM: number
  }> = []

  // Generar datos de elevación con distancia acumulada
  const elevationData = generateElevationDataFromGPX(points)
  
  for (let i = 0; i < segmentDistances.length; i++) {
    const segmentId = i + 1
    const startDistance = i === 0 ? 0 : segmentDistances[i - 1]
    const endDistance = segmentDistances[i]
    
    // Encontrar puntos de inicio y fin del segmento
    const startPoint = elevationData.find(p => Math.abs(p.distance - startDistance) < 0.5) || elevationData[0]
    const endPoint = elevationData.find(p => Math.abs(p.distance - endDistance) < 0.5) || elevationData[elevationData.length - 1]
    
    // Calcular ascenso y descenso dentro del segmento
    let elevationGain = 0
    let elevationLoss = 0
    
    const segmentPoints = elevationData.filter(p => p.distance >= startDistance && p.distance <= endDistance)
    
    for (let j = 1; j < segmentPoints.length; j++) {
      const prevEle = segmentPoints[j - 1].elevation
      const currentEle = segmentPoints[j].elevation
      
      if (currentEle > prevEle) {
        elevationGain += (currentEle - prevEle)
      } else {
        elevationLoss += (prevEle - currentEle)
      }
    }
    
    segmentData.push({
      segmentId,
      distanceKm: endDistance - startDistance,
      startElevationM: Math.round(startPoint.elevation),
      endElevationM: Math.round(endPoint.elevation),
      elevationGainM: Math.round(elevationGain),
      elevationLossM: Math.round(elevationLoss)
    })
  }
  
  return segmentData
} 