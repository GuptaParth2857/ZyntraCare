'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore, type IoTData } from '@/store/useAppStore';

interface VitalBaseline {
  heartRate: number;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
  oxygenLevel: number;
  temperature: number;
}

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function useIoTSimulation(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setIotData, setIsSimulatingIoT, iotData } = useAppStore();
  const baselineRef = useRef<VitalBaseline>({
    heartRate: 72,
    systolic: 120,
    diastolic: 80,
    bloodSugar: 95,
    oxygenLevel: 98,
    temperature: 36.8,
  });
  const currentRef = useRef<IoTData | null>(null);

  const driftBaseline = useCallback(() => {
    const b = baselineRef.current;
    b.heartRate = Math.max(55, Math.min(100, b.heartRate + (Math.random() * 6 - 3)));
    b.systolic = Math.max(95, Math.min(150, b.systolic + (Math.random() * 8 - 4)));
    b.diastolic = Math.max(60, Math.min(95, b.diastolic + (Math.random() * 6 - 3)));
    b.bloodSugar = Math.max(70, Math.min(160, b.bloodSugar + (Math.random() * 10 - 5)));
    b.oxygenLevel = Math.max(93, Math.min(100, b.oxygenLevel + (Math.random() * 2 - 1)));
    b.temperature = Math.max(36.0, Math.min(37.8, b.temperature + (Math.random() * 0.3 - 0.15)));
  }, []);

  const generateIoTData = useCallback((): IoTData => {
    const b = baselineRef.current;
    const noise = () => (Math.random() * 2 - 1);

    const heartRate = Math.round(Math.max(45, Math.min(130, b.heartRate + noise() * 4)));
    const systolic = Math.round(Math.max(80, Math.min(170, b.systolic + noise() * 5)));
    const diastolic = Math.round(Math.max(50, Math.min(100, b.diastolic + noise() * 3)));
    const bloodSugar = Math.round(Math.max(60, Math.min(200, b.bloodSugar + noise() * 6)));
    const oxygenLevel = Math.round(Math.max(88, Math.min(100, b.oxygenLevel + noise() * 1)));
    const temperature = parseFloat((Math.max(35.5, Math.min(39.0, b.temperature + noise() * 0.2))).toFixed(1));

    const data: IoTData = {
      heartRate,
      bloodPressure: { systolic, diastolic },
      bloodSugar,
      oxygenLevel,
      temperature,
      timestamp: Date.now(),
    };

    currentRef.current = data;
    return data;
  }, []);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;

    setIsSimulatingIoT(true);

    setIotData(generateIoTData());

    intervalRef.current = setInterval(() => {
      driftBaseline();
      const data = generateIoTData();
      setIotData(data);
    }, 3000);

    const driftInterval = setInterval(driftBaseline, 15000);

    return () => clearInterval(driftInterval);
  }, [generateIoTData, setIotData, setIsSimulatingIoT, driftBaseline]);

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

    const status: Record<string, string> = {
      heartRate: 'normal',
      bloodPressure: 'normal',
      bloodSugar: 'normal',
      oxygenLevel: 'normal',
      temperature: 'normal',
    };

    if (iotData.heartRate < 50 || iotData.heartRate > 110) {
      status.heartRate = iotData.heartRate < 50 ? 'critical-low' : 'critical-high';
    } else if (iotData.heartRate < 60 || iotData.heartRate > 100) {
      status.heartRate = iotData.heartRate < 60 ? 'low' : 'high';
    }

    if (iotData.bloodPressure.systolic > 160 || iotData.bloodPressure.diastolic > 100) {
      status.bloodPressure = 'critical-high';
    } else if (iotData.bloodPressure.systolic > 140 || iotData.bloodPressure.diastolic > 90) {
      status.bloodPressure = 'high';
    } else if (iotData.bloodPressure.systolic < 85 || iotData.bloodPressure.diastolic < 55) {
      status.bloodPressure = 'low';
    }

    if (iotData.bloodSugar > 180) {
      status.bloodSugar = 'critical-high';
    } else if (iotData.bloodSugar > 140) {
      status.bloodSugar = 'high';
    } else if (iotData.bloodSugar < 65) {
      status.bloodSugar = 'critical-low';
    } else if (iotData.bloodSugar < 70) {
      status.bloodSugar = 'low';
    }

    if (iotData.oxygenLevel < 90) {
      status.oxygenLevel = 'critical-low';
    } else if (iotData.oxygenLevel < 95) {
      status.oxygenLevel = 'low';
    }

    if (iotData.temperature > 38.5) {
      status.temperature = 'high';
    } else if (iotData.temperature < 36.0) {
      status.temperature = 'low';
    }

    return status;
  }, [iotData]);

  const isEmergency = useCallback(() => {
    if (!iotData) return false;

    const status = getVitalStatus();
    if (!status) return false;

    return (
      status.heartRate === 'critical-low' ||
      status.heartRate === 'critical-high' ||
      status.bloodPressure === 'critical-high' ||
      status.oxygenLevel === 'critical-low' ||
      status.bloodSugar === 'critical-low' ||
      status.bloodSugar === 'critical-high'
    );
  }, [iotData, getVitalStatus]);

  return {
    iotData,
    startSimulation,
    stopSimulation,
    getVitalStatus,
    isEmergency,
  };
}
