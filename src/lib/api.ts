import axios from 'axios';
import {
    LinkTokenResponse,
    ExchangeTokenRequest,
    ExchangeTokenResponse,
    PlaidAccount,
    TransactionsResponse,
    TransactionFilters,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const plaidApi = {
    // Create a link token for Plaid Link
    createLinkToken: async (): Promise<LinkTokenResponse> => {
        const response = await api.post<LinkTokenResponse>('/api/plaid/create-link-token');
        return response.data;
    },

    // Exchange public token for access token
    exchangePublicToken: async (publicToken: string): Promise<ExchangeTokenResponse> => {
        const response = await api.post<ExchangeTokenResponse>('/api/plaid/exchange-token', {
            public_token: publicToken,
        } as ExchangeTokenRequest);
        return response.data;
    },

    // Get all linked accounts
    getAccounts: async (): Promise<PlaidAccount[]> => {
        const response = await api.get<PlaidAccount[]>('/api/plaid/accounts');
        return response.data;
    },

    // Get transactions with optional filtering
    getTransactions: async (filters: TransactionFilters = {}): Promise<TransactionsResponse> => {
        const params = new URLSearchParams();

        if (filters.accountId) params.append('accountId', filters.accountId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.category) params.append('category', filters.category);

        const response = await api.get<TransactionsResponse>(`/api/plaid/transactions?${params.toString()}`);
        return response.data;
    },

    // Manually trigger transaction sync
    syncTransactions: async (): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/api/plaid/sync');
        return response.data;
    },
};

export default api;