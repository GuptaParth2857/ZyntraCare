import { useState, useEffect, useCallback, useRef } from 'react';

const HR_SERVICE = 0x180D;
const BP_SERVICE = 0x1810;
const GLUCOSE_SERVICE = 0x1808;
const THERMOMETER_SERVICE = 0x1809;
const BATTERY_SERVICE = 0x180F;
const DEVICE_INFO_SERVICE = 0x180A;

const HR_MEASUREMENT = 0x2A37;
const BP_MEASUREMENT = 0x2A35;
const GLUCOSE_MEASUREMENT = 0x2A18;
const TEMP_MEASUREMENT = 0x2A1C;
const BATTERY_LEVEL = 0x2A19;
const MANUFACTURER_NAME = 0x2A29;
const MODEL_NUMBER = 0x2A24;

const ALL_SERVICE_UUIDS = [
  HR_SERVICE, BP_SERVICE, GLUCOSE_SERVICE, THERMOMETER_SERVICE,
  BATTERY_SERVICE, DEVICE_INFO_SERVICE,
];

const CONNECTION_TIMEOUT = 30000;

export enum BLEService {
  HeartRate = 0x180D,
  BloodPressure = 0x1810,
  Glucose = 0x1808,
  HealthThermometer = 0x1809,
}

export interface HeartRateData {
  bpm: number;
  sensorContact: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  meanArterialPressure: number;
  pulseRate?: number;
}

export interface GlucoseData {
  concentration: number;
  type: string;
  sequenceNumber: number;
  units: 'mmol/L' | 'kg/L';
}

export interface TemperatureData {
  value: number;
  type?: string;
}

export interface DeviceInfoData {
  model?: string;
  manufacturer?: string;
}

export interface UseWebBluetoothReturn {
  device: BluetoothDevice | null;
  connected: boolean;
  connecting: boolean;
  heartRate: HeartRateData | null;
  bloodPressure: BloodPressureData | null;
  glucose: GlucoseData | null;
  temperature: TemperatureData | null;
  batteryLevel: number | null;
  deviceName: string;
  error: string | null;
  deviceInfo: DeviceInfoData;
  connect: (service?: BLEService) => Promise<void>;
  disconnect: () => void;
  available: boolean;
  scanForDevices: () => Promise<BluetoothDevice[]>;
}

function parseTwoComplement(value: number, bits: number): number {
  const signBit = 1 << (bits - 1);
  return value & signBit ? value - (1 << bits) : value;
}

function parseSFloat(data: DataView, offset: number): number {
  const val = data.getUint16(offset, true);
  const mantissa = val & 0x0FFF;
  const exponent = (val >> 12) & 0x0F;
  const signedMantissa = parseTwoComplement(mantissa, 12);
  const signedExponent = parseTwoComplement(exponent, 4);
  return signedMantissa * Math.pow(10, signedExponent);
}

function parseFloat32(data: DataView, offset: number): number {
  const val = data.getUint32(offset, true);
  const mantissa = val & 0x00FFFFFF;
  const exponent = (val >> 24) & 0xFF;
  const signedMantissa = parseTwoComplement(mantissa, 24);
  const signedExponent = parseTwoComplement(exponent, 8);
  return signedMantissa * Math.pow(10, signedExponent);
}

function parseHeartRate(data: DataView): HeartRateData {
  const flags = data.getUint8(0);
  const is16Bit = !!(flags & 0x01);
  const sensorContact = !!(flags & 0x04);
  let offset = 1;
  const bpm = is16Bit ? data.getUint16(offset, true) : data.getUint8(offset);
  offset += is16Bit ? 2 : 1;
  let energyExpended: number | undefined;
  if (flags & 0x08) {
    energyExpended = data.getUint16(offset, true);
    offset += 2;
  }
  const rrIntervals: number[] = [];
  if (flags & 0x10) {
    while (offset + 1 < data.byteLength) {
      rrIntervals.push(data.getUint16(offset, true));
      offset += 2;
    }
  }
  return { bpm, sensorContact, energyExpended, rrIntervals };
}

function parseBloodPressure(data: DataView): BloodPressureData {
  const flags = data.getUint8(0);
  let offset = 1;
  const systolic = parseSFloat(data, offset);
  offset += 2;
  const diastolic = parseSFloat(data, offset);
  offset += 2;
  const meanArterialPressure = parseSFloat(data, offset);
  offset += 2;
  if (flags & 0x01) offset += 7;
  let pulseRate: number | undefined;
  if (flags & 0x02) {
    pulseRate = parseSFloat(data, offset);
  }
  return { systolic, diastolic, meanArterialPressure, pulseRate };
}

