import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authRateLimit } from '@/lib/rate-limit';
import { generateHealthResponse } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const NEAREST: Record<string, string> = {
  'Block A': 'Admin Building First-Aid Room (Room A-104, Ground Floor)',
  'Block B': 'Engineering Block First-Aid Room (Room B-201, 2nd Floor)',
  'Block C': 'Science Block Medical Bay (Room C-118, 1st Floor)',
  'Block D': 'Hostel Medical Room (Room D-003, Ground Floor)',
  'Main Gate': 'Campus Security Booth + General First-Aid Kit',
  'Sports Complex': 'Physiotherapy + First-Aid Station (North Pavilion)',
};

const TEAM_BY_TYPE: Record<string, string> = {
  Medical: 'Campus Medical Team',
  Fire: 'Campus Fire & Safety Team',
  Security: 'Campus Security Team',
  Accident: 'Campus Medical Team + Security',
  Other: 'Campus Response Team',
};

const VALID_STATUSES = ['reported', 'dispatched', 'on-scene', 'resolved'];

const KEYWORDS: Record<string, string[]> = {
  high: ['unconscious', 'not breathing', 'severe bleeding', 'heart attack', 'choking', 'fire', 'collapse', 'seizure', 'stroke', 'trapped'],
  medium: ['fever', 'fracture', 'pain', 'burn', 'vomit', 'dizziness', 'bleeding', 'sprain', 'injury'],
  low: ['checkup', 'routine', 'mild', 'bandage', 'dizzy', 'nausea'],
};

function heuristicPriority(input: string): string {
  const lower = input.toLowerCase();
  for (const k of KEYWORDS.high) if (lower.includes(k)) return 'high';
  for (const k of KEYWORDS.medium) if (lower.includes(k)) return 'medium';
  return 'low';
}

function priorityLabel(priority: string): string {
  return priority === 'high' ? 'CRITICAL' : priority === 'medium' ? 'URGENT' : 'NORMAL';
}

function mapIncident(i: {
  id: string; type: string; block: string; floor: string; priority: string;
  description: string; contact: string; nearest: string; notifiedTeam: string;
  status: string; source: string; createdAt: Date;
}) {
  return {
    id: i.id,
    type: i.type,
    block: i.block,
    floor: i.floor,
    location: i.floor ? `${i.block}, ${i.floor}` : i.block,
    priority: i.priority,
    priorityLabel: priorityLabel(i.priority),
    description: i.description,
    contact: i.contact,
    nearest: i.nearest,
    notifiedTeam: i.notifiedTeam,
    status: i.status,
    source: i.source,
    time: i.createdAt.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const rateCheck = await authRateLimit(req, 20, 60000);
  if (rateCheck) return rateCheck;

  try {
    const body = await req.json();
    const sos = Boolean(body.sos);
    // One-tap SOS works even without selections — default to a medical emergency.
    const type = body.type || (sos ? 'Medical' : '');
    const block = body.block || (sos ? 'Block B' : '');
    const { floor, description, contact, reporter } = body;
    if (!type || !block) {
      return NextResponse.json({ error: 'Type and block are required' }, { status: 400 });
    }

    // One-tap SOS skips AI latency and is treated as critical immediately.
    let priority: string | null = sos ? 'high' : null;
    let usedAi = false;

    if (!priority) {
      const aiText = await generateHealthResponse(
        `Campus emergency ${type} at ${block}${floor ? `, ${floor}` : ''}. ${description ?? ''}. Respond with exactly one word: high, medium, or low.`
      );
      if (aiText) {
        const t = aiText.trim().toLowerCase();
        if (['high', 'medium', 'low'].includes(t)) {
          priority = t;
          usedAi = true;
        }
      }
    }

    if (!priority) priority = heuristicPriority(`${type} ${description ?? ''} ${block}`);

    const nearest = NEAREST[block] ?? 'Campus Security Booth';
    const notifiedTeam = TEAM_BY_TYPE[type] ?? 'Campus Response Team';

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub || (reporter === 'demo-user' ? 'demo-user' : null);

    const incident = await prisma.campusIncident.create({
      data: {
        userId,
        reporter: String(reporter || '').slice(0, 200),
        type: String(type).slice(0, 100),
        block: String(block).slice(0, 100),
        floor: String(floor || '').slice(0, 50),
        description: String(description || '').slice(0, 2000),
        contact: String(contact || '').slice(0, 100),
        priority,
        nearest,
        notifiedTeam,
        status: 'reported',
        source: usedAi ? 'ai' : 'heuristic',
      },
    });

    return NextResponse.json({
      ...mapIncident(incident),
      priorityLabel: priorityLabel(priority),
      notifySent: true,
    });
  } catch (error) {
    console.error('Campus emergency error:', error);
    return NextResponse.json(
      { priority: 'medium', priorityLabel: 'URGENT', nearest: 'Campus Security Booth', notifiedTeam: 'Campus Response Team', notifySent: false, source: 'fallback' },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  const rateCheck = await authRateLimit(req, 120, 60000);
  if (rateCheck) return rateCheck;
  try {
    const incidents = await prisma.campusIncident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ incidents: incidents.map(mapIncident) });
  } catch (error) {
    console.error('Campus emergency GET error:', error);
    return NextResponse.json({ incidents: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const rateCheck = await authRateLimit(req, 60, 60000);
  if (rateCheck) return rateCheck;
  try {
    const { id, status } = await req.json();
    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Valid id and status are required' }, { status: 400 });
    }
    const incident = await prisma.campusIncident.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, incident: mapIncident(incident) });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const rateCheck = await authRateLimit(req, 10, 60000);
  if (rateCheck) return rateCheck;
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    await prisma.campusIncident.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: id });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
