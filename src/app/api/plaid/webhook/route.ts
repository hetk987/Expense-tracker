import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        await PlaidService.handleWebhook(body);
        return NextResponse.json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 