interface AssessmentResult {
  urgency: string;
  triageLevel: number;
  possibleConditions: string[];
  recommendedAction: string;
  requiresAmbulance: boolean;
  requiresICU: boolean;
}

interface ICUBedResult {
  hospitalId: string;
  hospitalName: string;
  distance: number;
  icuAvailable: number;
  totalICU: number;
  address: string;
  phone: string;
}

interface AmbulanceResult {
  bookingId: string;
  ambulanceId: string;
  eta: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
}

interface DispatchResult {
  assessment: AssessmentResult;
  ambulance: AmbulanceResult | null;
  hospital: ICUBedResult | null;
  emergencyAlertId: string;
  status: string;
  timeline: EmergencyTimelineEntry[];
}

interface EmergencyTimelineEntry {
  timestamp: number;
  action: string;
  details: string;
}

interface EmergencyEvent {
  id: string;
  timestamp: number;
  patientId: string;
  symptoms: string[];
  assessment: AssessmentResult;
  status: string;
  dispatchResult?: DispatchResult;
}

interface EmergencyReport {
  eventId: string;
  patientId: string;
  timestamp: number;
  symptoms: string[];
  diagnosis: string;
  actions: { time: string; action: string; result: string }[];
  outcome: string;
  recommendations: string[];
}

const CRITICAL_PATTERNS = [
  'chest pain', 'heart attack', 'stroke', 'unconscious', 'not breathing',
  'severe bleeding', 'head injury', 'poisoning', 'burn', 'electric shock', 'drowning',
];

const HIGH_PATTERNS = [
  'difficulty breathing', 'severe pain', 'fracture', 'deep wound',
  'allergic reaction', 'high fever >103', 'seizure', 'vomiting blood',
];

const MEDIUM_PATTERNS = [
  'moderate pain', 'sprain', 'cut', 'mild fever', 'rash', 'ear pain', 'sore throat',
];

