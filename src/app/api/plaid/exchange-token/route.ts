import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { public_token } = body;

        if (!public_token) {
            return NextResponse.json(
                { error: 'Public token is required' },
                { status: 400 }
            );
        }

        const result = await PlaidService.exchangePublicToken(public_token);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error exchanging public token:', error);
        return NextResponse.json(
            { error: 'Failed to exchange public token' },
            { status: 500 }
        );
    }
} 