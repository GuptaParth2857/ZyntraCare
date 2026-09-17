import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

const CATEGORIES: Record<string, string> = {
  labs: 'Labs',
  pharmacy: 'Pharmacy',
  telehealth: 'Telehealth',
  fitness: 'Fitness',
  nutrition: 'Nutrition',
  wearables: 'Wearables',
  insurance: 'Insurance',
};

const DEFAULT_PRODUCTS = [
  { title: '₹200 Lab Test Voucher', description: 'Redeem for any lab test at partner ZyntraLabs.', coinsRequired: 200, category: 'labs', icon: '🧪', brand: 'ZyntraLabs', originalPrice: '₹200', stock: 50, bestSeller: false },
  { title: '₹500 Pharmacy Order Discount', description: 'Flat ₹500 off pharmacy orders above ₹1500.', coinsRequired: 400, category: 'pharmacy', icon: '💊', brand: 'ZyntraPharmacy', originalPrice: '₹500 off', stock: 40, bestSeller: true },
  { title: 'Free Teleconsultation', description: 'Free video consultation with any specialist.', coinsRequired: 150, category: 'telehealth', icon: '👨‍⚕️', brand: 'ZyntraTelehealth', originalPrice: '₹500 value', stock: 30, bestSeller: false },
  { title: '₹1,000 Lab Panel Voucher', description: 'Redeem for a comprehensive 60+ parameter panel.', coinsRequired: 300, category: 'labs', icon: '🔬', brand: 'ZyntraDiagnostics', originalPrice: '₹1,000', stock: 25, bestSeller: false },
  { title: 'Smartwatch ₹1,500 Discount', description: 'On smartwatches from partner brands.', coinsRequired: 1200, category: 'wearables', icon: '⌚', brand: 'ZyntraWearables', originalPrice: '₹1,500 off', stock: 10, bestSeller: false },
  { title: '₹200 Diagnostics Coupon', description: 'Flat ₹200 off diagnostics & screening combos.', coinsRequired: 250, category: 'labs', icon: '🩸', brand: 'ZyntraLabs', originalPrice: '₹200 off', stock: 20, bestSeller: false },
  { title: 'Gym Membership 1 Month', description: 'Access to 500+ partner gyms across India.', coinsRequired: 900, category: 'fitness', icon: '🏋️', brand: 'FitIndia', originalPrice: '₹1,500', stock: 15, bestSeller: false },
  { title: '₹250 Nutrition Consultation', description: 'Personalized diet plan from a nutritionist.', coinsRequired: 350, category: 'nutrition', icon: '🥗', brand: 'NutriCare', originalPrice: '₹250 off', stock: 20, bestSeller: false },
  { title: '₹500 Health Insurance Voucher', description: 'Off on your premium for partner insurers.', coinsRequired: 1400, category: 'insurance', icon: '🛡️', brand: 'ZyntraInsurance', originalPrice: '₹500 off', stock: 12, bestSeller: false },
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

async function resolveUser(req: NextRequest): Promise<string> {
  const token = await getToken({ req });
  const { searchParams } = new URL(req.url);
  if (token?.sub) return token.sub;
  if (searchParams.get('userId') === 'demo-user') return 'demo-user';
  return '';
}

async function resolveUserFromBody(req: NextRequest, body: any): Promise<string> {
  const token = await getToken({ req });
  if (token?.sub) return token.sub;
  if (body?.userId === 'demo-user') return 'demo-user';
  return '';
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let wallet = await prisma.healthWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.healthWallet.create({ data: { userId } });
    }

    const activeCount = await prisma.rewardItem.count({ where: { isActive: true, kind: 'reward' } });
    if (activeCount === 0) {
      await prisma.rewardItem.createMany({ data: DEFAULT_PRODUCTS });
    }

    const items = await prisma.rewardItem.findMany({ where: { isActive: true, kind: 'reward' }, orderBy: { coinsRequired: 'asc' } });

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      orderBy: { redeemedAt: 'desc' },
      take: 20,
      include: { item: { select: { title: true, icon: true } } },
    });

    return NextResponse.json({
      wallet: { balance: wallet.balance },
      items: items.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        coinsRequired: i.coinsRequired,
        category: i.category,
        icon: i.icon,
        brand: i.brand,
        originalPrice: i.originalPrice,
        stock: i.stock,
        bestSeller: i.bestSeller,
      })),
      redemptions: redemptions.map(r => ({
        id: r.id,
        title: r.item.title,
        icon: r.item.icon,
        coinsSpent: r.coinsSpent,
        code: r.code,
        date: new Date(r.redeemedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      })),
    });
  } catch (error) {
    console.error('Health coins marketplace GET error:', error);
    return NextResponse.json({ error: 'Failed to load marketplace' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = await resolveUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const cart = Array.isArray(body?.cart) ? body.cart : [];
    if (cart.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    const normalized = cart
      .map(l => ({
        itemId: typeof l?.itemId === 'string' ? l.itemId : '',
        quantity: Math.max(1, Math.floor(Number(l?.quantity) || 1)),
      }))
      .filter(l => l.itemId);

    const ids = normalized.map(l => l.itemId);
    const items = await prisma.rewardItem.findMany({ where: { id: { in: ids }, isActive: true, kind: 'reward' } });
    const itemMap = new Map(items.map(i => [i.id, i]));

    const resolved: { item: (typeof items)[number]; quantity: number }[] = [];
    for (const line of normalized) {
      const item = itemMap.get(line.itemId);
      if (!item) {
        return NextResponse.json({ error: 'One or more products are no longer available' }, { status: 400 });
      }
      if (item.stock < line.quantity) {
        return NextResponse.json({ error: `${item.title} is out of stock` }, { status: 400 });
      }
      resolved.push({ item, quantity: line.quantity });
    }

    const totalCost = resolved.reduce((sum, { item, quantity }) => sum + item.coinsRequired * quantity, 0);

    let wallet = await prisma.healthWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.healthWallet.create({ data: { userId } });
    }
    if (wallet.balance < totalCost) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    const result = await prisma.$transaction(async tx => {
      const updated = await tx.healthWallet.update({
        where: { id: wallet!.id },
        data: { balance: { decrement: totalCost } },
      });

      await tx.healthTransaction.create({
        data: {
          walletId: wallet!.id,
          amount: totalCost,
          type: 'debit',
          category: 'reward',
          description: `Marketplace purchase (${resolved.length} ${resolved.length === 1 ? 'item' : 'items'})`,
          status: 'completed',
        },
      });

      await tx.rewardItem.updateMany({
        where: { id: { in: resolved.map(r => r.item.id) } },
        data: { stock: { decrement: 0 } },
      });

      const redemptions: {
        id: string;
        itemId: string;
        coinsSpent: number;
        code: string;
        redeemedAt: Date;
      }[] = [];
      for (const { item, quantity } of resolved) {
        await tx.rewardItem.update({
          where: { id: item.id },
          data: { stock: { decrement: quantity } },
        });
        for (let i = 0; i < quantity; i++) {
          redemptions.push(await tx.rewardRedemption.create({
            data: {
              itemId: item.id,
              userId,
              coinsSpent: item.coinsRequired,
              code: redemptionCode(),
            },
          }));
        }
      }

      return { balance: updated.balance, redemptions };
    });

    return NextResponse.json({
      balance: result.balance,
      redemptions: result.redemptions.map(r => ({
        id: r.id,
        itemId: r.itemId,
        coinsSpent: r.coinsSpent,
        code: r.code,
      })),
    });
  } catch (error) {
    console.error('Health coins marketplace POST error:', error);
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
