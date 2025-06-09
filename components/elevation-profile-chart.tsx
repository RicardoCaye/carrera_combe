"use client"

import { useState, useRef, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot, CartesianGrid } from "recharts"
import { Settings, Utensils, Droplet, BedDouble, Package, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { SEGMENTS_DATA } from "@/lib/data"

interface ElevationProfileChartProps {
  currentSegmentId: number
}

export function ElevationProfileChart({ currentSegmentId }: ElevationProfileChartProps) {
  const [activeView, setActiveView] = useState("Profile")
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Generate detailed elevation profile data starting from km 0
  const generateElevationProfile = () => {
    const points = []
    let cumulativeDistance = 0
    const baselineElevation = 1500
    const numberOfLines = isMobile ? 5 : 9 // Fewer lines on mobile

    // Add starting point at km 0
    points.push({
      distance: 0,
      elevation: SEGMENTS_DATA[0]?.startElevationM || 1912,
      ...Array.from({ length: numberOfLines }, (_, i) => ({
        [`line_${i + 1}`]: baselineElevation + ((2500 - baselineElevation) / (numberOfLines + 1)) * (i + 1),
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    })

    SEGMENTS_DATA.forEach((segment) => {
      const startDistance = cumulativeDistance
      const endDistance = cumulativeDistance + segment.distanceKm
      const startElevation = segment.startElevationM || 1912
      const endElevation = segment.endElevationM || 1912

      const numPoints = Math.max(4, Math.floor(segment.distanceKm / 4)) // Fewer points on mobile
      for (let i = 1; i <= numPoints; i++) {
        const progress = i / numPoints
        const distance = startDistance + segment.distanceKm * progress
        let elevation = startElevation + (endElevation - startElevation) * progress

        if (i < numPoints) {
          const variation =
            Math.sin(progress * Math.PI * 3) * 80 +
            Math.sin(progress * Math.PI * 6) * 40 +
            Math.sin(progress * Math.PI * 12) * 20
          elevation += variation
        }

        const finalElevation = Math.round(Math.max(1500, elevation))

        const pointData: { [key: string]: number } = {
          distance: Math.round(distance * 10) / 10,
          elevation: finalElevation,
        }

        // Calculate the scaled values for the decorative lines
        const totalHeight = finalElevation - baselineElevation
        for (let j = 1; j <= numberOfLines; j++) {
          const scaleFactor = j / (numberOfLines + 1)
          pointData[`line_${j}`] = Math.round(baselineElevation + totalHeight * scaleFactor)
        }

        points.push(pointData)
      }
      cumulativeDistance = endDistance
    })

    return points
  }

  const elevationData = generateElevationProfile()
  const totalDistance = SEGMENTS_DATA[SEGMENTS_DATA.length - 1].cumulativeDistanceKm || 330.8

  const segmentsForDisplay = SEGMENTS_DATA.map((segment, index) => ({
    ...segment,
    cumulativeDist: segment.cumulativeDistanceKm || 0,
    segmentDist: segment.distanceKm,
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-2 md:p-3 border border-gray-300 rounded-lg shadow-lg text-xs md:text-sm">
          <p className="font-bold text-gray-800">{`${label.toFixed(1)} km`}</p>
          <p className="text-blue-600">{`${payload[0].value.toFixed(0)} m`}</p>
        </div>
      )
    }
    return null
  }

  // Calculate the exact position for a dot based on its distance
  const calculateDotPosition = (distance: number) => {
    const leftMargin = isMobile ? 40 : 60
    const rightMargin = isMobile ? 20 : 30
    const availableWidth = chartWidth - leftMargin - rightMargin
    const position = (distance / totalDistance) * availableWidth + leftMargin
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

  return (
    <div className="bg-gray-50 rounded-2xl p-2 md:p-4 lg:p-6">
      {/* Top Controls - Simplified for mobile */}
      <header className="flex justify-between items-center mb-4 md:mb-6">
        <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gray-200/80 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors text-xs md:text-sm">
          <Settings size={16} className="md:w-5 md:h-5" />
          <span className="hidden sm:inline">Config</span>
        </button>
        {!isMobile && (
          <div className="flex items-center bg-gray-200/80 rounded-full p-1">
            {["Profile", "Map", "3D"].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                  activeView === view
                    ? "bg-white text-blue-600 shadow-md"
                    : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Combined Chart and Segments Container */}
      <div className="relative">
        {/* Altimetry Chart Section */}
        <div className={`w-full ${isMobile ? "h-[250px]" : "h-[400px]"}`} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={elevationData}
              margin={{
                top: 10,
                right: isMobile ? 20 : 30,
                left: isMobile ? 40 : 60,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <YAxis
                domain={[1500, 3500]}
                ticks={isMobile ? [1500, 2500, 3500] : [1500, 2000, 2500, 3000, 3500]}
                tickFormatter={(tick) => (isMobile ? `${tick}` : `${tick} M`)}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 40 : 60}
                tick={{ fill: "#6b7280", fontSize: isMobile ? 10 : 12 }}
              />

              <XAxis
                type="number"
                dataKey="distance"
                domain={[0, totalDistance]}
                axisLine={false}
                tickLine={false}
                tick={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "black", strokeWidth: 1, strokeDasharray: "3 3" }}
              />

              <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e5e7eb" />

              {/* Decorative lines - fewer on mobile */}
              {Array.from({ length: isMobile ? 5 : 9 }, (_, i) => (
                <Area
                  key={`line-${i + 1}`}
                  type="monotone"
                  dataKey={`line_${i + 1}`}
                  stroke="#60a5fa"
                  fill="none"
                  strokeWidth={1}
                  opacity={isMobile ? 0.3 : 0.5}
                  dot={false}
                  activeDot={false}
                />
              ))}

              {/* Main elevation area with gradient */}
              <Area type="monotone" dataKey="elevation" stroke="none" fill="url(#elevationGradient)" dot={false} />

              {/* Solid top line of the elevation */}
              <Area type="monotone" dataKey="elevation" stroke="#1d4ed8" fill="none" strokeWidth={2} dot={false} />

              {/* Add markers for each segment end */}
              {segmentsForDisplay.map((segment) => {
                const dataPoint = elevationData.find((d) => Math.abs(d.distance - segment.cumulativeDist) < 1)
                if (dataPoint) {
                  const isCurrent = segment.id === currentSegmentId
                  return (
                    <ReferenceDot
                      key={`dot-${segment.id}`}
                      x={dataPoint.distance}
                      y={dataPoint.elevation}
                      r={isCurrent ? (isMobile ? 6 : 8) : isMobile ? 3 : 5}
                      fill={isCurrent ? "#f59e0b" : "#1d4ed8"}
                      stroke="white"
                      strokeWidth={isCurrent ? 2 : 1}
                    />
                  )
                }
                return null
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical Lines - Hidden on mobile for cleaner look */}
        {!isMobile && chartWidth > 0 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {segmentsForDisplay.map((segment) => {
              const position = calculateDotPosition(segment.cumulativeDist)

              return (
                <div
                  key={`vline-${segment.id}`}
                  className="absolute bg-blue-600 w-0.5 z-10"
                  style={{
                    left: `${position}px`,
                    top: "10px",
                    height: "calc(100% + 100px)",
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Mobile Segment Display - Single segment with navigation */}
        {isMobile ? (
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
              </div>

              <button
                onClick={nextSegment}
                disabled={currentSegmentIndex === segmentsForDisplay.length - 1}
                className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 text-xs">Distancia</div>
                <div className="font-semibold">{currentSegmentForMobile.segmentDist} km</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Total</div>
                <div className="font-semibold">{Math.round(currentSegmentForMobile.cumulativeDist)} km</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Elevación</div>
                <div className="font-semibold">
                  {currentSegmentForMobile.startElevationM}m → {currentSegmentForMobile.endElevationM}m
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
          </div>
        ) : (
          /* Desktop Segments Bar Section */
          <div className="border-t-2 border-gray-200 pt-4" style={{ marginLeft: "60px", marginRight: "30px" }}>
            <div className="relative w-full h-32">
              {chartWidth > 0 &&
                segmentsForDisplay.map((segment, index) => {
                  const startDistance = index === 0 ? 0 : segmentsForDisplay[index - 1].cumulativeDist
                  const endDistance = segment.cumulativeDist

                  const startPosition = calculateDotPosition(startDistance) - 60
                  const endPosition = calculateDotPosition(endDistance) - 60
                  const segmentWidth = endPosition - startPosition

                  return (
                    <div
                      key={segment.id}
                      className={`absolute ${segment.id === currentSegmentId ? "bg-amber-50 rounded-lg" : ""}`}
                      style={{
                        left: `${startPosition}px`,
                        width: `${segmentWidth}px`,
                        height: "100%",
                      }}
                    >
                      <div className="text-xs text-gray-500 flex justify-between items-center mb-2 px-1">
                        <span>{segment.segmentDist} km</span>
                        {index < segmentsForDisplay.length - 1 && <span className="text-gray-400">&rsaquo;</span>}
                      </div>
                      <div className="relative text-center px-1">
                        <div
                          className={`absolute top-[-14px] right-0 font-bold text-[10px] px-1.5 py-0.5 rounded-sm ${
                            segment.id === currentSegmentId
                              ? "bg-amber-600 text-white"
                              : segment.id < currentSegmentId
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white"
                          }`}
                        >
                          {Math.round(segment.cumulativeDist)} KM
                        </div>
                        <p className="font-bold text-sm text-gray-800 mt-2 truncate">{segment.name}</p>
                        <p className="text-xs text-gray-500 truncate">Segmento {segment.id}</p>
                        <p className="text-xs font-semibold text-gray-600 mt-1">{segment.time}</p>
                        {segment.id === currentSegmentId && (
                          <div className="flex justify-center mt-1">
                            <MapPin size={12} className="text-amber-600" />
                          </div>
                        )}
                      </div>

                      <div className="absolute top-[100%] w-full mt-2 text-center">
                        <div className="relative inline-block pt-3">
                          <div className="absolute bottom-[100%] left-1/2 w-[1px] h-3 bg-gray-300"></div>
                          <div className="flex items-start justify-center gap-1.5">
                            {segment.aid.food && (
                              <div className="flex flex-col items-center">
                                <Utensils size={16} className="text-gray-600" />
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1 rounded-sm mt-1">
                                  +{segment.aid.food}
                                </span>
                              </div>
                            )}
                            {segment.aid.water && <Droplet size={16} className="text-blue-600 mt-px" />}
                            {segment.aid.dropbag && <Package size={16} className="text-gray-600 mt-px" />}
                            {segment.aid.sleep && <BedDouble size={16} className="text-purple-600 mt-px" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
