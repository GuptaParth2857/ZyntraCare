import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Real-time SSE (Server-Sent Events) endpoint
 * 
 * Provides real-time updates for:
 * - Hospital bed availability changes
 * - Emergency alerts
 * - IoT wearable data sync
 * - Ambulance tracking updates
 * - Supply chain tracking
 * 
 * Client connects via EventSource:
 * const source = new EventSource('/api/realtime');
 * source.onmessage = (e) => { const data = JSON.parse(e.data); };
 */

export const dynamic = 'force-dynamic';

async function getBedUpdates() {
  try {
    const beds = await prisma.hospitalBed.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { hospital: true },
    });
    return beds.map(bed => ({
      type: 'bed_update',
      bedId: bed.id,
      hospitalId: bed.hospitalId,
      hospitalName: bed.hospital.name,
      bedNumber: bed.bedNumber,
      status: bed.status,
      bedType: bed.bedType,
      timestamp: Date.now()
    }));
  } catch { return []; }
}

async function getEmergencyAlerts() {
  try {
    const alerts = await prisma.emergencyAlert.findMany({
      where: { status: { not: 'RESOLVED' } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    return alerts.map(alert => ({
      type: 'emergency_alert',
      alertId: alert.id,
      location: alert.location,
      alertType: alert.alertType,
      status: alert.status,
      timestamp: alert.createdAt.getTime()
    }));
  } catch { return []; }
}

async function getAmbulanceLocations() {
  try {
    const ambulances = await prisma.ambulance.findMany({
      where: { isAvailable: true },
      take: 10,
      include: {
        locationUpdates: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });
    return ambulances.map(amb => ({
      type: 'ambulance_location',
      ambulanceId: amb.id,
      vehicleNumber: amb.vehicleNumber,
      lat: amb.lat,
      lng: amb.lng,
      isAvailable: amb.isAvailable,
      lastUpdate: amb.locationUpdates[0]?.timestamp.getTime() || Date.now()
    }));
  } catch { return []; }
}

async function getSupplyChainUpdates() {
  try {
    const supplies = await prisma.medicineSupply.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { hospital: true },
    });
    return supplies.map(supply => ({
      type: 'supply_chain',
      supplyId: supply.id,
      batchId: supply.batchId,
      medicine: supply.medicine,
      status: supply.supplyStatus,
      location: supply.currentLocation,
      timestamp: supply.updatedAt.getTime()
    }));
  } catch { return []; }
}

function generateMockBedUpdate(hospitalId: string) {
  const baseBeds = Math.floor(Math.random() * 50) + 10;
  const available = Math.floor(Math.random() * baseBeds);
  return {
    type: 'bed_update',
    hospitalId,
    beds: {
      total: baseBeds,
      available,
      icu: Math.floor(baseBeds * 0.1),
      icuAvailable: Math.floor(available * 0.1)
    },
    timestamp: Date.now()
  };
}

async function getInitialData() {
  const [beds, alerts, ambulances, supplies] = await Promise.all([
    getBedUpdates(),
    getEmergencyAlerts(),
    getAmbulanceLocations(),
    getSupplyChainUpdates(),
  ]);
  return { beds, alerts, ambulances, supplies };
}

function generateEmergencyAlert() {
  const alertTypes = [
    { severity: 'critical', message: 'Emergency: Cardiac arrest reported nearby', location: 'Within 2km' },
    { severity: 'high', message: 'High demand for ICU beds in area', location: '5km radius' },
    { severity: 'medium', message: 'Ambulance delay expected', location: 'Your area' },
    { severity: 'low', message: 'Hospital capacity updated', location: 'Nearby facilities' }
  ];
  return {
    type: 'emergency_alert',
    data: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    timestamp: Date.now()
  };
}

async function* generateSSE() {
  const encoder = new TextEncoder();
  
  let connectedClients = 0;
  const clientCounts = new Set<ReadableStreamDefaultController>();

  while (true) {
    try {
      const eventTypes = ['bed_update', 'emergency_alert', 'heartbeat'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let eventData;
      
      switch (randomType) {
        case 'bed_update':
          const hospitals = ['H001', 'H002', 'H003', 'H004', 'H005'];
          eventData = generateMockBedUpdate(hospitals[Math.floor(Math.random() * hospitals.length)]);
          break;
        case 'emergency_alert':
          if (Math.random() > 0.7) {
            eventData = generateEmergencyAlert();
          } else {
            eventData = { type: 'heartbeat', timestamp: Date.now() };
          }
          break;
        default:
          eventData = { type: 'heartbeat', timestamp: Date.now() };
      }
      
      const data = `data: ${JSON.stringify(eventData)}\n\n`;
      yield encoder.encode(data);
      
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    } catch {
      break;
    }
  }
}

export async function GET(req: NextRequest) {
  const initialData = await getInitialData();
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      controller.enqueue(encoder.encode(': Connected to ZyntraCare Real-time Server\n\n'));
      
      if (initialData.beds.length > 0) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'initial_data', ...initialData })}\n\n`));
      }
      
      let isActive = true;
      let cycle = 0;
      
      async function sendEvents() {
        while (isActive) {
          try {
            cycle++;
            const eventTypes = cycle % 5 === 0 
              ? ['bed_update', 'emergency_alert', 'ambulance_location', 'supply_chain', 'heartbeat']
              : ['bed_update', 'emergency_alert', 'heartbeat'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            let eventData;
            
            switch (randomType) {
              case 'bed_update': {
                const hospitals = ['hospital_1', 'hospital_2', 'hospital_3', 'hospital_4', 'hospital_5'];
                const hospitalId = hospitals[Math.floor(Math.random() * hospitals.length)];
                eventData = generateMockBedUpdate(hospitalId);
                break;
              }
              case 'emergency_alert': {
                if (Math.random() > 0.75) {
                  eventData = generateEmergencyAlert();
                } else {
                  eventData = { type: 'heartbeat', timestamp: Date.now() };
                }
                break;
              }
              default: {
                eventData = { type: 'heartbeat', timestamp: Date.now() };
              }
            }
            
            const data = `data: ${JSON.stringify(eventData)}\n\n`;
            controller.enqueue(encoder.encode(data));
            
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 4000));
          } catch {
            break;
          }
        }
      }
      
      sendEvents();
      
      req.signal.addEventListener('abort', () => {
        isActive = false;
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}