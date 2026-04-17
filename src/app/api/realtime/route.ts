import { NextRequest } from 'next/server';

/**
 * Real-time SSE (Server-Sent Events) endpoint
 * 
 * Provides real-time updates for:
 * - Hospital bed availability changes
 * - Emergency alerts
 * - IoT wearable data sync
 * - Ambulance tracking updates
 * 
 * Client connects via EventSource:
 * const source = new EventSource('/api/realtime');
 * source.onmessage = (e) => { const data = JSON.parse(e.data); };
 */

export const dynamic = 'force-dynamic';

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
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      controller.enqueue(encoder.encode(': Connected to ZyntraCare Real-time Server\n\n'));
      
      let isActive = true;
      
      async function sendEvents() {
        while (isActive) {
          try {
            const eventTypes = ['bed_update', 'emergency_alert', 'heartbeat'];
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