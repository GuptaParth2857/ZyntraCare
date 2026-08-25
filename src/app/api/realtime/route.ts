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

async function getInitialData() {
  const [beds, alerts, ambulances, supplies] = await Promise.all([
    getBedUpdates(),
    getEmergencyAlerts(),
    getAmbulanceLocations(),
    getSupplyChainUpdates(),
  ]);
  return { beds, alerts, ambulances, supplies };
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
            const [beds, alerts, ambulances, supplies] = await Promise.all([
              getBedUpdates(),
              getEmergencyAlerts(),
              getAmbulanceLocations(),
              getSupplyChainUpdates(),
            ]);

            if (beds.length > 0) {
              for (const bed of beds) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(bed)}\n\n`));
              }
            }
            if (alerts.length > 0) {
              for (const alert of alerts) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(alert)}\n\n`));
              }
            }
            if (ambulances.length > 0) {
              for (const amb of ambulances) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(amb)}\n\n`));
              }
            }
            if (supplies.length > 0) {
              for (const supply of supplies) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(supply)}\n\n`));
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`));
            
            await new Promise(resolve => setTimeout(resolve, 10000));
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