import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function POST(request: NextRequest) {
    try {
        await PlaidService.syncTransactions();
        return NextResponse.json({ message: 'Transaction sync completed' });
    } catch (error) {
        console.error('Error syncing transactions:', error);
        return NextResponse.json(
            { error: 'Failed to sync transactions' },
            { status: 500 }
        );
    }
} 