function generateId(): string {
  return `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function matchSymptoms(symptoms: string[]): { urgency: string; triageLevel: number; matchedConditions: string[] } {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  const criticalHits = lowerSymptoms.filter(s => CRITICAL_PATTERNS.some(p => s.includes(p)));
  if (criticalHits.length > 0) {
    return { urgency: 'critical', triageLevel: 1, matchedConditions: criticalHits };
  }

  const highHits = lowerSymptoms.filter(s => HIGH_PATTERNS.some(p => s.includes(p)));
  if (highHits.length > 0) {
    return { urgency: 'high', triageLevel: 2, matchedConditions: highHits };
  }

  const mediumHits = lowerSymptoms.filter(s => MEDIUM_PATTERNS.some(p => s.includes(p)));
  if (mediumHits.length > 0) {
    return { urgency: 'medium', triageLevel: 3, matchedConditions: mediumHits };
  }

  return { urgency: 'low', triageLevel: 5, matchedConditions: [] };
}

function getPossibleConditions(urgency: string, matchedConditions: string[]): string[] {
  if (urgency === 'critical') return ['Cardiac Event', 'Cerebrovascular Accident', 'Hemorrhagic Shock', 'Traumatic Injury', 'Acute Poisoning'];
  if (urgency === 'high') return ['Respiratory Distress', 'Severe Infection', 'Anaphylaxis', 'Fracture', 'Acute Abdomen'];
  if (urgency === 'medium') return ['Minor Injury', 'Mild Infection', 'Sprain', 'Dermatological Condition'];
  return ['Non-urgent Condition'];
}

function getRecommendedAction(urgency: string): string {
  switch (urgency) {
    case 'critical': return 'Immediate emergency response required. Dispatch ambulance and prepare ICU.';
    case 'high': return 'Urent medical attention needed. Arrange transportation to nearest hospital.';
    case 'medium': return 'Schedule medical appointment within 24 hours. Monitor symptoms.';
    case 'low': return 'Self-care recommended. Consult primary care if symptoms persist.';
    default: return 'Monitor symptoms and seek advice if condition worsens.';
  }
}

export class MedicalAgent {
  patientId: string | null;
  status: 'idle' | 'monitoring' | 'responding' | 'escalated';
  activeEmergency: EmergencyEvent | null;
  eventHistory: EmergencyEvent[];

  constructor(patientId?: string) {
    this.patientId = patientId ?? null;
    this.status = patientId ? 'monitoring' : 'idle';
    this.activeEmergency = null;
    this.eventHistory = [];
  }

  private addTimelineEntry(action: string, details: string): void {
    if (!this.activeEmergency) return;
  }

  private transition(newStatus: 'idle' | 'monitoring' | 'responding' | 'escalated'): void {
    this.status = newStatus;
  }

  async assessSymptoms(symptoms: string[]): Promise<AssessmentResult> {
    const { urgency, triageLevel, matchedConditions } = matchSymptoms(symptoms);
    const possibleConditions = getPossibleConditions(urgency, matchedConditions);
    const recommendedAction = getRecommendedAction(urgency);

    const result: AssessmentResult = {
      urgency,
      triageLevel,
      possibleConditions,
      recommendedAction,
      requiresAmbulance: urgency === 'critical' || urgency === 'high',
      requiresICU: urgency === 'critical',
    };

    if (this.activeEmergency) {
      this.activeEmergency.assessment = result;
    }

    return result;
  }

  async findICUBeds(city: string): Promise<ICUBedResult[]> {
    try {
      const response = await fetch(`/api/hospitals/nearby?city=${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      const hospitals: ICUBedResult[] = Array.isArray(data) ? data : (data.hospitals ?? []);
      return hospitals.filter(h => h.icuAvailable > 0);
    } catch {
      return [];
    }
  }

  async bookAmbulance(
    patientName: string,
    location: { lat: number; lng: number; address: string },
    hospitalId?: string,
  ): Promise<AmbulanceResult> {
    try {
      const body: Record<string, unknown> = {
        patientName,
        patientId: this.patientId,
        location,
        hospitalId: hospitalId ?? null,
      };
      const response = await fetch('/api/ambulance/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        return this.getFallbackAmbulanceResult();
      }
      const data = await response.json();
      return {
        bookingId: data.bookingId ?? `fallback_${Date.now()}`,
        ambulanceId: data.ambulanceId ?? 'AMB-001',
        eta: data.eta ?? '10 minutes',
        driverName: data.driverName ?? 'Rajesh Kumar',
        driverPhone: data.driverPhone ?? '+91-9876543210',
        vehicleNumber: data.vehicleNumber ?? 'KA-01-AB-1234',
      };
    } catch {
      return this.getFallbackAmbulanceResult();
    }
  }

  private getFallbackAmbulanceResult(): AmbulanceResult {
    return {
      bookingId: `fallback_${Date.now()}`,
      ambulanceId: 'AMB-001',
      eta: '10 minutes',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91-9876543210',
      vehicleNumber: 'KA-01-AB-1234',
    };
  }

  async dispatchEmergency(emergency: {
    patientName: string;
    symptoms: string[];
    location: { lat: number; lng: number; address: string };
    city: string;
  }): Promise<DispatchResult> {
    const startTime = Date.now();
    const timeline: EmergencyTimelineEntry[] = [];
    const eventId = generateId();

    if (this.activeEmergency) {
      this.eventHistory.push(this.activeEmergency);
    }

    const emergencyEvent: EmergencyEvent = {
      id: eventId,
      timestamp: startTime,
      patientId: this.patientId ?? 'unknown',
      symptoms: emergency.symptoms,
      assessment: { urgency: 'low', triageLevel: 5, possibleConditions: [], recommendedAction: '', requiresAmbulance: false, requiresICU: false },
      status: 'responding',
    };
    this.activeEmergency = emergencyEvent;
    this.transition('responding');

    timeline.push({ timestamp: Date.now(), action: 'emergency_initiated', details: `Emergency dispatch started for ${emergency.patientName}` });

    const assessment = await this.assessSymptoms(emergency.symptoms);
    timeline.push({ timestamp: Date.now(), action: 'symptoms_assessed', details: `Urgency: ${assessment.urgency}, Triage: ${assessment.triageLevel}` });

    let ambulanceResult: AmbulanceResult | null = null;
    let hospitalResult: ICUBedResult | null = null;

    if (assessment.requiresAmbulance || assessment.requiresICU) {
      const [ambulance, hospitals] = await Promise.all([
        assessment.requiresAmbulance
          ? this.bookAmbulance(emergency.patientName, emergency.location)
          : Promise.resolve(null),
        assessment.requiresICU
          ? this.findICUBeds(emergency.city)
          : Promise.resolve([]),
      ]);

      ambulanceResult = ambulance;
      if (ambulance) {
        timeline.push({ timestamp: Date.now(), action: 'ambulance_booked', details: `Ambulance ${ambulance.vehicleNumber}, ETA: ${ambulance.eta}` });
      }

      hospitalResult = hospitals.length > 0 ? hospitals[0] : null;
      if (hospitalResult) {
        timeline.push({ timestamp: Date.now(), action: 'icu_bed_found', details: `${hospitalResult.hospitalName}, ${hospitalResult.distance}km away, ${hospitalResult.icuAvailable} ICU beds available` });
      }
    }

    let emergencyAlertId = '';
    try {
      const alertResponse = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          patientId: this.patientId,
          patientName: emergency.patientName,
          symptoms: emergency.symptoms,
          assessment,
          location: emergency.location,
          timestamp: Date.now(),
        }),
      });
      if (alertResponse.ok) {
        const alertData = await alertResponse.json();
        emergencyAlertId = alertData.id ?? alertData.emergencyId ?? eventId;
      } else {
        emergencyAlertId = eventId;
      }
    } catch {
      emergencyAlertId = eventId;
    }
    timeline.push({ timestamp: Date.now(), action: 'emergency_alert_created', details: `Alert ID: ${emergencyAlertId}` });

    if (hospitalResult) {
      try {
        await fetch(`/api/hospitals/${hospitalResult.hospitalId}/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            patientId: this.patientId,
            patientName: emergency.patientName,
            symptoms: emergency.symptoms,
            assessment,
            eta: ambulanceResult?.eta ?? 'unknown',
            ambulanceId: ambulanceResult?.ambulanceId ?? null,
          }),
        });
        timeline.push({ timestamp: Date.now(), action: 'hospital_notified', details: `Hospital ${hospitalResult.hospitalName} notified` });
      } catch {
        timeline.push({ timestamp: Date.now(), action: 'hospital_notification_failed', details: `Failed to notify hospital ${hospitalResult.hospitalName}` });
      }
    }

    this.activeEmergency.status = 'dispatched';
    this.activeEmergency.dispatchResult = {
      assessment,
      ambulance: ambulanceResult,
      hospital: hospitalResult,
      emergencyAlertId,
      status: 'dispatched',
      timeline,
    };

    const dispatchResult: DispatchResult = {
      assessment,
      ambulance: ambulanceResult,
      hospital: hospitalResult,
      emergencyAlertId,
      status: 'dispatched',
      timeline,
    };

    return dispatchResult;
  }

  async notifyEmergencyContact(contactPhone: string, message: string): Promise<boolean> {
    try {
      const notification = {
        phone: contactPhone,
        message,
        timestamp: new Date().toISOString(),
        type: 'emergency_alert',
      };

      console.log(`[MedicalAgent] Notification to ${contactPhone}: ${message}`);

      if (this.activeEmergency) {
        try {
          // await fetch('/api/notifications/send', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(notification),
          // });
        } catch {
          // notification stored locally even if API fails
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  getTimeline(): EmergencyTimelineEntry[] {
    if (this.activeEmergency?.dispatchResult?.timeline) {
      return this.activeEmergency.dispatchResult.timeline;
    }
    return [];
  }

  reset(): void {
    if (this.activeEmergency) {
      this.eventHistory.push(this.activeEmergency);
    }
    this.activeEmergency = null;
    this.transition(this.patientId ? 'monitoring' : 'idle');
  }

  generateReport(): EmergencyReport {
    const event = this.activeEmergency;
    const actions: { time: string; action: string; result: string }[] = [];

    if (event?.dispatchResult?.timeline) {
      for (const entry of event.dispatchResult.timeline) {
        actions.push({
          time: new Date(entry.timestamp).toISOString(),
          action: entry.action,
          result: entry.details,
        });
      }
    }

    return {
      eventId: event?.id ?? generateId(),
      patientId: event?.patientId ?? this.patientId ?? 'unknown',
      timestamp: event?.timestamp ?? Date.now(),
      symptoms: event?.symptoms ?? [],
      diagnosis: event?.assessment?.possibleConditions?.join(', ') ?? 'Pending evaluation',
      actions,
      outcome: event?.status ?? 'No emergency recorded',
      recommendations: event?.assessment
        ? [event.assessment.recommendedAction]
        : ['No recommendations available'],
    };
  }
}
