import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function POST(request: NextRequest) {
    try {
        const linkToken = await PlaidService.createLinkToken();
        return NextResponse.json({ link_token: linkToken });
    } catch (error) {
        console.error('Error creating link token:', error);
        return NextResponse.json(
            { error: 'Failed to create link token' },
            { status: 500 }
        );
    }
} 