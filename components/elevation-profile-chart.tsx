"use client"

import { useState, useRef, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot, CartesianGrid } from "recharts"
import { Settings, Utensils, Droplet, BedDouble, Package, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { SEGMENTS_DATA } from "@/lib/data"
import { parseGPXFile, generateElevationDataFromGPX, generateDetailedElevationData, calculateSegmentDataFromGPX } from "@/lib/gpx-parser"

interface ElevationProfileChartProps {
  currentSegmentId: number
  results?: any // Agregamos los resultados para mostrar información adicional
}

export function ElevationProfileChart({ currentSegmentId, results }: ElevationProfileChartProps) {
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

  // Cargar datos del GPX
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
          
          // Calcular datos de segmentos desde GPX
          const segmentDistances = SEGMENTS_DATA.map(s => s.cumulativeDistanceKm || 0)
          const calculatedSegmentData = calculateSegmentDataFromGPX(gpxData.tracks[0].points, segmentDistances)
          setSegmentDataFromGPX(calculatedSegmentData)
        }
      } catch (error) {
        console.error('Error loading GPX data:', error)
        // Fallback a datos generados si falla la carga del GPX
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

  // Función para formatear duración
  const formatDuration = (hours?: number) => {
    if (hours === undefined || hours === null) return "N/A"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  // Función para obtener datos base del segmento (ahora con datos del GPX si están disponibles)
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

  // Función para obtener información de resultados del segmento
  const getSegmentResultData = (segmentId: number) => {
    if (!results?.segments) return null
    return results.segments.find((s: any) => s.id === segmentId)
  }

  const totalDistance = SEGMENTS_DATA[SEGMENTS_DATA.length - 1].cumulativeDistanceKm || 330.8

  const segmentsForDisplay = SEGMENTS_DATA.map((segment, index) => ({
    ...segment,
    cumulativeDist: segment.cumulativeDistanceKm || 0, 
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

  // Use ResizeObserver to get the exact chart dimensions for perfect alignment
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

  // Función para formatear números con separador de miles
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

  // Calculate the exact position for a dot based on its distance
  const calculateDotPosition = (distance: number) => {
    const leftMargin = 40 // Always use mobile margins
    const rightMargin = 20
    const availableWidth = chartWidth - leftMargin - rightMargin
    const position = (distance / totalDistanceReal) * availableWidth + leftMargin
    return position
  }

  // Mobile segment navigation
  const nextSegment = () => {
    setCurrentSegmentIndex((prev) => Math.min(prev + 1, segmentsForDisplay.length - 1))
  }

  const prevSegment = () => {
    setCurrentSegmentIndex((prev) => Math.max(prev - 1, 0))
  }

  const currentSegmentForMobile = segmentsForDisplay[currentSegmentIndex]

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-2">
        <div className="flex items-center justify-center h-[250px]">
          <div className="text-gray-500">Cargando datos de elevación...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-2">
      {/* Top Controls - Mobile style */}
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

      {/* Combined Chart and Segments Container */}
      <div className="relative">
        {/* Altimetry Chart Section */}
        <div className="w-full h-[250px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={elevationData}
              margin={{
                top: 10,
                right: 20,
                left: 40,
                bottom: 10,
              }}
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
              </defs>

              <YAxis
                domain={[Number.isFinite(minElevation) ? minElevation : 0, Number.isFinite(maxElevation) ? maxElevation : 0]}
                ticks={[
                  Number.isFinite(minElevation) ? minElevation : 0,
                  Number.isFinite(minElevation) && Number.isFinite(maxElevation)
                    ? Math.round((minElevation + maxElevation) / 2)
                    : 0,
                  Number.isFinite(maxElevation) ? maxElevation : 0
                ]}
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

              {/* Decorative lines - fewer on mobile */}
              {Array.from({ length: 5 }, (_, i) => (
                <Area
                  key={`line-${i + 1}`}
                  type="monotone"
                  dataKey={`line_${i + 1}`}
                  stroke="#60a5fa"
                  fill="none"
                  strokeWidth={1}
                  opacity={0.5}
                  dot={false}
                  activeDot={false}
                />
              ))}

              {/* Main elevation area con azul siempre debajo */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="none" 
                fill="url(#elevationGradient)" 
                dot={false}
              />

              {/* Completed section with red gradient (solo overlay visual) */}
              {(() => {
                const currentSegment = SEGMENTS_DATA.find(s => s.id === currentSegmentId)
                const completedDistance = currentSegment ? (currentSegment.cumulativeDistanceKm || 0) - (currentSegment.distanceKm || 0) : 0
                if (completedDistance > 0) {
                  const completedData = elevationData.filter(d => d.distance <= completedDistance)
                  return (
                    <Area 
                      type="monotone" 
                      dataKey="elevation" 
                      stroke="none" 
                      fill="url(#completedGradient)" 
                      dot={false}
                      data={completedData}
                    />
                  )
                }
                return null
              })()}

              {/* Solid top line of the elevation - blue para todo, rojo solo overlay */}
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#3b82f6" 
                fill="none" 
                strokeWidth={2} 
                dot={false}
              />
              {(() => {
                const currentSegment = SEGMENTS_DATA.find(s => s.id === currentSegmentId)
                const completedDistance = currentSegment ? (currentSegment.cumulativeDistanceKm || 0) - (currentSegment.distanceKm || 0) : 0
                if (completedDistance > 0) {
                  return (
                    <Area 
                      type="monotone" 
                      dataKey="elevation" 
                      stroke="#ef4444" 
                      fill="none" 
                      strokeWidth={2} 
                      dot={false}
                      data={elevationData.filter(d => d.distance <= completedDistance)}
                    />
                  )
                }
                return null
              })()}

              {/* Add markers for each segment end */}
              {segmentsForDisplay.map((segment) => {
                const dataPoint = elevationData.find((d) => Math.abs(d.distance - segment.cumulativeDist) < 1)
                if (dataPoint) {
                  const isSelectedInCard = segment.id === currentSegmentForMobile.id
                  const isCompleted = segment.id < currentSegmentId
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

        {/* Mobile Segment Display - Single segment with navigation */}
        <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevSegment}
              disabled={currentSegmentIndex === 0}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-center flex-1">
              <div className="text-xs text-gray-500 mb-1">
                Segmento {currentSegmentIndex + 1} de {segmentsForDisplay.length}
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  currentSegmentForMobile.id === currentSegmentId
                    ? "bg-amber-500 text-white"
                    : currentSegmentForMobile.id < currentSegmentId
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                }`}
              >
                {currentSegmentForMobile.name}
              </div>
              {/* Status badge */}
              <div className="mt-1">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    currentSegmentForMobile.id < currentSegmentId
                      ? "bg-green-500 text-white"
                      : currentSegmentForMobile.id === currentSegmentId
                        ? "bg-amber-500 text-white"
                        : "bg-slate-500 text-white"
                  }`}
                >
                  {currentSegmentForMobile.id < currentSegmentId
                    ? "COMPLETED"
                    : currentSegmentForMobile.id === currentSegmentId
                      ? "CURRENT"
                      : "FUTURE"}
                </span>
              </div>
            </div>

            <button
              onClick={nextSegment}
              disabled={currentSegmentIndex === segmentsForDisplay.length - 1}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Información básica del segmento */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-600 text-xs">Distancia</div>
              <div className="font-semibold">{formatNumber(currentSegmentForMobile.segmentDist, 1)} km</div>
            </div>
            <div>
              <div className="text-gray-600 text-xs">Total</div>
              <div className="font-semibold">{formatNumber(Math.round(currentSegmentForMobile.cumulativeDist), 0)} km</div>
            </div>
            <div>
              <div className="text-gray-600 text-xs">Elevación</div>
              <div className="font-semibold">
                {formatNumber(currentSegmentForMobile.startElevationM)}m → {formatNumber(currentSegmentForMobile.endElevationM)}m
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-xs">Servicios</div>
              <div className="flex gap-1 mt-1">
                {currentSegmentForMobile.aid.food && <Utensils size={14} className="text-gray-600" />}
                {currentSegmentForMobile.aid.water && <Droplet size={14} className="text-blue-600" />}
                {currentSegmentForMobile.aid.dropbag && <Package size={14} className="text-gray-600" />}
                {currentSegmentForMobile.aid.sleep && <BedDouble size={14} className="text-purple-600" />}
              </div>
            </div>
          </div>

          {/* Información detallada de resultados */}
          {(() => {
            const segmentResult = getSegmentResultData(currentSegmentForMobile.id)
            const baseSegmentData = getSegmentBaseData(currentSegmentForMobile.id)
            const restDuration = baseSegmentData?.fixedRestHours || 0
            const sleepDuration = baseSegmentData?.sleepHours || 0

            if (!segmentResult) return null

            return (
              <div className="border-t pt-4 space-y-3">
                {/* Tiempo */}
                <div className="text-sm">
                  <div className="text-gray-600 text-xs mb-1">Tiempo</div>
                  <div className="font-semibold">
                    {segmentResult.category === "completed"
                      ? `${formatDuration(segmentResult.actualTimeHours)} (Real)`
                      : `${formatDuration(
                          segmentResult.plannedTimeHours
                            ? segmentResult.plannedTimeHours - restDuration - sleepDuration
                            : undefined,
                        )} (Planeado)`}
                    {segmentResult.rank && ` • Rank: ${formatNumber(segmentResult.rank)}`}
                  </div>
                </div>

                {/* Ascenso */}
                {typeof baseSegmentData?.elevationGainM === 'number' && (
                  <div className="text-sm">
                    <div className="text-gray-600 text-xs mb-1">Ascenso</div>
                    <div className="font-semibold">{formatNumber(baseSegmentData.elevationGainM ?? 0)}m</div>
                  </div>
                )}

                {/* Descenso */}
                {typeof baseSegmentData?.elevationLossM === 'number' ? (
                  <div className="text-sm">
                    <div className="text-gray-600 text-xs mb-1">Descenso</div>
                    <div className="font-semibold">{formatNumber(baseSegmentData.elevationLossM ?? 0)}m</div>
                  </div>
                ) : null}

                {/* Nutrición y descanso */}
                {segmentResult.category === "current" && segmentResult.nutritionPlan ? (
                  <div className="text-sm">
                    <div className="text-gray-600 text-xs mb-1">Nutrición</div>
                    <div className="font-semibold">
                      Pouch: {segmentResult.nutritionPlan.pouch}, Polvo: {segmentResult.nutritionPlan.powder}
                      {segmentResult.waterLiters && ` • Agua: ${formatNumber(segmentResult.waterLiters, 1)}L`}
                    </div>
                  </div>
                ) : (
                  <>
                    {restDuration > 0 && (
                      <div className="text-sm">
                        <div className="text-gray-600 text-xs mb-1">Descanso</div>
                        <div className="font-semibold">{formatDuration(restDuration)}</div>
                      </div>
                    )}
                    {sleepDuration > 0 && (
                      <div className="text-sm">
                        <div className="text-gray-600 text-xs mb-1">Sueño</div>
                        <div className="font-semibold">{formatDuration(sleepDuration)}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
