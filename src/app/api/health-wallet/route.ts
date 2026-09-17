import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    const { searchParams } = new URL(req.url);
    const requested = searchParams.get('userId') || '';
    const userId = token?.sub || (requested === 'demo-user' ? 'demo-user' : '');

    if (!userId) {
      return NextResponse.json({ wallet: null, transactions: [], error: 'Authentication required' }, { status: 401 });
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
    const token = await getToken({ req });
    const body = await req.json();
    const userId = token?.sub || (body.userId === 'demo-user' ? 'demo-user' : '');

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { amount, type, category, description, referenceId } = body;
    const numeric = Number(amount);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return NextResponse.json({ error: 'A valid positive amount is required' }, { status: 400 });
    }
    if (type !== 'credit' && type !== 'debit') {
      return NextResponse.json({ error: 'type must be credit or debit' }, { status: 400 });
    }

    const balanceChange = type === 'credit' ? numeric : -numeric;

    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.healthWallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.healthWallet.create({ data: { userId } });
      }

      if (type === 'debit' && wallet.balance < numeric) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      const updated = await tx.healthWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: balanceChange } },
      });

      const txn = await tx.healthTransaction.create({
        data: {
          walletId: wallet.id,
          amount: numeric,
          type,
          category: category || 'general',
          description: description || '',
          referenceId: referenceId || null,
          status: 'completed',
        },
      });

      return { wallet: updated, transaction: txn };
    });

    return NextResponse.json({ transaction: result.transaction, balance: result.wallet.balance }, { status: 201 });
  } catch (error) {
    console.error('Health wallet POST error:', error);
    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 402 });
    }
    return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
  }
}