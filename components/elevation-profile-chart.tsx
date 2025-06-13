"use client"

import { useState, useRef, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot, CartesianGrid } from "recharts"
import { Settings, Utensils, Droplet, BedDouble, Package, MapPin, ChevronLeft, ChevronRight, Mountain, TrendingUp, TrendingDown, Calendar, Clock, Zap, AlertCircle } from "lucide-react"
import { SEGMENTS_DATA } from "@/lib/data"
import { parseGPXFile, generateElevationDataFromGPX, generateDetailedElevationData, calculateSegmentDataFromGPX } from "@/lib/gpx-parser"

interface ElevationProfileChartProps {
  currentSegmentId: number
  results?: any
  segmentsData?: any[]
  currentSegment?: any
}

export function ElevationProfileChart({ currentSegmentId, results, segmentsData, currentSegment }: ElevationProfileChartProps) {
  const [activeView, setActiveView] = useState("Profile")
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [elevationData, setElevationData] = useState<any[]>([])
  const [gpxData, setGpxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalDistanceReal, setTotalDistanceReal] = useState(0)
  const [minElevation, setMinElevation] = useState(0)
  const [maxElevation, setMaxElevation] = useState(0)
  const [segmentDataFromGPX, setSegmentDataFromGPX] = useState<any[]>([])

  useEffect(() => {
    const loadGPXData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/track_generado.gpx')
        const gpxText = await response.text()
        const gpxData = parseGPXFile(gpxText)
        
        if (gpxData && gpxData.tracks.length > 0) {
          const elevationData = generateElevationDataFromGPX(gpxData.tracks[0].points)
          setElevationData(elevationData)
          setTotalDistanceReal(gpxData.totalDistance)
          setMinElevation(gpxData.minElevation)
          setMaxElevation(gpxData.maxElevation)
          setGpxData(gpxData)
          
          const segmentDistances = SEGMENTS_DATA.map(s => s.cumulativeKms || 0)
          const calculatedSegmentData = calculateSegmentDataFromGPX(gpxData.tracks[0].points, segmentDistances)
          setSegmentDataFromGPX(calculatedSegmentData)
        }
      } catch (error) {
        console.error('Error loading GPX data:', error)
        const fallbackData = generateDetailedElevationData()
        setElevationData(fallbackData)
        setTotalDistanceReal(320)
        setMinElevation(1500)
        setMaxElevation(3500)
      } finally {
        setLoading(false)
      }
    }

    loadGPXData()
  }, [])

  useEffect(() => {
    const index = SEGMENTS_DATA.findIndex(s => s.id === currentSegmentId)
    if (index !== -1) {
      setCurrentSegmentIndex(index)
    }
  }, [currentSegmentId])
  
  const formatDuration = (hours?: number) => {
    if (hours === undefined || hours === null) return "N/A"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getSegmentBaseData = (segmentId: number) => {
    const baseData = SEGMENTS_DATA.find((s) => s.id === segmentId)
    const gpxSegmentData = segmentDataFromGPX.find((s) => s.segmentId === segmentId)
    
    if (baseData && gpxSegmentData) {
      return {
        ...baseData,
        distanceKm: gpxSegmentData.distanceKm,
        startElevationM: gpxSegmentData.startElevationM,
        endElevationM: gpxSegmentData.endElevationM,
        elevationGainM: gpxSegmentData.elevationGainM,
        elevationLossM: gpxSegmentData.elevationLossM
      }
    }
    
    return baseData
  }

  const getSegmentResultData = (segmentId: number) => {
    if (!results?.segments) return null
    return results.segments.find((s: any) => s.id === segmentId)
  }

  const totalDistance = SEGMENTS_DATA[SEGMENTS_DATA.length - 1].cumulativeKms || 330.8

  const segmentsForDisplay = SEGMENTS_DATA.map((segment, index) => ({
    ...segment,
    cumulativeDist: segment.cumulativeKms || 0, 
    segmentDist: (() => {
      const gpxSegmentData = segmentDataFromGPX.find((s) => s.segmentId === segment.id)
      return gpxSegmentData ? gpxSegmentData.distanceKm : segment.distanceKm
    })(),
    startElevationM: (() => {
      const gpxSegmentData = segmentDataFromGPX.find((s) => s.segmentId === segment.id)
      return gpxSegmentData ? gpxSegmentData.startElevationM : segment.startElevationM
    })(),
    endElevationM: (() => {
      const gpxSegmentData = segmentDataFromGPX.find((s) => s.segmentId === segment.id)
      return gpxSegmentData ? gpxSegmentData.endElevationM : segment.endElevationM
    })(),
    time: index === 0 ? "Start" : index === SEGMENTS_DATA.length - 1 ? "Finish" : "",
    aid: {
      food: segment.id >= 5 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 3) + 1,
      water: true,
      dropbag: segment.id === 4 || segment.id === 8,
      sleep: segment.sleepHours && segment.sleepHours > 0,
    },
  }))

  useEffect(() => {
    if (!chartRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setChartWidth(width)
      }
    })

    resizeObserver.observe(chartRef.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-2 border border-gray-300 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-gray-800">{`${formatNumber(Number(label), 1)} km`}</p>
          <p className="text-blue-600">{`${formatNumber(Math.round(Number(payload[0].value)))} m`}</p>
        </div>
      )
    }
    return null
  }

  const nextSegment = () => {
    setCurrentSegmentIndex((prev) => Math.min(prev + 1, segmentsForDisplay.length - 1))
  }

  const prevSegment = () => {
    setCurrentSegmentIndex((prev) => Math.max(prev - 1, 0))
  }

  const currentSegmentForMobile = segmentsForDisplay[currentSegmentIndex]

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-2">
        <div className="flex items-center justify-center h-[250px]">
          <div className="text-gray-500">Cargando datos de elevación...</div>
        </div>
      </div>
    )
  }

  // Pre-calculamos la distancia completada para usarla varias veces
  const currentActiveSegment = SEGMENTS_DATA.find(s => s.id === currentSegmentId)
  const completedDistance = currentActiveSegment?.cumulativeKms ?? 0

  return (
    <div className="bg-gray-50 rounded-2xl p-2">
      <header className="flex justify-between items-center mb-4">
        <button className="flex items-center gap-1 px-2 py-1 bg-gray-200/80 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors text-xs">
          <Settings size={16} />
        </button>
        {gpxData && (
          <div className="text-xs text-gray-600">
            Distancia total: {formatNumber(totalDistanceReal, 1)} km | 
            Ascenso: {formatNumber(gpxData.elevationGain)}m | 
            Descenso: {formatNumber(gpxData.elevationLoss)}m
          </div>
        )}
      </header>
      
      <div className="relative">
        <div className="w-full h-[250px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={elevationData}
              margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
            >
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>

                {/* // NUEVO: Definición del clip-path para la sección completada */}
                <clipPath id="clipPathCompleted">
                  <rect x="0" y="0" width={`${(completedDistance / totalDistanceReal) * 100}%`} height="100%" />
                </clipPath>
              </defs>

              <YAxis
                domain={[Number.isFinite(minElevation) ? minElevation : 0, Number.isFinite(maxElevation) ? maxElevation : 0]}
                tickFormatter={(tick) => `${formatNumber(Math.round(Number(tick)))}m`}
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{ fill: "#6b7280", fontSize: 10 }}
              />

              <XAxis
                type="number"
                dataKey="distance"
                domain={[0, totalDistanceReal]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(tick) => formatNumber(Number(tick), 1)}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "black", strokeWidth: 1, strokeDasharray: "3 3" }}
              />

              <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e5e7eb" />
              
              {/* --- CAPAS VISUALES (SIN INTERACTIVIDAD) --- */}

              {/* 1. Área azul de fondo (toda la ruta) */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="none" 
                fill="url(#elevationGradient)" 
                dot={false}
                activeDot={false} // MODIFICADO: Desactiva interacción
                isAnimationActive={false}
              />

              {/* 2. Línea azul superior (toda la ruta) */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#3b82f6" 
                fill="none" 
                strokeWidth={2} 
                dot={false}
                activeDot={false} // MODIFICADO: Desactiva interacción
                isAnimationActive={false}
              />
              
              {/* 3. Área roja (sección completada) */}
              {/* Usamos clip-path para 'cortar' el área visualmente sin cambiar los datos */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="none"
                fill="url(#completedGradient)" 
                dot={false}
                activeDot={false} // MODIFICADO: Desactiva interacción
                isAnimationActive={false}
                clipPath="url(#clipPathCompleted)" // NUEVO: Aplica el clip-path
              />

              {/* 4. Línea roja (sección completada) */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#ef4444" 
                fill="none" 
                strokeWidth={2} 
                dot={false}
                activeDot={false} // MODIFICADO: Desactiva interacción
                isAnimationActive={false}
                clipPath="url(#clipPathCompleted)" // NUEVO: Aplica el clip-path
              />

              {/* --- CAPA DE HOVER (INVISIBLE Y SUPERIOR) --- */}
              {/* // NUEVO: Esta es la capa que captura el hover en TODA la gráfica */}
              <Area
                type="monotone"
                dataKey="elevation"
                fill="transparent"
                stroke="transparent"
                isAnimationActive={false}
                activeDot={{ r: 5, stroke: '#f97316' }} // Muestra un punto al hacer hover
              />

              {/* Markers de segmentos (se mantienen igual) */}
              {segmentsForDisplay.map((segment) => {
                const dataPoint = elevationData.find((d) => Math.abs(d.distance - segment.cumulativeDist) < 1)
                if (dataPoint) {
                  const isSelectedInCard = segment.id === currentSegmentForMobile.id
                  const isCompleted = segment.cumulativeDist < completedDistance
                  const isCurrent = segment.id === currentSegmentId
                  return (
                    <ReferenceDot
                      key={`dot-${segment.id}`}
                      x={dataPoint.distance}
                      y={dataPoint.elevation}
                      r={isSelectedInCard ? 8 : isCurrent ? 6 : 3}
                      fill={isSelectedInCard ? "#f59e0b" : isCurrent ? "#f97316" : isCompleted ? "#ef4444" : "#1d4ed8"}
                      stroke="white"
                      strokeWidth={isSelectedInCard ? 3 : isCurrent ? 2 : 1}
                    />
                  )
                }
                return null
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile Segment Display (sin cambios) */}
        <div className="mt-4">
          {/* Navegación entre segmentos */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-3 shadow-sm">
            <button
              onClick={prevSegment}
              disabled={currentSegmentIndex === 0}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center flex-1">
              <div className="text-sm text-gray-500">
                Segmento {currentSegmentForMobile.id} de {segmentsForDisplay.length}
              </div>
              <div className="text-lg font-bold">
                {currentSegmentForMobile.name}
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-1 ${
                  currentSegmentForMobile.cumulativeDist < completedDistance
                    ? "bg-green-100 text-green-800"
                    : currentSegmentForMobile.id === currentSegmentId
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentSegmentForMobile.cumulativeDist < completedDistance
                  ? "Completado"
                  : currentSegmentForMobile.id === currentSegmentId
                    ? "Actual"
                    : "Futuro"}
              </span>
            </div>

            <button
              onClick={nextSegment}
              disabled={currentSegmentIndex === segmentsForDisplay.length - 1}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Card con información del segmento - mismo estilo que SegmentCard */}
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
            {/* Información de distancia y elevación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Distancia</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(currentSegmentForMobile.segmentDist, 1)} km</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-600">Elevación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-bold text-green-700">
                      +{currentSegment && currentSegmentForMobile.id === currentSegment.id 
                        ? Math.round(currentSegment.elevationGain) 
                        : Math.round(currentSegmentForMobile.elevation || 0)}m
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="font-bold text-red-700">
                      -{currentSegment && currentSegmentForMobile.id === currentSegment.id 
                        ? Math.round(currentSegment.elevationLoss) 
                        : Math.round(currentSegmentForMobile.elevation || 0)}m
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de nutrición - placeholder por ahora */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Nutrición del Segmento
              </h4>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                      ? `${Math.round(currentSegment.nutrition.carbs)}g` 
                      : '--g'}
                  </p>
                  <p className="text-xs text-gray-600">Carbohidratos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                      ? Math.round(currentSegment.nutrition.calories) 
                      : '--'}
                  </p>
                  <p className="text-xs text-gray-600">Calorías</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                      ? `${currentSegment.nutrition.liters.toFixed(1)}L` 
                      : '--L'}
                  </p>
                  <p className="text-xs text-gray-600">Agua</p>
                </div>
              </div>

              {/* Detalle de productos si hay datos */}
              {currentSegment && currentSegmentForMobile.id === currentSegment.id && (
                <div className="border-t border-orange-200 pt-3">
                  <div className="grid grid-cols-4 gap-2">
                    {currentSegment.nutrition.polvo > 0 && (
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-lg font-bold">{currentSegment.nutrition.polvo}</p>
                        <p className="text-xs text-gray-600">Polvo</p>
                      </div>
                    )}
                    {currentSegment.nutrition.barras > 0 && (
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-lg font-bold">{currentSegment.nutrition.barras}</p>
                        <p className="text-xs text-gray-600">Barras</p>
                      </div>
                    )}
                    {currentSegment.nutrition.geles > 0 && (
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-lg font-bold">{currentSegment.nutrition.geles}</p>
                        <p className="text-xs text-gray-600">Geles</p>
                      </div>
                    )}
                    {currentSegment.nutrition.pouch > 0 && (
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-lg font-bold">{currentSegment.nutrition.pouch}</p>
                        <p className="text-xs text-gray-600">Pouch</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Información de tiempo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Inicio:
                </span>
                <span className="font-medium text-sm">
                  {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                    ? new Date(currentSegment.timing.start).toLocaleString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Fin estimado:</span>
                <span className="font-medium text-sm">
                  {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                    ? new Date(currentSegment.timing.end).toLocaleString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Duración:
                </span>
                <span className="font-bold text-lg">
                  {currentSegment && currentSegmentForMobile.id === currentSegment.id 
                    ? formatDuration(currentSegment.timing.estimatedHours)
                    : '--'}
                </span>
              </div>
              {currentSegment && currentSegmentForMobile.id === currentSegment.id && currentSegment.timing.cutoff && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Cutoff:
                  </span>
                  <span className="font-medium text-red-700">
                    {new Date(currentSegment.timing.cutoff).toLocaleString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Servicios disponibles */}
            <div className="border-t pt-3">
              <div className="text-sm font-medium text-gray-600 mb-2">Servicios disponibles:</div>
              <div className="flex gap-3">
                {currentSegmentForMobile.aid.water && (
                  <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                    <Droplet size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">Agua</span>
                  </div>
                )}
                {currentSegmentForMobile.aid.food && (
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                    <Utensils size={16} className="text-gray-600" />
                    <span className="text-sm font-medium">Comida</span>
                  </div>
                )}
                {currentSegmentForMobile.aid.dropbag && (
                  <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                    <Package size={16} className="text-purple-600" />
                    <span className="text-sm font-medium">Dropbag</span>
                  </div>
                )}
                {currentSegmentForMobile.aid.sleep && (
                  <div className="flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full">
                    <BedDouble size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium">Descanso</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}