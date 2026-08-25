import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || token?.sub || '';

    if (!userId) {
      return NextResponse.json({ wallet: null, transactions: [] });
    }

    let wallet = await prisma.healthWallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });

    if (!wallet) {
      wallet = await prisma.healthWallet.create({
        data: { userId },
        include: { transactions: true },
      });
    }

    return NextResponse.json({ wallet, transactions: wallet.transactions });
  } catch (error) {
    console.error('Health wallet GET error:', error);
    return NextResponse.json({ wallet: null, transactions: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, type, category, description, referenceId } = body;

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'userId, amount, and type are required' }, { status: 400 });
    }

    const balanceChange = type === 'credit' ? amount : -amount;

    const [wallet, transaction] = await prisma.$transaction(async (tx) => {
      let wallet = await tx.healthWallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.healthWallet.create({ data: { userId } });
      }

      const updated = await tx.healthWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: balanceChange } },
      });

      const txn = await tx.healthTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type,
          category: category || 'general',
          description: description || '',
          referenceId: referenceId || null,
        },
      });

      return [updated, txn];
    });

    return NextResponse.json({ transaction, balance: wallet.balance }, { status: 201 });
  } catch (error) {
    console.error('Health wallet POST error:', error);
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}
