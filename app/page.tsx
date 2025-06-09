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
    <div className="container mx-auto p-4 space-y-8 bg-slate-50 min-h-screen">
      {/* 🏔️ Perfil de Elevación (Prominente al inicio) */}
      <ElevationProfileChart currentSegmentId={currentSegmentId} results={results} />

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
                <div className="grid grid-cols-1 gap-6 items-end">
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
                <Button onClick={handleCalculate} className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" /> Calcular Horario
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {results && (
        <>
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
