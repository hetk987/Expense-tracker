import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function GET(request: NextRequest) {
    try {
        const accounts = await PlaidService.getAccounts();
        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error getting accounts:', error);
        return NextResponse.json(
            { error: 'Failed to get accounts' },
            { status: 500 }
        );
    }
} 