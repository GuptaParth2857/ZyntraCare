import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const LEVELS = [
  { level: 1, label: 'Bronze', threshold: 0 },
  { level: 2, label: 'Silver', threshold: 250 },
  { level: 3, label: 'Gold', threshold: 600 },
  { level: 4, label: 'Platinum', threshold: 1500 },
  { level: 5, label: 'Diamond', threshold: 3000 },
];

const STEP_GOAL = 10000;

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_CATALOG = [
  { title: '20% OFF Full Body Checkup', description: 'Gold package: 80+ tests including CBC, lipid profile, HbA1c, thyroid & vitamin panel.', coinsRequired: 400, category: 'labs', icon: '🩺', discount: '20% OFF' },
  { title: 'Free Doctor Consultation', description: 'One complimentary video consultation with a general physician (15 min).', coinsRequired: 600, category: 'consultation', icon: '🧑‍⚕️', discount: '₹0 Consult' },
  { title: '10% OFF Medicine Order', description: 'Flat 10% off on any pharmacy order above ₹500 home-delivered.', coinsRequired: 250, category: 'pharmacy', icon: '💊', discount: '10% OFF' },
  { title: 'Free Vitamin D Test', description: 'Vitamin D (25-OH) quantitative test at an NABL accredited lab.', coinsRequired: 300, category: 'diagnostics', icon: '🧪', discount: 'Free Test' },
  { title: '30% OFF Dental Cleaning', description: 'Professional scaling & polishing at partner dental clinics.', coinsRequired: 500, category: 'wellness', icon: '🦷', discount: '30% OFF' },
  { title: 'Fitness Band Discount', description: '₹300 off on compatible fitness bands with ZyntraCare app sync.', coinsRequired: 800, category: 'wellness', icon: '⌚', discount: '₹300 OFF' },
];

function redemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return `ZYN-${out}`;
}

function levelForBalance(balance: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (balance >= l.threshold) current = l;
  }
  const next = LEVELS.find(l => l.level === current.level + 1) || null;
  return { current, next };
}

function formatDate(d: Date) {
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}