const GLUCOSE_TYPE_LABELS: Record<number, string> = {
  1: 'Capillary Whole Blood',
  2: 'Capillary Plasma',
  3: 'Venous Whole Blood',
  4: 'Venous Plasma',
  5: 'Arterial Whole Blood',
  6: 'Arterial Plasma',
  7: 'Whole Blood',
  8: 'Plasma',
  9: 'Unknown Sample',
  10: 'Interstitial Fluid',
  11: 'Control Solution',
};

function parseGlucose(data: DataView): GlucoseData {
  const flags = data.getUint8(0);
  let offset = 1;
  const sequenceNumber = data.getUint16(offset, true);
  offset += 2;
  if (flags & 0x01) {
    offset += 2;
  } else {
    offset += 7;
  }
  const concentrationPresent = !(flags & 0x02);
  let concentration = 0;
  let units: 'mmol/L' | 'kg/L' = 'mmol/L';
  let type = 'Unknown';
  if (concentrationPresent) {
    units = flags & 0x04 ? 'kg/L' : 'mmol/L';
    concentration = parseSFloat(data, offset);
    offset += 2;
    const typeVal = data.getUint8(offset);
    type = GLUCOSE_TYPE_LABELS[typeVal] || 'Reserved';
  }
  return { concentration, type, sequenceNumber, units };
}

const TEMP_TYPE_LABELS: Record<number, string> = {
  1: 'Armpit',
  2: 'Body',
  3: 'Ear',
  4: 'Finger',
  5: 'Gastro-intestinal',
  6: 'Mouth',
  7: 'Rectum',
  8: 'Toe',
  9: 'Tympanum',
};

function parseTemperature(data: DataView): TemperatureData {
  const flags = data.getUint8(0);
  let offset = 1;
  const isFahrenheit = !!(flags & 0x01);
  const raw = parseFloat32(data, offset);
  offset += 4;
  const value = isFahrenheit ? (raw - 32) * 5 / 9 : raw;
  if (flags & 0x04) {
    const typeVal = data.getUint8(offset);
    return { value, type: TEMP_TYPE_LABELS[typeVal] || 'Unknown' };
  }
  return { value };
}

