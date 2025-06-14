"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Timer, TrendingUp } from "lucide-react";
import { useRaceTracker } from "@/hooks/use-race-tracker";

interface RaceTrackerProps {
  onLocationUpdate: (segmentId: number, lat?: number, lon?: number) => void;
  segmentsData: any[];
  setCorredorPosition?: (pos: { lat: number; lon: number } | undefined) => void;
  setRaceApiData?: (data: any) => void;
}

function transformarDatosApi(raceData: any) {
  if (!raceData) return {};
  // Transformar y traducir todos los campos relevantes
  const getNum = (str: string, factor = 1) => {
    if (!str) return undefined;
    const num = parseFloat(str.replace(/[^\d.\-]/g, ''));
    return isNaN(num) ? undefined : (num * factor);
  };
  return {
    estado: raceData['Race Status'] || 'N/A',
    ultimaActualizacion: raceData["Last Update Rec'd"] || 'N/A',
    velocidadActual: getNum(raceData['Current speed'], 1.60934)?.toFixed(1) + ' km/h' || 'N/A',
    velocidadMedia: getNum(raceData['Route average speed'], 1.60934)?.toFixed(1) + ' km/h' || 'N/A',
    velocidadMov: getNum(raceData['Moving Average Speed'], 1.60934)?.toFixed(1) + ' km/h' || 'N/A',
    distancia: getNum(raceData['Route mile'], 1.60934)?.toFixed(1) + ' km' || 'N/A',
    desnivel: getNum(raceData['Elevation Gain'], 0.3048)?.toFixed(0) + ' m' || 'N/A',
    elevacion: getNum(raceData['Current Elevation'], 0.3048)?.toFixed(0) + ' m' || 'N/A',
    distanciaDia: getNum(raceData['Route distance per day'], 1.60934)?.toFixed(1) + ' km' || 'N/A',
    tiempoMov: raceData['Moving Time'] || 'N/A',
    tiempoParado: raceData['Stopped Time'] || 'N/A',
    siguienteWp: raceData['Next waypoint'] || 'N/A',
    distSiguienteWp: getNum(raceData['Distance to next waypoint'], 1.60934)?.toFixed(1) + ' km' || 'N/A',
    llegadaWp: raceData['Est. arrival at waypoint'] || 'N/A',
  };
}

export function RaceTracker({ onLocationUpdate, segmentsData, setCorredorPosition, setRaceApiData }: RaceTrackerProps) {
  const { raceData, currentLocation, loading, error } = useRaceTracker(segmentsData);

  useEffect(() => {
    if (currentLocation?.segmentId) {
      let lat: number | undefined = undefined;
      let lon: number | undefined = undefined;
      if (raceData && raceData['Latitude'] && raceData['Longitude']) {
        lat = parseFloat(raceData['Latitude']);
        lon = parseFloat(raceData['Longitude']);
        if (!isNaN(lat) && !isNaN(lon)) {
          if (setCorredorPosition) setCorredorPosition({ lat, lon });
          onLocationUpdate(currentLocation.segmentId, lat, lon);
        } else {
          if (setCorredorPosition) setCorredorPosition(undefined);
          onLocationUpdate(currentLocation.segmentId);
        }
      } else {
        if (setCorredorPosition) setCorredorPosition(undefined);
        onLocationUpdate(currentLocation.segmentId);
      }
    }
  }, [currentLocation?.segmentId, onLocationUpdate, raceData, setCorredorPosition]);

  useEffect(() => {
    if (setRaceApiData && raceData) {
      setRaceApiData(transformarDatosApi(raceData));
    }
  }, [raceData, setRaceApiData]);

  if (loading && !raceData) {
    return (
      <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Cargando datos del tracker...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Error al cargar datos del tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm opacity-90">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!raceData) return null;

  const speedKmh = raceData['Current speed'] ? 
    (parseFloat(raceData['Current speed'].replace(' mph', '')) * 1.60934).toFixed(1) : '0.0';
  
  const avgSpeedKmh = raceData['Average speed'] ? 
    (parseFloat(raceData['Average speed'].replace(' mph', '')) * 1.60934).toFixed(1) : '0.0';

  const routeKm = raceData['Route mile'] ? 
    (parseFloat(raceData['Route mile'].replace(' mi', '')) * 1.60934).toFixed(1) : '0.0';

  const elevationM = raceData['Current Elevation'] ? 
    (parseFloat(raceData['Current Elevation'].replace(' ft', '')) * 0.3048).toFixed(0) : '0';

  const elevationGainM = raceData['Elevation Gain'] ? 
    (parseFloat(raceData['Elevation Gain'].replace(' ft', '')) * 0.3048).toFixed(0) : '0';

  return (
    <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Tracker en Vivo - Jorge Combe
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white border-white/30"
          >
            {raceData['Race Status'] || 'Sin estado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ubicación actual */}
        {currentLocation && (
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Ubicación Actual
              </h4>
              <Badge className="bg-green-400 text-green-900">
                Segmento {currentLocation.segmentId}
              </Badge>
            </div>
            <p className="text-lg font-bold">{currentLocation.segmentName}</p>
            <p className="text-sm opacity-90 mt-1">
              Km {routeKm} - {currentLocation.progressInSegment.toFixed(1)}% del segmento
            </p>
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80">Velocidad Actual</p>
            <p className="text-xl font-bold">{speedKmh} km/h</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80">Velocidad Media</p>
            <p className="text-xl font-bold">{avgSpeedKmh} km/h</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80">Distancia</p>
            <p className="text-xl font-bold">{routeKm} km</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80">Elevación</p>
            <p className="text-xl font-bold">{elevationM} m</p>
          </div>
        </div>

        {/* Tiempos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80 flex items-center">
              <Timer className="mr-1 h-3 w-3" />
              Tiempo en Movimiento
            </p>
            <p className="text-lg font-bold">{raceData['Moving Time'] || 'N/A'}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <p className="text-xs opacity-80 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              Desnivel Acumulado
            </p>
            <p className="text-lg font-bold">+{elevationGainM} m</p>
          </div>
        </div>

        {/* Última actualización */}
        <div className="text-center pt-2 border-t border-white/20">
          <p className="text-xs opacity-70">
            Última actualización: {raceData['Last Update Rec\'d'] || 'Sin datos'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 