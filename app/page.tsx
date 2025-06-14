"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Flag, MapPin, Activity } from "lucide-react"
import dynamic from 'next/dynamic'

import { ElevationProfileChart } from "@/components/elevation-profile-chart"
import { SegmentCard } from "@/components/segment-card"
import { RaceTracker } from "@/components/race-tracker"
import { parseNutritionCSV, parseSegmentDataCSV, combineSegmentData } from "@/lib/csv-data"

const RaceMap = dynamic(() => import('@/components/RaceMap'), { ssr: false })

export default function RacePlannerPage() {
  const [currentSegmentId, setCurrentSegmentId] = useState<number>(1)
  const [segmentsData, setSegmentsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [manualMode, setManualMode] = useState(false)
  const [corredorPosition, setCorredorPosition] = useState<{ lat: number; lon: number } | undefined>(undefined)
  const [raceApiData, setRaceApiData] = useState<any>({})

  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setLoading(true)
        
        // Cargar los archivos CSV
        const [nutritionResponse, segmentResponse] = await Promise.all([
          fetch('/plan_nutricion_carrera.csv'),
          fetch('/df_final.csv')
        ])
        
        const nutritionText = await nutritionResponse.text()
        const segmentText = await segmentResponse.text()
        
        // Parsear los datos
        const nutritionData = parseNutritionCSV(nutritionText)
        const segmentData = parseSegmentDataCSV(segmentText)
        
        // Combinar los datos
        const combinedData = combineSegmentData(segmentData, nutritionData)
        setSegmentsData(combinedData)
        
      } catch (error) {
        console.error('Error loading CSV data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCSVData()
  }, [])

  // Función para actualizar la ubicación desde el tracker
  const handleLocationUpdate = (segmentId: number, lat?: number, lon?: number) => {
    if (!manualMode) {
      setCurrentSegmentId(segmentId)
    }
    if (lat !== undefined && lon !== undefined) {
      setCorredorPosition({ lat, lon })
    }
  }

  const currentSegment = segmentsData.find(s => s.id === currentSegmentId)
  const completedSegments = segmentsData.filter(s => s.id < currentSegmentId)
  const totalDistance = segmentsData.length > 0 ? segmentsData[segmentsData.length - 1].cumulativeKm : 0
  const completedDistance = currentSegment ? (currentSegment.cumulativeKm - currentSegment.distanceKm) : 0

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold">Cargando datos de la carrera...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-slate-50 min-h-screen">
      {/* Card de datos principales de la API */}
      <Card className="bg-gradient-to-r from-red-600 to-orange-400 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Activity className="h-7 w-7" />
            Estado en Vivo del Corredor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div>
              <span className="font-semibold">Estado:</span> {raceApiData.estado || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Última actualización:</span> {raceApiData.ultimaActualizacion || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Distancia total:</span> {raceApiData.distancia || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Velocidad actual:</span> {raceApiData.velocidadActual || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Velocidad media:</span> {raceApiData.velocidadMedia || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Velocidad mov.:</span> {raceApiData.velocidadMov || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Desnivel acumulado:</span> {raceApiData.desnivel || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Elevación actual:</span> {raceApiData.elevacion || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Distancia/día:</span> {raceApiData.distanciaDia || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Tiempo en movimiento:</span> {raceApiData.tiempoMov || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Tiempo parado:</span> {raceApiData.tiempoParado || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Siguiente punto:</span> {raceApiData.siguienteWp || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Distancia a siguiente:</span> {raceApiData.distSiguienteWp || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Llegada estimada:</span> {raceApiData.llegadaWp || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Tracker en Vivo */}
      <RaceTracker 
        onLocationUpdate={(segmentId: number, lat?: number, lon?: number) => handleLocationUpdate(segmentId, lat, lon)}
        segmentsData={segmentsData}
        setCorredorPosition={setCorredorPosition}
        setRaceApiData={setRaceApiData}
      />
      {/* Mapa de la ruta y posición */}
      <RaceMap corredorPosition={corredorPosition} />

      {/* Header con información general */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span className="flex items-center">
              <Flag className="mr-3 h-6 w-6" />
              Tahoe 200 - Plan de Carrera
            </span>
            <span className="text-lg font-normal">
              {completedDistance.toFixed(1)} / {totalDistance.toFixed(1)} km
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{completedSegments.length}</div>
              <div className="text-sm opacity-90">Segmentos Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{currentSegmentId}</div>
              <div className="text-sm opacity-90">Segmento Actual</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{segmentsData.length - currentSegmentId}</div>
              <div className="text-sm opacity-90">Segmentos Restantes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil de Elevación */}
      <ElevationProfileChart 
        currentSegmentId={currentSegmentId} 
        results={null}
        segmentsData={segmentsData}
        currentSegment={currentSegment}
      />

      {/* Selector de Segmento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Seleccionar Segmento
            </span>
            <label className="flex items-center text-sm font-normal">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                className="mr-2"
              />
              Modo Manual
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentSegment" className="text-sm font-medium mb-2 block">
                Segmento Actual de la Carrera {!manualMode && "(Actualización automática activada)"}
              </Label>
              <Select
                value={String(currentSegmentId)}
                onValueChange={(value) => setCurrentSegmentId(Number(value))}
                disabled={!manualMode}
              >
                <SelectTrigger id="currentSegment" className="w-full">
                  <SelectValue placeholder="Seleccionar segmento" />
                </SelectTrigger>
                <SelectContent>
                  {segmentsData.map((segment) => (
                    <SelectItem key={segment.id} value={String(segment.id)}>
                      {segment.id}. {segment.name} ({segment.distanceKm.toFixed(1)} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {currentSegment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Segmento seleccionado:</strong> {currentSegment.name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Distancia acumulada: {currentSegment.cumulativeKm.toFixed(1)} km
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Segmentos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Información de Segmentos
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {segmentsData.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              isActive={segment.id === currentSegmentId}
              isCompleted={segment.id < currentSegmentId}
            />
          ))}
        </div>
      </div>

      {/* Resumen Total */}
      {segmentsData.length > 0 && (
        <Card className="shadow-lg mt-8">
          <CardFooter className="p-6 bg-slate-700 text-white rounded-md">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold">
                    {segmentsData.reduce((sum, s) => sum + s.nutrition.carbs, 0).toFixed(0)}g
                  </div>
                  <div className="text-sm opacity-80 mt-1">Carbohidratos Totales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {segmentsData.reduce((sum, s) => sum + s.nutrition.calories, 0).toFixed(0)}
                  </div>
                  <div className="text-sm opacity-80 mt-1">Calorías Totales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {segmentsData.reduce((sum, s) => sum + s.nutrition.liters, 0).toFixed(1)}L
                  </div>
                  <div className="text-sm opacity-80 mt-1">Agua Total</div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
