import { NextRequest, NextResponse } from 'next/server';
import { PlaidService } from '@/lib/plaidService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('accountId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const sortBy = searchParams.get('sortBy') as "date" | "amount" | "name" | undefined;
        const sortOrder = searchParams.get('sortOrder') as "asc" | "desc" | undefined;

        const filters = {
            accountId: accountId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            category: category || undefined,
            search: search || undefined,
            status: status || undefined,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        };

        const transactions = await PlaidService.getTransactions(filters);
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        return NextResponse.json(
            { error: 'Failed to get transactions' },
            { status: 500 }
        );
    }
} 