export interface PlaidAccount {
    id: string;
    plaidAccountId: string;
    name: string;
    mask?: string;
    type: string;
    subtype?: string;
    institutionId: string;
    createdAt: string;
    updatedAt: string;
    transactions?: PlaidTransaction[];
}

export interface PlaidTransaction {
    id: string;
    plaidTransactionId: string;
    accountId: string;
    amount: number;
    currency: string;
    date: string;
    name: string;
    merchantName?: string;
    category: string[];
    pending: boolean;
    paymentChannel?: string;
    transactionType?: string;
    createdAt: string;
    updatedAt: string;
    account?: PlaidAccount;
}

export interface LinkTokenResponse {
    link_token: string;
}

export interface ExchangeTokenRequest {
    public_token: string;
}

export interface ExchangeTokenResponse {
    message: string;
    accounts: {
        id: string;
        name: string;
        type: string;
        subtype: string;
    }[];
}

export interface TransactionsResponse {
    transactions: PlaidTransaction[];
    total: number;
    hasMore: boolean;
}

export interface TransactionFilters {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    category?: string;
}

export interface CategoryData {
    category: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface TimeSeriesData {
    date: string;
    amount: number;
    count: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
        borderWidth?: number;
    }[];
} 