async function resolveUser(req: NextRequest): Promise<string> {
  const token = await getToken({ req });
  const { searchParams } = new URL(req.url);
  if (token?.sub) return token.sub;
  if (searchParams.get('userId') === 'demo-user') return 'demo-user';
  return '';
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let wallet = await prisma.healthWallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 40 } },
    });
    if (!wallet) {
      wallet = await prisma.healthWallet.create({
        data: { userId },
        include: { transactions: true },
      });
    }

    const activeCount = await prisma.rewardItem.count({ where: { isActive: true, kind: 'reward' } });
    if (activeCount === 0) {
      await prisma.rewardItem.createMany({ data: DEFAULT_CATALOG });
    }

    const items = await prisma.rewardItem.findMany({ where: { isActive: true, kind: 'reward' }, orderBy: { coinsRequired: 'asc' } });
    const redemptions = await prisma.rewardRedemption.findMany({ where: { userId } });

    const redeemed: Record<string, string> = {};
    redemptions.forEach(r => {
      if (r.status !== 'expired' && !redeemed[r.itemId]) redeemed[r.itemId] = r.code;
    });

    const totalCoins = wallet.balance;
    const { current, next } = levelForBalance(totalCoins);
    const nextRewardCoins = next ? Math.max(0, next.threshold - totalCoins) : 0;
    const levelProgress = next
      ? Math.min(100, Math.round(((totalCoins - current.threshold) / Math.max(1, next.threshold - current.threshold)) * 100))
      : 100;

    const creditDays = new Set<string>();
    wallet.transactions.forEach(t => {
      if (t.type === 'credit') creditDays.add(t.createdAt.toISOString().slice(0, 10));
    });
    let streak = 0;
    if (creditDays.size > 0) {
      const latest = [...creditDays].sort().pop() as string;
      const cur = new Date(latest + 'T00:00:00Z');
      const dayKey = (d: Date) => d.toISOString().slice(0, 10);
      while (creditDays.has(dayKey(cur))) {
        streak++;
        cur.setUTCDate(cur.getUTCDate() - 1);
      }
    }

    const latestWearable = await prisma.wearableData.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
    const todayKey = new Date().toISOString().slice(0, 10);
    const stepsToday = latestWearable && latestWearable.recordedAt.toISOString().slice(0, 10) === todayKey ? (latestWearable.steps || 0) : 0;

    const recentTransactions = wallet.transactions.map(t => ({
      id: t.id,
      type: t.type === 'credit' ? 'earned' : 'spent',
      amount: t.amount,
      description: t.description || (t.type === 'credit' ? 'Coins earned' : 'Coins spent'),
      date: formatDate(t.createdAt),
    }));

    const missions = await prisma.wellnessMission.findMany({ where: { isActive: true }, orderBy: { points: 'desc' } });
    const progressRows = await prisma.wellnessMissionProgress.findMany({ where: { userId } });
    const progressMap = new Map(progressRows.map(p => [p.missionId, p]));
    const dailyTasks = missions.map(m => {
      const p = progressMap.get(m.id);
      return {
        id: m.id,
        title: m.title,
        coins: m.points,
        icon: m.icon || '✅',
        completed: p?.completed || false,
      };
    });

    const walletUsers = await prisma.healthWallet.findMany({
      orderBy: { balance: 'desc' },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    });
    const leaderboard = walletUsers.map((w, i) => {
      const lvl = levelForBalance(w.balance).current;
      const name = w.user?.name || w.user?.email?.split('@')[0] || 'Member';
      return {
        rank: i + 1,
        name,
        avatar: (name[0] || 'U').toUpperCase(),
        coins: w.balance,
        level: `${lvl.label} · L${lvl.level}`,
        isUser: w.userId === userId,
      };
    });

    const rewardLedger = await prisma.reward.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    const totalPoints = rewardLedger.reduce((sum, r) => sum + r.points, 0);

    const rewardCatalog = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      coinsRequired: item.coinsRequired,
      category: item.category,
      icon: item.icon,
      discount: item.discount,
      redeemed: !!redeemed[item.id],
      code: redeemed[item.id] || null,
    }));

    const userStats = {
      totalCoins,
      streakDays: streak,
      level: current.level,
      rank: current.label,
      nextRewardCoins,
      levelProgress,
      stepsToday,
      stepsGoal: STEP_GOAL,
    };

    return NextResponse.json({ userStats, recentTransactions, rewardCatalog, dailyTasks, leaderboard, levels: LEVELS, rewards: rewardLedger, totalPoints });
  } catch (error) {
    console.error('Rewards GET error:', error);
    return NextResponse.json({ error: 'Failed to load rewards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = await getToken({ req });
    const userId = token?.sub || (body.userId === 'demo-user' ? 'demo-user' : '');

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (body.action === 'redeem') {
      const itemId = typeof body.itemId === 'string' ? body.itemId.trim() : '';
      if (!itemId) {
        return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
      }
      const item = await prisma.rewardItem.findFirst({ where: { id: itemId, isActive: true } });
      if (!item) {
        return NextResponse.json({ error: 'Reward item not found' }, { status: 404 });
      }

      let wallet = await prisma.healthWallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await prisma.healthWallet.create({ data: { userId } });
      }
      if (wallet.balance < item.coinsRequired) {
        return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
      }

      const result = await prisma.$transaction(async tx => {
        const updated = await tx.healthWallet.update({
          where: { id: wallet!.id },
          data: { balance: { decrement: item.coinsRequired } },
        });
        await tx.healthTransaction.create({
          data: {
            walletId: wallet!.id,
            amount: item.coinsRequired,
            type: 'debit',
            category: 'reward',
            description: `Redeemed: ${item.title}`,
            referenceId: item.id,
            status: 'completed',
          },
        });
        const redemption = await tx.rewardRedemption.create({
          data: {
            itemId: item.id,
            userId,
            coinsSpent: item.coinsRequired,
            code: redemptionCode(),
          },
        });
        return { redemption, balance: updated.balance };
      });

      return NextResponse.json({ redemption: result.redemption, balance: result.balance });
    }

    if (typeof body.points === 'number' || typeof body.points === 'string') {
      const points = Number(body.points);
      if (!Number.isFinite(points) || points <= 0) {
        return NextResponse.json({ error: 'A valid positive points value is required' }, { status: 400 });
      }
      const source = typeof body.source === 'string' && body.source ? body.source : 'general';
      const description = typeof body.description === 'string' ? body.description : 'Coins earned';

      const result = await prisma.$transaction(async tx => {
        let wallet = await tx.healthWallet.findUnique({ where: { userId } });
        if (!wallet) {
          wallet = await tx.healthWallet.create({ data: { userId } });
        }
        await tx.healthWallet.update({
          where: { id: wallet!.id },
          data: { balance: { increment: points } },
        });
        await tx.healthTransaction.create({
          data: {
            walletId: wallet!.id,
            amount: points,
            type: 'credit',
            category: body.category || 'reward',
            description,
            referenceId: typeof body.referenceId === 'string' ? body.referenceId : null,
            status: 'completed',
          },
        });
        const reward = await tx.reward.create({
          data: { userId, points, source, description },
        });
        return reward;
      });

      return NextResponse.json({ reward: result }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Rewards POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}