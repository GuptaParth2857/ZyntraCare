import { NextRequest, NextResponse } from 'next/server';

interface FootfallReport {
  hospitalId: string;
  hospitalName: string;
  level: 'low' | 'medium' | 'high' | 'very_high';
  timestamp: number;
}

const footfallStore: Map<string, FootfallReport[]> = new Map();

function getFootfallLevel(hospitalId: string): { level: string; count: number; lastUpdated: number } | null {
  const reports = footfallStore.get(hospitalId);
  if (!reports || reports.length === 0) return null;
  
  const latest = reports[reports.length - 1];
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  if (latest.timestamp < oneHourAgo) return null;
  
  return {
    level: latest.level,
    count: reports.filter(r => r.timestamp > Date.now() - 30 * 60 * 1000).length,
    lastUpdated: latest.timestamp
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hospitalIds = searchParams.get('ids')?.split(',') || [];
  
  const footfallData: Record<string, { level: string; label: string; color: string; count: number; lastUpdated: number }> = {};
  
  for (const id of hospitalIds) {
    const data = getFootfallLevel(id);
    if (data) {
      const labels: Record<string, { label: string; color: string }> = {
        low: { label: 'Quiet', color: '#22c55e' },
        medium: { label: 'Moderate', color: '#eab308' },
        high: { label: 'Crowded', color: '#f97316' },
        very_high: { label: 'Very Busy', color: '#ef4444' }
      };
      footfallData[id] = {
        level: data.level,
        label: labels[data.level]?.label || 'Unknown',
        color: labels[data.level]?.color || '#9ca3af',
        count: data.count,
        lastUpdated: data.lastUpdated
      };
    }
  }
  
  return NextResponse.json({ footfall: footfallData });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.hospitalId || !body.level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const validLevels = ['low', 'medium', 'high', 'very_high'];
    if (!validLevels.includes(body.level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }
    
    const report: FootfallReport = {
      hospitalId: body.hospitalId,
      hospitalName: body.hospitalName || '',
      level: body.level,
      timestamp: Date.now()
    };
    
    if (!footfallStore.has(body.hospitalId)) {
      footfallStore.set(body.hospitalId, []);
    }
    
    const reports = footfallStore.get(body.hospitalId)!;
    reports.push(report);
    
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentReports = reports.filter(r => r.timestamp > oneDayAgo);
    footfallStore.set(body.hospitalId, recentReports);
    
    return NextResponse.json({ success: true, report });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
    
    const validLevels = ['low', 'medium', 'high', 'very_high'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }
    
    const report: FootfallReport = {
      hospitalId: body.hospitalId,
      hospitalName: body.hospitalName || '',
      level: body.level,
      timestamp: Date.now()
    };
    
    if (!footfallStore.has(hospitalId)) {
      footfallStore.set(hospitalId, []);
    }
    
    const reports = footfallStore.get(hospitalId)!;
    reports.push(report);
    
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentReports = reports.filter(r => r.timestamp > oneDayAgo);
    footfallStore.set(hospitalId, recentReports);
    
    return NextResponse.json({ success: true, report });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}