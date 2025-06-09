"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Flag, BarChart3, Info } from "lucide-react"

import type { UserInputs, CalculationOutput } from "@/lib/types"
import { TARGET_FINISH_TIMES } from "@/lib/types"
import { SEGMENTS_DATA, SAMPLE_HISTORICAL_DATA } from "@/lib/data"
import { calculateRacePlan } from "@/lib/calculations"
import { ElevationProfileChart } from "@/components/elevation-profile-chart"

export default function RacePlannerPage() {
  const [raceStartTime, setRaceStartTime] = useState<string>(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })
  const [targetFinishTime, setTargetFinishTime] = useState<string>(TARGET_FINISH_TIMES[1])
  const [currentSegmentId, setCurrentSegmentId] = useState<number>(SEGMENTS_DATA[0].id)
  const [historicalData, setHistoricalData] = useState(SAMPLE_HISTORICAL_DATA)
  const [results, setResults] = useState<CalculationOutput | null>(null)

  const handleCalculate = () => {
    const inputs: UserInputs = {
      raceStartTime,
      targetFinishTime,
      currentSegmentId,
      historicalData,
    }
    if (!raceStartTime || !targetFinishTime || !currentSegmentId) {
      alert("Please fill in all fields.")
      return
    }
    const output = calculateRacePlan(inputs)
    setResults(output)
  }

  useEffect(() => {
    handleCalculate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatDuration = (hours?: number) => {
    if (hours === undefined || hours === null) return "N/A"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getSegmentBaseData = (segmentId: number) => {
    return SEGMENTS_DATA.find((s) => s.id === segmentId)
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* 🏔️ Perfil de Elevación (Prominente al inicio) */}
      <ElevationProfileChart currentSegmentId={currentSegmentId} />

      {/* ⚙️ Configuración del Plan */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="config">
          <AccordionTrigger>
            <div className="flex items-center text-lg font-semibold">
              <Info className="mr-2 h-5 w-5" /> Configuración del Plan de Carrera
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="shadow-none border-0">
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div>
                    <Label htmlFor="raceStartTime" className="text-sm font-medium">
                      Hora de Inicio
                    </Label>
                    <Input
                      id="raceStartTime"
                      type="datetime-local"
                      value={raceStartTime}
                      onChange={(e) => setRaceStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetFinishTime" className="text-sm font-medium">
                      Tiempo Objetivo
                    </Label>
                    <Select value={targetFinishTime} onValueChange={setTargetFinishTime}>
                      <SelectTrigger id="targetFinishTime" className="mt-1">
                        <SelectValue placeholder="Seleccionar tiempo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_FINISH_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentSegment" className="text-sm font-medium">
                      Segmento Actual
                    </Label>
                    <Select
                      value={String(currentSegmentId)}
                      onValueChange={(value) => setCurrentSegmentId(Number(value))}
                    >
                      <SelectTrigger id="currentSegment" className="mt-1">
                        <SelectValue placeholder="Seleccionar segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENTS_DATA.map((segment) => (
                          <SelectItem key={segment.id} value={String(segment.id)}>
                            {segment.id}: {segment.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Datos Históricos (para segmentos completados)</Label>
                  {SAMPLE_HISTORICAL_DATA.map((item) => (
                    <div key={item.segmentId} className="flex gap-2 items-center p-2 border rounded-md bg-slate-50">
                      <span className="text-xs font-semibold w-24">Seg. {item.segmentId}:</span>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Tiempo (hrs)"
                        defaultValue={item.actualTimeHours}
                        onChange={(e) => {
                          const newData = historicalData.map((hItem) =>
                            hItem.segmentId === item.segmentId
                              ? { ...hItem, actualTimeHours: Number.parseFloat(e.target.value) || 0 }
                              : hItem,
                          )
                          setHistoricalData(newData)
                        }}
                        className="w-28 h-8 text-xs"
                        aria-label={`Tiempo histórico para segmento ${item.segmentId}`}
                      />
                      <Input
                        type="number"
                        placeholder="Rank"
                        defaultValue={item.rank || ""}
                        onChange={(e) => {
                          const newData = historicalData.map((hItem) =>
                            hItem.segmentId === item.segmentId
                              ? { ...hItem, rank: Number.parseInt(e.target.value) || undefined }
                              : hItem,
                          )
                          setHistoricalData(newData)
                        }}
                        className="w-20 h-8 text-xs"
                        aria-label={`Ranking histórico para segmento ${item.segmentId}`}
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleCalculate} className="w-full md:w-auto">
                  <BarChart3 className="mr-2 h-4 w-4" /> Calcular Horario
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {results && (
        <>
          {/* 📝 Notas por Segmento */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Info className="mr-2 h-6 w-6 text-slate-600" />
                Notas por Segmento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.segments.map((segment) => {
                const baseSegmentData = getSegmentBaseData(segment.id)
                const restDuration = baseSegmentData?.fixedRestHours || 0
                const sleepDuration = baseSegmentData?.sleepHours || 0

                return (
                  <div
                    key={segment.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      segment.category === "completed"
                        ? "bg-green-50 border-green-500"
                        : segment.category === "current"
                          ? "bg-amber-50 border-amber-500"
                          : "bg-slate-50 border-slate-400"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="font-semibold text-lg">
                        S{segment.id}: {segment.name}
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          segment.category === "completed"
                            ? "bg-green-500 text-white"
                            : segment.category === "current"
                              ? "bg-amber-500 text-white"
                              : "bg-slate-500 text-white"
                        }`}
                      >
                        {segment.category.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
                      {/* Time info */}
                      <div>
                        <strong>Tiempo:</strong>{" "}
                        {segment.category === "completed"
                          ? `${formatDuration(segment.actualTimeHours)} (Real)`
                          : `${formatDuration(
                              segment.plannedTimeHours
                                ? segment.plannedTimeHours - restDuration - sleepDuration
                                : undefined,
                            )} (Planeado)`}
                        {segment.rank && ` • Rank: ${segment.rank}`}
                      </div>

                      {/* Distance and elevation */}
                      <div>
                        <strong>Distancia:</strong> {baseSegmentData?.distanceKm} km
                        {baseSegmentData?.elevationGainM && ` • Ascenso: ${baseSegmentData.elevationGainM}m`}
                      </div>

                      {/* Nutrition and rest */}
                      <div>
                        {segment.category === "current" && segment.nutritionPlan ? (
                          <>
                            <strong>Nutrición:</strong> Pouch: {segment.nutritionPlan.pouch}, Polvo:{" "}
                            {segment.nutritionPlan.powder}
                            {segment.waterLiters && ` • Agua: ${segment.waterLiters.toFixed(1)}L`}
                          </>
                        ) : (
                          <>
                            {restDuration > 0 && <strong>Descanso:</strong>} {formatDuration(restDuration)}
                            {sleepDuration > 0 && ` • Sueño: ${formatDuration(sleepDuration)}`}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* 🏁 Tiempo Total */}
          <Card className="mt-10 shadow-lg">
            <CardFooter className="p-6 justify-center bg-slate-700 text-white rounded-b-md">
              <div className="text-xl font-bold flex items-center">
                <Flag className="mr-3 h-6 w-6" />
                Tiempo Total Proyectado: {formatDuration(results.projectedTotalTimeHours)}
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}
