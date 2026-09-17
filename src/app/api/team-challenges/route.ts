import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CHALLENGE_TYPES = new Set(['steps', 'hydration', 'meditation', 'workout', 'checkups']);
const VALID_DURATIONS = new Set([7, 14, 30]);

function resolveUserId(token: any, requested: string | null): string {
  if (token?.sub) return token.sub;
  if (requested === 'demo-user') return 'demo-user';
  return '';
}

function mapChallenge(c: any, currentUserId: string) {
  const members = c.members || [];
  const totalContribution = members.reduce((sum: number, m: any) => sum + (m.contribution || 0), 0);
  const progress = c.target > 0 ? Math.min(100, Math.round((totalContribution / c.target) * 100)) : 0;
  const elapsedDays = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000);
  const daysLeft = Math.max(0, (c.daysLeft ?? c.duration) - elapsedDays);
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    type: c.type,
    icon: c.icon,
    color: c.color,
    dailyGoal: c.dailyGoal,
    duration: c.duration,
    daysLeft,
    ended: daysLeft === 0 || !c.isActive,
    reward: c.reward,
    maxMembers: c.maxMembers,
    progress,
    target: c.target,
    isActive: c.isActive,
    isJoined: members.some((m: any) => m.userId === currentUserId),
    isOwner: c.createdBy === currentUserId,
    membersCount: members.length,
    leaderboardPoints: Math.round(totalContribution),
    membersList: members
      .map((m: any) => ({
        name: m.userName,
        contribution: m.contribution,
        avatar: (m.avatar || m.userName?.charAt(0) || '?').toUpperCase(),
        isYou: m.userId === currentUserId,
      }))
      .sort((a: any, b: any) => b.contribution - a.contribution),
  };
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { searchParams } = new URL(req.url);
  const userId = resolveUserId(token, searchParams.get('userId'));
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const challenges = await prisma.teamChallenge.findMany({
      where: { isActive: true },
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = challenges.map((c) => mapChallenge(c, userId));

    const leaderboard = challenges
      .map((c) => {
        const total = c.members.reduce((s: number, m: any) => s + (m.contribution || 0), 0);
        return {
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          membersCount: c.members.length,
          points: Math.round(total),
          youJoined: c.members.some((m: any) => m.userId === userId),
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({ rank: idx + 1, ...entry }));

    return NextResponse.json({ challenges: mapped, leaderboard });
  } catch (error) {
    console.error('Team challenges GET error:', error);
    return NextResponse.json({ error: 'Failed to load team challenges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const body = await req.json().catch(() => ({}));
  const requested = String(body.userId || '');
  const userId = resolveUserId(token, requested === 'demo-user' ? 'demo-user' : null);
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const action = String(body.action || 'create');

  try {
    if (action === 'create') {
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) {
        return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
      }
      const type = String(body.type || '');
      if (!CHALLENGE_TYPES.has(type)) {
        return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
      }
      const duration = Number(body.duration) || 7;
      if (!VALID_DURATIONS.has(duration)) {
        return NextResponse.json({ error: 'Duration must be 7, 14 or 30 days' }, { status: 400 });
      }
      const maxMembers = Number(body.maxMembers) || 5;
      if (maxMembers < 2 || maxMembers > 20) {
        return NextResponse.json({ error: 'Max members must be between 2 and 20' }, { status: 400 });
      }

      const typeMeta: Record<string, { icon: string; color: string; dailyGoal: string; defaultReward: number; target: number }> = {
        steps: { icon: '👟', color: 'from-blue-500 to-cyan-500', dailyGoal: '10,000 steps/day', defaultReward: 500, target: 10000 },
        hydration: { icon: '💧', color: 'from-teal-500 to-emerald-500', dailyGoal: '100 glasses/day', defaultReward: 500, target: 120 },
        meditation: { icon: '🧘', color: 'from-purple-500 to-violet-500', dailyGoal: '300 min/week', defaultReward: 600, target: 300 },
        workout: { icon: '🏋️', color: 'from-orange-500 to-red-500', dailyGoal: '5 sessions/week', defaultReward: 600, target: 20 },
        checkups: { icon: '🩺', color: 'from-green-500 to-lime-500', dailyGoal: '2 checkups/week', defaultReward: 800, target: 8 },
      };
      const meta = typeMeta[type];

      const challenge = await prisma.teamChallenge.create({
        data: {
          name,
          description: String(body.description || '').trim().slice(0, 200) || meta.dailyGoal,
          type,
          icon: meta.icon,
          color: meta.color,
          dailyGoal: meta.dailyGoal,
          duration,
          daysLeft: duration,
          reward: Number(body.reward) || meta.defaultReward,
          maxMembers,
          target: Number(body.target) || meta.target,
          createdBy: userId,
          members: {
            create: {
              userId,
              userName: String(body.userName || 'You').trim().slice(0, 60) || 'You',
              contribution: 0,
              avatar: 'Y',
            },
          },
        },
        include: { members: true },
      });

      return NextResponse.json({ success: true, challenge: mapChallenge(challenge, userId) }, { status: 201 });
    }

    if (action === 'join' || action === 'leave') {
      const challengeId = String(body.challengeId || '');
      if (!challengeId) {
        return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
      }
      const challenge = await prisma.teamChallenge.findUnique({
        where: { id: challengeId },
        include: { members: true },
      });
      if (!challenge) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }

      if (action === 'join') {
        if (challenge.members.length >= challenge.maxMembers) {
          return NextResponse.json({ error: 'Team is full' }, { status: 400 });
        }
        if (challenge.members.some((m: any) => m.userId === userId)) {
          return NextResponse.json({ error: 'Already a member' }, { status: 400 });
        }
        await prisma.teamChallengeMember.create({
          data: {
            challengeId,
            userId,
            userName: String(body.userName || 'You').trim().slice(0, 60) || 'You',
            contribution: 0,
            avatar: 'Y',
          },
        });
      } else {
        if (!challenge.members.some((m: any) => m.userId === userId)) {
          return NextResponse.json({ error: 'Not a member' }, { status: 400 });
        }
        if (challenge.createdBy === userId) {
          return NextResponse.json({ error: 'Creator cannot leave the team' }, { status: 400 });
        }
        await prisma.teamChallengeMember.delete({
          where: { challengeId_userId: { challengeId, userId } },
        });
      }

      const updated = await prisma.teamChallenge.findUnique({
        where: { id: challengeId },
        include: { members: true },
      });
      return NextResponse.json({ success: true, challenge: mapChallenge(updated!, userId) });
    }

    if (action === 'contribute') {
      const challengeId = String(body.challengeId || '');
      const value = Number(body.value);
      if (!challengeId) {
        return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
      }
      if (!Number.isFinite(value) || value <= 0 || value > 100000) {
        return NextResponse.json({ error: 'Contribution value must be a positive number' }, { status: 400 });
      }
      const membership = await prisma.teamChallengeMember.findUnique({
        where: { challengeId_userId: { challengeId, userId } },
      });
      if (!membership) {
        return NextResponse.json({ error: 'Join the team before logging progress' }, { status: 400 });
      }

      await prisma.teamChallengeMember.update({
        where: { id: membership.id },
        data: { contribution: { increment: value } },
      });

      const challenge = await prisma.teamChallenge.findUnique({
        where: { id: challengeId },
        include: { members: true },
      });
      return NextResponse.json({ success: true, challenge: mapChallenge(challenge!, userId) });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Team challenges POST error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}