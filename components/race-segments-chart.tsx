"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"
import type { CalculatedSegment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RaceSegmentsChartProps {
  data: CalculatedSegment[]
}

export function RaceSegmentsChart({ data }: RaceSegmentsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segment Times Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available to display chart.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data
    .map((segment) => ({
      name: `S${segment.id}`, // Short name for X-axis
      fullName: segment.name,
      plannedTime: segment.plannedTimeHours !== undefined ? Number.parseFloat(segment.plannedTimeHours.toFixed(1)) : 0,
      actualTime: segment.actualTimeHours !== undefined ? Number.parseFloat(segment.actualTimeHours.toFixed(1)) : 0,
      category: segment.category,
    }))
    .filter((item) => item.plannedTime > 0 || item.actualTime > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segment Times Overview (Hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
            <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
            <Tooltip
              formatter={(value, name, props) => [
                `${value} hrs (${props.payload.fullName})`,
                name === "plannedTime" ? "Planned" : "Actual",
              ]}
            />
            <Legend verticalAlign="top" />
            <Bar dataKey="plannedTime" fill="#8884d8" name="Planned Time">
              <LabelList
                dataKey="plannedTime"
                position="top"
                formatter={(value: number) => (value > 0 ? value.toFixed(1) : "")}
              />
            </Bar>
            <Bar dataKey="actualTime" fill="#82ca9d" name="Actual Time">
              <LabelList
                dataKey="actualTime"
                position="top"
                formatter={(value: number) => (value > 0 ? value.toFixed(1) : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
