"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Flag, BarChart3, Info, Clock, Users, Utensils } from "lucide-react"

import type { UserInputs, CalculationOutput, TargetFinishTime } from "@/lib/types"
import { TARGET_FINISH_TIMES } from "@/lib/types"
import { SEGMENTS_DATA, SAMPLE_HISTORICAL_DATA, DEFAULT_TRANSITION_MINUTES } from "@/lib/data"
import { calculateRacePlan } from "@/lib/calculations"
import { ElevationProfileChart } from "@/components/elevation-profile-chart"

export default function RacePlannerPage() {
  const [raceStartTime, setRaceStartTime] = useState<string>(() => {
    // Siempre inicializar a las 9:00 AM hora de California (Pacific Time)
    const now = new Date()
    const californiaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
    californiaTime.setHours(9, 0, 0, 0)
    const offset = californiaTime.getTimezoneOffset()
    californiaTime.setMinutes(californiaTime.getMinutes() - offset)
    return californiaTime.toISOString().slice(0, 16)
  })
  const [targetFinishTime, setTargetFinishTime] = useState<TargetFinishTime>(TARGET_FINISH_TIMES[1])
  const [transitionMinutes, setTransitionMinutes] = useState<number>(DEFAULT_TRANSITION_MINUTES)
  const [currentSegmentId, setCurrentSegmentId] = useState<number>(SEGMENTS_DATA[0].id)
  const [historicalData, setHistoricalData] = useState(SAMPLE_HISTORICAL_DATA)
  const [results, setResults] = useState<CalculationOutput | null>(null)

  const handleCalculate = () => {
    const inputs: UserInputs = {
      raceStartTime,
      targetFinishTime,
      transitionMinutes,
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
  }, [targetFinishTime, transitionMinutes, currentSegmentId])

  const formatDuration = (hours?: number) => {
    if (hours === undefined || hours === null) return "N/A"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return "N/A"
    const date = new Date(isoString)
    return date.toLocaleString("es-ES", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatNutrition = (nutrition: any) => {
    return `${Math.round(nutrition.carbs)}g carbs, ${Math.round(nutrition.calories)} cal, ${nutrition.liters.toFixed(1)}L`
  }

  return (
    <div className="container mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      {/* 🏔️ Perfil de Elevación */}
      <ElevationProfileChart currentSegmentId={currentSegmentId} results={results} />

      {/* 📅 Tabla de Horarios */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5" />
              Horarios de Segmentos (Hora de California) - Objetivo: {targetFinishTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Segmento</th>
                    <th className="text-left p-2">Inicio</th>
                    <th className="text-left p-2">Fin</th>
                    <th className="text-left p-2">Duración</th>
                    <th className="text-left p-2">Cutoff</th>
                    <th className="text-left p-2">Pacer</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {results.segments.map((segment) => (
                    <tr 
                      key={segment.id} 
                      className={`border-b ${
                        segment.category === "current" ? "bg-blue-50" :
                        segment.category === "completed" ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="p-2 font-medium">
                        {segment.id}: {segment.name}
                      </td>
                      <td className="p-2">
                        {formatTime(segment.startTimeISO)}
                      </td>
                      <td className="p-2">
                        {formatTime(segment.endTimeISO)}
                      </td>
                      <td className="p-2">
                        {segment.category === "completed" && segment.actualTotalTimeHours
                          ? formatDuration(segment.actualTotalTimeHours)
                          : formatDuration(segment.plannedTotalTimeHours)
                        }
                      </td>
                      <td className="p-2 text-red-600">
                        {formatTime(segment.cutoffISO)}
                      </td>
                      <td className="p-2">
                        {segment.pacer || "-"}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          segment.category === "completed" ? "bg-green-100 text-green-800" :
                          segment.category === "current" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {segment.category === "completed" ? "Completado" :
                           segment.category === "current" ? "Actual" : "Futuro"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 👥 Resumen de Pacers */}
      {results && Object.keys(results.pacerSummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Resumen de Pacers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(results.pacerSummary).map(([pacerName, summary]) => (
                <div key={pacerName} className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold text-lg capitalize">{pacerName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDuration(summary.totalHours)} • {summary.totalKms.toFixed(1)} km
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNutrition(summary.nutrition)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🍎 Nutrición Total */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="mr-2 h-5 w-5" />
              Nutrición Total Estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(results.totalNutrition.carbs)}g
                </div>
                <div className="text-sm text-gray-600">Carbohidratos</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(results.totalNutrition.calories)}
                </div>
                <div className="text-sm text-gray-600">Calorías</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.totalNutrition.liters.toFixed(1)}L
                </div>
                <div className="text-sm text-gray-600">Agua</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="targetFinishTime" className="text-sm font-medium">
                      Objetivo de Tiempo
                    </Label>
                    <Select
                      value={targetFinishTime}
                      onValueChange={(value: TargetFinishTime) => setTargetFinishTime(value)}
                    >
                      <SelectTrigger id="targetFinishTime" className="mt-1">
                        <SelectValue placeholder="Seleccionar objetivo" />
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
                    <Label htmlFor="transitionMinutes" className="text-sm font-medium">
                      Tiempo de Transición (minutos)
                    </Label>
                    <Input
                      id="transitionMinutes"
                      type="number"
                      value={transitionMinutes}
                      onChange={(e) => setTransitionMinutes(Number(e.target.value))}
                      className="mt-1"
                      min="0"
                      max="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo de descanso en cada avituallamiento
                    </p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      {currentSegmentId > 1 && (
                        <>Los segmentos 1-{currentSegmentId - 1} se consideran completados</>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="raceStartTime" className="text-sm font-medium">
                      Hora de Inicio (9:00 AM Hora de California)
                    </Label>
                    <Input
                      id="raceStartTime"
                      type="datetime-local"
                      value={raceStartTime}
                      onChange={(e) => setRaceStartTime(e.target.value)}
                      className="mt-1 bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      La carrera siempre comienza a las 9:00 AM hora de California
                    </p>
                  </div>
                </div>

                {/* Información sobre datos históricos */}
                {currentSegmentId > 1 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Datos Históricos</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Para los segmentos completados (1-{currentSegmentId - 1}), se están usando:
                    </p>
                    <div className="space-y-1 text-xs">
                      {SEGMENTS_DATA.filter(s => s.id < currentSegmentId).map(segment => {
                        const hasRealData = historicalData.find(h => h.segmentId === segment.id);
                        return (
                          <div key={segment.id} className="flex justify-between">
                            <span>Segmento {segment.id}: {segment.name}</span>
                            <span className={hasRealData ? "text-green-600 font-medium" : "text-orange-600"}>
                              {hasRealData ? "✓ Datos reales" : "⚠ Estimación automática"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 Los datos marcados como "estimación automática" se calculan basándose en tu objetivo de tiempo actual.
                    </p>
                  </div>
                )}

                <Button onClick={handleCalculate} className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" /> Recalcular Plan
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 🏁 Tiempo Total */}
      {results && (
        <Card className="shadow-lg">
          <CardFooter className="p-6 justify-center bg-slate-700 text-white rounded-b-md">
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center mb-2">
                <Flag className="mr-3 h-6 w-6" />
                Tiempo Total Proyectado: {formatDuration(results.projectedTotalTimeHours)}
              </div>
              <div className="text-sm opacity-80">
                Objetivo: {targetFinishTime} • Transición: {transitionMinutes}min por avituallamiento
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
