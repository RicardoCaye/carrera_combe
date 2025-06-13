"use client";

import { useState, useEffect, useRef } from 'react';

interface RaceData {
  [key: string]: string;
}

interface CurrentLocation {
  segmentId: number;
  segmentName: string;
  progressInSegment: number;
  distanceInSegmentKm: number;
  completedSegments: number[];
}

export function useRaceTracker(segmentsData: any[]) {
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastValidLocation = useRef<CurrentLocation | null>(null);

  // Función para determinar en qué segmento está el corredor basado en los kilómetros
  const determineCurrentSegment = (currentKm: number) => {
    if (!segmentsData || segmentsData.length === 0) return null;

    // Encontrar el segmento actual comparando con los kilómetros acumulados
    for (let i = 0; i < segmentsData.length; i++) {
      const segment = segmentsData[i];
      const segmentStartKm = i === 0 ? 0 : segmentsData[i - 1].cumulativeKm;
      const segmentEndKm = segment.cumulativeKm;

      if (currentKm >= segmentStartKm && currentKm <= segmentEndKm) {
        // El corredor está en este segmento
        const distanceInSegment = currentKm - segmentStartKm;
        const progressPercentage = (distanceInSegment / segment.distanceKm) * 100;
        
        // Determinar segmentos completados
        const completedSegments = [];
        for (let j = 0; j < i; j++) {
          completedSegments.push(segmentsData[j].id);
        }

        return {
          segmentId: segment.id,
          segmentName: segment.name,
          progressInSegment: progressPercentage,
          distanceInSegmentKm: distanceInSegment,
          completedSegments
        };
      }
    }

    // Si el corredor ha pasado todos los segmentos
    if (currentKm > segmentsData[segmentsData.length - 1].cumulativeKm) {
      return {
        segmentId: segmentsData.length,
        segmentName: "Finalizado",
        progressInSegment: 100,
        distanceInSegmentKm: 0,
        completedSegments: segmentsData.map(s => s.id)
      };
    }

    // Si no se encuentra, usar el primer segmento
    return {
      segmentId: 1,
      segmentName: segmentsData[0].name,
      progressInSegment: 0,
      distanceInSegmentKm: 0,
      completedSegments: []
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("Obteniendo datos del tracker...");
      try {
        // Usar nuestra ruta API local
        const response = await fetch('/api/tracker');
        
        if (!response.ok) {
          throw new Error('Error al obtener datos del servidor');
        }
        
        const jsonData = await response.json();
        
        // Verificar si hay error en la respuesta
        if (jsonData.error) {
          throw new Error(jsonData.error);
        }
        
        // Transformar el array de arrays a un objeto
        const transformedData = jsonData.data.reduce((acc: RaceData, item: string[]) => {
          acc[item[0]] = item[1];
          return acc;
        }, {});
        
        setRaceData(transformedData);
        
        // Verificar el estado de la carrera
        const raceStatus = transformedData['Race Status'];
        
        // Si la carrera no ha empezado, establecer el primer segmento
        if (raceStatus === 'Pre-start' || raceStatus === 'DNS') {
          const location = {
            segmentId: 1,
            segmentName: segmentsData[0]?.name || 'Inicio',
            progressInSegment: 0,
            distanceInSegmentKm: 0,
            completedSegments: []
          };
          setCurrentLocation(location);
          lastValidLocation.current = location;
        } else {
          // Convertir millas a kilómetros y determinar ubicación
          const routeMileStr = transformedData['Route mile'];
          if (routeMileStr) {
            const routeMile = parseFloat(routeMileStr.replace(' mi', ''));
            const routeKm = routeMile * 1.60934;
            
            const location = determineCurrentSegment(routeKm);
            if (location) {
              setCurrentLocation(location);
              lastValidLocation.current = location;
            }
          }
        }
        
        setError(null);
      } catch (error) {
        console.error("Error al obtener datos del tracker:", error);
        setError("No se pudieron obtener los datos del tracker");
        
        // Mantener la última ubicación válida si hay un error
        if (lastValidLocation.current) {
          setCurrentLocation(lastValidLocation.current);
        }
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar si hay datos de segmentos
    if (segmentsData && segmentsData.length > 0) {
      // Primera llamada
      fetchData();

      // Configurar intervalo para actualizar cada 30 segundos
      const intervalId = setInterval(fetchData, 30000);

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
  }, [segmentsData]);

  return {
    raceData,
    currentLocation,
    loading,
    error
  };
} 