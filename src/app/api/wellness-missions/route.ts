import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const category = searchParams.get('category') || '';

  try {
    const where: any = { isActive: true };
    if (category) where.category = category;

    const missions = await prisma.wellnessMission.findMany({ where });

    let progress: any[] = [];
    if (userId) {
      progress = await prisma.wellnessMissionProgress.findMany({
        where: { userId },
      });
    }

    const missionsWithProgress = missions.map(m => {
      const p = progress.find(pg => pg.missionId === m.id);
      return {
        ...m,
        streak: p?.streak || 0,
        completed: p?.completed || false,
        completedAt: p?.completedAt || null,
      };
    });

    return NextResponse.json({ missions: missionsWithProgress });
  } catch (error) {
    console.error('Wellness missions GET error:', error);
    return NextResponse.json({ missions: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.title) {
      const mission = await prisma.wellnessMission.create({
        data: {
          title: body.title,
          description: body.description || '',
          category: body.category || 'exercise',
          points: body.points || 10,
          icon: body.icon || '',
          duration: body.duration || 'daily',
        },
      });
      return NextResponse.json({ mission }, { status: 201 });
    }

    if (body.missionId && body.userId) {
      const existing = await prisma.wellnessMissionProgress.findUnique({
        where: { missionId_userId: { missionId: body.missionId, userId: body.userId } },
      });

      const progress = await prisma.wellnessMissionProgress.upsert({
        where: { missionId_userId: { missionId: body.missionId, userId: body.userId } },
        update: {
          completed: body.completed ?? existing?.completed ?? false,
          streak: body.completed ? (existing?.streak || 0) + 1 : (existing?.streak || 0),
          completedAt: body.completed ? new Date() : existing?.completedAt || null,
        },
        create: {
          missionId: body.missionId,
          userId: body.userId,
          completed: body.completed || false,
          streak: body.completed ? 1 : 0,
          completedAt: body.completed ? new Date() : null,
        },
      });

      if (body.completed) {
        const mission = await prisma.wellnessMission.findUnique({ where: { id: body.missionId } });
        if (mission) {
          await prisma.reward.create({
            data: {
              userId: body.userId,
              points: mission.points,
              source: 'mission',
              description: `Completed: ${mission.title}`,
            },
          });
        }
      }

      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Wellness missions POST error:', error);
    return NextResponse.json({ error: 'Failed to process mission' }, { status: 500 });
  }
}