export function useWebBluetooth(): UseWebBluetoothReturn {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [heartRate, setHeartRate] = useState<HeartRateData | null>(null);
  const [bloodPressure, setBloodPressure] = useState<BloodPressureData | null>(null);
  const [glucose, setGlucose] = useState<GlucoseData | null>(null);
  const [temperature, setTemperature] = useState<TemperatureData | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoData>({});

  const gattRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const charsRef = useRef<BluetoothRemoteGATTCharacteristic[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalRef = useRef(false);

  const available =
    typeof navigator !== 'undefined' &&
    typeof navigator.bluetooth !== 'undefined';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      charsRef.current.forEach((c) => {
        c.stopNotifications?.().catch(() => {});
      });
      charsRef.current = [];
      if (gattRef.current?.connected) {
        intentionalRef.current = true;
        gattRef.current.disconnect();
      }
    };
  }, []);

  const clearSensorData = useCallback(() => {
    setHeartRate(null);
    setBloodPressure(null);
    setGlucose(null);
    setTemperature(null);
    setBatteryLevel(null);
    setDeviceName('');
    setDeviceInfo({});
  }, []);

  const resetRefs = useCallback(() => {
    gattRef.current = null;
    deviceRef.current = null;
    setDevice(null);
    setConnected(false);
    setConnecting(false);
  }, []);

  const handleDisconnected = useCallback(() => {
    clearSensorData();
    resetRefs();
    if (!intentionalRef.current) {
      setError('Device disconnected');
    }
  }, [clearSensorData, resetRefs]);

  const readBattery = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      const svc = await server.getPrimaryService(BATTERY_SERVICE);
      const char = await svc.getCharacteristic(BATTERY_LEVEL);
      const val = await char.readValue();
      setBatteryLevel(val.getUint8(0));
    } catch {
      /* battery service not available on device */
    }
  }, []);

  const readDeviceInfo = useCallback(async (server: BluetoothRemoteGATTServer) => {
    try {
      const svc = await server.getPrimaryService(DEVICE_INFO_SERVICE);
      const info: DeviceInfoData = {};
      try {
        const c = await svc.getCharacteristic(MANUFACTURER_NAME);
        info.manufacturer = new TextDecoder().decode(await c.readValue());
      } catch { /* ok */ }
      try {
        const c = await svc.getCharacteristic(MODEL_NUMBER);
        info.model = new TextDecoder().decode(await c.readValue());
      } catch { /* ok */ }
      setDeviceInfo(info);
    } catch {
      /* device info service not available */
    }
  }, []);

  const setupNotify = useCallback(
    async (
      server: BluetoothRemoteGATTServer,
      serviceUUID: number,
      charUUID: number,
      onData: (d: DataView) => void,
    ) => {
      try {
        const svc = await server.getPrimaryService(serviceUUID);
        const char = await svc.getCharacteristic(charUUID);
        char.addEventListener('characteristicvaluechanged', (e: Event) => {
          const t = e.target as unknown as BluetoothRemoteGATTCharacteristic;
          if (t.value) onData(t.value);
        });
        await char.startNotifications();
        charsRef.current.push(char);
      } catch {
        /* characteristic or service not found */
      }
    },
    [],
  );

  const connectToServer = useCallback(
    async (bluetoothDevice: BluetoothDevice, svc: BLEService) => {
      const server = await bluetoothDevice.gatt!.connect();
      gattRef.current = server;
      deviceRef.current = bluetoothDevice;

      await Promise.all([readBattery(server), readDeviceInfo(server)]);

      switch (svc) {
        case BLEService.HeartRate:
          await setupNotify(server, HR_SERVICE, HR_MEASUREMENT, (d) =>
            setHeartRate(parseHeartRate(d)),
          );
          break;
        case BLEService.BloodPressure:
          await setupNotify(server, BP_SERVICE, BP_MEASUREMENT, (d) =>
            setBloodPressure(parseBloodPressure(d)),
          );
          break;
        case BLEService.Glucose:
          await setupNotify(server, GLUCOSE_SERVICE, GLUCOSE_MEASUREMENT, (d) =>
            setGlucose(parseGlucose(d)),
          );
          break;
        case BLEService.HealthThermometer:
          await setupNotify(server, THERMOMETER_SERVICE, TEMP_MEASUREMENT, (d) =>
            setTemperature(parseTemperature(d)),
          );
          break;
      }

      setDevice(bluetoothDevice);
      setDeviceName(bluetoothDevice.name || '');
      setConnected(true);
    },
    [readBattery, readDeviceInfo, setupNotify],
  );

  const connect = useCallback(
    async (svc: BLEService = BLEService.HeartRate) => {
      if (!available) {
        setError('Web Bluetooth is not available');
        return;
      }

      setError(null);
      setConnecting(true);
      intentionalRef.current = false;

      let bluetoothDevice: BluetoothDevice | undefined;

      try {
        bluetoothDevice = await navigator.bluetooth!.requestDevice({
          filters: [{ services: [svc] }],
          optionalServices: ALL_SERVICE_UUIDS,
        });

        bluetoothDevice.addEventListener(
          'gattserverdisconnected',
          handleDisconnected,
        );

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(
            () => reject(new Error('Connection timed out')),
            CONNECTION_TIMEOUT,
          );
        });

        await Promise.race([
          connectToServer(bluetoothDevice, svc),
          timeoutPromise,
        ]);

        setConnecting(false);
      } catch (err: any) {
        setConnecting(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (err.name === 'NotFoundError') {
          setError('No device selected or device not found');
        } else if (
          err.name === 'SecurityError' ||
          err.name === 'NotAllowedError'
        ) {
          setError('Bluetooth permission denied');
        } else if (err.message === 'Connection timed out') {
          setError('Connection timed out. Please try again.');
          if (bluetoothDevice?.gatt?.connected) {
            bluetoothDevice.gatt.disconnect();
          }
        } else {
          setError(err.message || 'Failed to connect to device');
        }
      }
    },
    [available, handleDisconnected, connectToServer],
  );

  const disconnect = useCallback(() => {
    intentionalRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    charsRef.current.forEach((c) => {
      c.stopNotifications?.().catch(() => {});
    });
    charsRef.current = [];
    if (gattRef.current?.connected) {
      gattRef.current.disconnect();
    }
    resetRefs();
    clearSensorData();
    setDevice(null);
    setError(null);
  }, [clearSensorData, resetRefs]);

  const scanForDevices = useCallback(async (): Promise<BluetoothDevice[]> => {
    if (!available) return [];
    try {
      const bt = navigator.bluetooth as any;
      if (typeof bt.requestLEScan === 'function') {
        const scan = await bt.requestLEScan({
          acceptAllAdvertisements: true,
        });
        return new Promise<BluetoothDevice[]>((resolve) => {
          const found: BluetoothDevice[] = [];
          const handler = (event: any) => {
            if (
              event.device &&
              !found.some((d) => d.id === event.device.id)
            ) {
              found.push(event.device);
            }
          };
          scan.addEventListener('advertisementreceived', handler);
          setTimeout(() => {
            scan.stop();
            resolve(found);
          }, CONNECTION_TIMEOUT);
        });
      }
      const device = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        optionalServices: ALL_SERVICE_UUIDS,
      });
      return device ? [device] : [];
    } catch {
      return [];
    }
  }, [available]);

  return {
    device,
    connected,
    connecting,
    heartRate,
    bloodPressure,
    glucose,
    temperature,
    batteryLevel,
    deviceName,
    error,
    deviceInfo,
    connect,
    disconnect,
    available,
    scanForDevices,
  };
}

export default useWebBluetooth;
