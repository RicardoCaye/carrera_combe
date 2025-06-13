"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mountain, Droplet, Zap, Clock, User, TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react"

interface SegmentCardProps {
  segment: {
    id: number;
    name: string;
    distanceKm: number;
    cumulativeKm: number;
    elevationGain: number;
    elevationLoss: number;
    nutrition: {
      pouch: number;
      polvo: number;
      barras: number;
      geles: number;
      carbs: number;
      calories: number;
      liters: number;
    };
    timing: {
      start: string;
      end: string;
      estimatedHours: number;
      accumulatedHours: number;
      cutoff: string;
    };
    pacer: string | null;
    sleepHours: number;
    completionRate: number;
  };
  isActive: boolean;
  isCompleted: boolean;
}

export function SegmentCard({ segment, isActive, isCompleted }: SegmentCardProps) {
  const formatTime = (isoString: string) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <Card className={`transition-all ${
      isActive ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02]' : 
      isCompleted ? 'opacity-70' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl">
            <span className="text-3xl font-bold mr-2">{segment.id}.</span>
            {segment.name}
          </CardTitle>
          <Badge 
            variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
            className="text-sm px-3 py-1"
          >
            {isActive ? "Actual" : isCompleted ? "Completado" : "Futuro"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Información de distancia y elevación */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Mountain className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Distancia</span>
            </div>
            <p className="text-2xl font-bold">{segment.distanceKm.toFixed(1)} km</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-600">Elevación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="font-bold text-green-700">+{Math.round(segment.elevationGain)}m</span>
              </div>
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="font-bold text-red-700">-{Math.round(segment.elevationLoss)}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de nutrición */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Nutrición del Segmento
          </h4>
          
          {/* Resumen principal */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{Math.round(segment.nutrition.carbs)}g</p>
              <p className="text-xs text-gray-600">Carbohidratos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{Math.round(segment.nutrition.calories)}</p>
              <p className="text-xs text-gray-600">Calorías</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{segment.nutrition.liters.toFixed(1)}L</p>
              <p className="text-xs text-gray-600">Agua</p>
            </div>
          </div>
          
          {/* Detalle de productos */}
          <div className="border-t border-orange-200 pt-3">
            <div className="grid grid-cols-4 gap-2">
              {segment.nutrition.polvo > 0 && (
                <div className="text-center bg-white rounded-lg p-2">
                  <p className="text-lg font-bold">{segment.nutrition.polvo}</p>
                  <p className="text-xs text-gray-600">Polvo</p>
                </div>
              )}
              {segment.nutrition.barras > 0 && (
                <div className="text-center bg-white rounded-lg p-2">
                  <p className="text-lg font-bold">{segment.nutrition.barras}</p>
                  <p className="text-xs text-gray-600">Barras</p>
                </div>
              )}
              {segment.nutrition.geles > 0 && (
                <div className="text-center bg-white rounded-lg p-2">
                  <p className="text-lg font-bold">{segment.nutrition.geles}</p>
                  <p className="text-xs text-gray-600">Geles</p>
                </div>
              )}
              {segment.nutrition.pouch > 0 && (
                <div className="text-center bg-white rounded-lg p-2">
                  <p className="text-lg font-bold">{segment.nutrition.pouch}</p>
                  <p className="text-xs text-gray-600">Pouch</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de tiempo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Inicio:
            </span>
            <span className="font-medium text-sm">{formatTime(segment.timing.start)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Fin estimado:</span>
            <span className="font-medium text-sm">{formatTime(segment.timing.end)}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duración:
            </span>
            <span className="font-bold text-lg">{formatDuration(segment.timing.estimatedHours)}</span>
          </div>
          {segment.timing.cutoff && (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Cutoff:
              </span>
              <span className="font-medium text-red-700">{formatTime(segment.timing.cutoff)}</span>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="flex flex-wrap gap-2 pt-2">
          {segment.pacer && (
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <User className="h-4 w-4 mr-1" />
              Pacer: <span className="font-bold ml-1">{segment.pacer}</span>
            </Badge>
          )}
          {segment.sleepHours > 0 && (
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Clock className="h-4 w-4 mr-1" />
              Descanso: <span className="font-bold ml-1">{segment.sleepHours}h</span>
            </Badge>
          )}
          {segment.completionRate > 0 && (
            <Badge variant="outline" className="text-sm py-1 px-3">
              P75: <span className="font-bold ml-1">{(segment.completionRate * 100).toFixed(0)}%</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 