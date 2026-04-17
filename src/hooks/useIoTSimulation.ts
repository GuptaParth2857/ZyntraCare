'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore, type IoTData } from '@/store/useAppStore';

export function useIoTSimulation(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setIotData, setIsSimulatingIoT, iotData } = useAppStore();

  const generateIoTData = useCallback((): IoTData => {
    const baseHeartRate = 70 + Math.floor(Math.random() * 20);
    const heartRateFluctuation = Math.floor(Math.random() * 10) - 5;
    
    return {
      heartRate: Math.max(50, Math.min(120, baseHeartRate + heartRateFluctuation)),
      bloodPressure: {
        systolic: 110 + Math.floor(Math.random() * 30),
        diastolic: 70 + Math.floor(Math.random() * 20)
      },
      bloodSugar: 80 + Math.floor(Math.random() * 60),
      oxygenLevel: 94 + Math.floor(Math.random() * 6),
      temperature: 36.5 + Math.random(),
      timestamp: Date.now()
    };
  }, []);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsSimulatingIoT(true);
    
    intervalRef.current = setInterval(() => {
      const data = generateIoTData();
      setIotData(data);
    }, 3000);
    
    setIotData(generateIoTData());
  }, [generateIoTData, setIotData, setIsSimulatingIoT]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulatingIoT(false);
  }, [setIsSimulatingIoT]);

  useEffect(() => {
    if (enabled) {
      startSimulation();
    } else {
      stopSimulation();
    }
    
    return () => {
      stopSimulation();
    };
  }, [enabled, startSimulation, stopSimulation]);

  const getVitalStatus = useCallback(() => {
    if (!iotData) return null;
    
    const status = { heartRate: 'normal', bloodPressure: 'normal', bloodSugar: 'normal', oxygenLevel: 'normal' };
    
    if (iotData.heartRate < 60 || iotData.heartRate > 100) {
      status.heartRate = iotData.heartRate < 60 ? 'low' : 'high';
    }
    if (iotData.bloodPressure.systolic > 140 || iotData.bloodPressure.diastolic > 90) {
      status.bloodPressure = 'high';
    } else if (iotData.bloodPressure.systolic < 90 || iotData.bloodPressure.diastolic < 60) {
      status.bloodPressure = 'low';
    }
    if (iotData.bloodSugar > 140) {
      status.bloodSugar = 'high';
    } else if (iotData.bloodSugar < 70) {
      status.bloodSugar = 'low';
    }
    if (iotData.oxygenLevel < 95) {
      status.oxygenLevel = 'low';
    }
    
    return status;
  }, [iotData]);

  const isEmergency = useCallback(() => {
    if (!iotData) return false;
    
    const status = getVitalStatus();
    if (!status) return false;
    
    return (
      status.heartRate === 'low' ||
      status.heartRate === 'high' ||
      status.bloodPressure === 'high' ||
      status.oxygenLevel === 'low'
    );
  }, [iotData, getVitalStatus]);

  return {
    iotData,
    startSimulation,
    stopSimulation,
    getVitalStatus,
    isEmergency
  };
}