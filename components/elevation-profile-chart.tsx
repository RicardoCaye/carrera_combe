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
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  // Generate detailed elevation profile data starting from km 0
  const generateElevationProfile = () => {
    const points = []
    let cumulativeDistance = 0
    const baselineElevation = 1500
    const numberOfLines = 5 // Always use mobile number of lines

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

      const numPoints = Math.max(4, Math.floor(segment.distanceKm / 4)) // Fewer points for mobile
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
        <div className="bg-white/95 backdrop-blur-sm p-2 border border-gray-300 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-gray-800">{`${label.toFixed(1)} km`}</p>
          <p className="text-blue-600">{`${payload[0].value.toFixed(0)} m`}</p>
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
    <div className="bg-gray-50 rounded-2xl p-2">
      {/* Top Controls - Mobile style */}
      <header className="flex justify-between items-center mb-4">
        <button className="flex items-center gap-1 px-2 py-1 bg-gray-200/80 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors text-xs">
          <Settings size={16} />
        </button>
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
              </defs>

              <YAxis
                domain={[1500, 3500]}
                ticks={[1500, 2500, 3500]}
                tickFormatter={(tick) => `${tick} M`}
                axisLine={false}
                tickLine={false}
                width={40}
                tick={{ fill: "#6b7280", fontSize: 10 }}
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
                      r={isCurrent ? 6 : 3}
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
      </div>
    </div>
  )
}
