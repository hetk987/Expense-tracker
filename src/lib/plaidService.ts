import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { prisma } from './prismaClient';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
            'PLAID-SECRET': process.env.PLAID_SECRET!,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

export interface TransactionFilters {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    category?: string;
}

export class PlaidService {
    /**
     * Creates a link token for Plaid Link integration
     */
    static async createLinkToken(): Promise<string> {
        try {
            const request = {
                user: { client_user_id: 'user-id' },
                client_name: 'Expense Tracker',
                products: [Products.Transactions],
                country_codes: [CountryCode.Us],
                language: 'en',
                webhook: process.env.PLAID_WEBHOOK_URL,
            };

            const response = await plaidClient.linkTokenCreate(request);

            // Store the link token in database
            await prisma.plaidLinkToken.create({
                data: {
                    token: response.data.link_token,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                },
            });

            return response.data.link_token;
        } catch (error) {
            console.error('Error creating link token:', error);
            throw error;
        }
    }

    /**
     * Exchanges a public token (from Plaid Link) for an access token
     */
    static async exchangePublicToken(publicToken: string): Promise<{ access_token: string; accounts: any[] }> {
        try {
            const response = await plaidClient.itemPublicTokenExchange({
                public_token: publicToken,
            });

            const accessToken = response.data.access_token;
            const itemId = response.data.item_id;

            // Get item information to get institution_id
            const itemResponse = await plaidClient.itemGet({
                access_token: accessToken,
            });

            const institutionId = itemResponse.data.item.institution_id || 'unknown';

            // Get accounts for this access token
            const accountsResponse = await plaidClient.accountsGet({
                access_token: accessToken,
            });

            // Create or get the link token record
            const linkToken = await prisma.plaidLinkToken.create({
                data: {
                    token: `link_${Date.now()}`, // Generate a unique token
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                },
            });

            // Store accounts in database
            const accounts = await Promise.all(
                accountsResponse.data.accounts.map(async (account) => {
                    return await prisma.plaidAccount.create({
                        data: {
                            plaidAccountId: account.account_id,
                            name: account.name,
                            mask: account.mask,
                            type: account.type,
                            subtype: account.subtype,
                            institutionId: institutionId,
                            linkTokenId: linkToken.id,
                            accessToken: accessToken,
                        },
                    });
                })
            );

            return {
                access_token: accessToken,
                accounts: accounts,
            };
        } catch (error) {
            console.error('Error exchanging public token:', error);
            throw error;
        }
    }

    /**
     * Fetches all accounts from database
     */
    static async getAccounts() {
        try {
            const accounts = await prisma.plaidAccount.findMany({
                orderBy: {
                    name: 'asc',
                },
            });

            return accounts;
        } catch (error) {
            console.error('Error getting accounts:', error);
            throw error;
        }
    }

    /**
     * Fetches transactions from database with optional filtering
     */
    static async getTransactions(filters: TransactionFilters = {}) {
        try {
            const where: any = {};

            if (filters.accountId) {
                where.accountId = filters.accountId;
            }

            if (filters.startDate) {
                where.date = {
                    ...where.date,
                    gte: new Date(filters.startDate),
                };
            }

            if (filters.endDate) {
                where.date = {
                    ...where.date,
                    lte: new Date(filters.endDate),
                };
            }

            if (filters.category) {
                where.category = {
                    has: filters.category,
                };
            }

            const transactions = await prisma.plaidTransaction.findMany({
                where,
                include: {
                    account: true,
                },
                orderBy: {
                    date: 'desc',
                },
                take: filters.limit || 100,
                skip: filters.offset || 0,
            });

            const total = await prisma.plaidTransaction.count({ where });

            return {
                transactions,
                total,
                hasMore: (filters.offset || 0) + (filters.limit || 100) < total,
            };
        } catch (error) {
            console.error('Error getting transactions:', error);
            throw error;
        }
    }

    /**
     * Syncs transactions for all active accounts
     */
    static async syncTransactions() {
        try {
            console.log('Starting transaction sync...');

            const accounts = await prisma.plaidAccount.findMany();

            for (const account of accounts) {
                await this.syncAccountTransactions(account);
            }

            console.log('Transaction sync completed');
        } catch (error) {
            console.error('Error syncing transactions:', error);
            throw error;
        }
    }

    /**
     * Syncs transactions for a single account
     */
    private static async syncAccountTransactions(account: any) {
        try {
            // Get the last transaction date for this account
            const lastTransaction = await prisma.plaidTransaction.findFirst({
                where: {
                    accountId: account.id,
                },
                orderBy: {
                    date: 'desc',
                },
            });

            const startDate = lastTransaction
                ? lastTransaction.date.toISOString().split('T')[0]
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

            const endDate = new Date().toISOString().split('T')[0];

            // Fetch transactions from Plaid
            const response = await plaidClient.transactionsGet({
                access_token: account.accessToken,
                start_date: startDate,
                end_date: endDate,
                options: {
                    include_personal_finance_category: true,
                },
            });

            const transactions = response.data.transactions;

            // Save new transactions to database
            for (const transaction of transactions) {
                await prisma.plaidTransaction.upsert({
                    where: {
                        plaidTransactionId: transaction.transaction_id,
                    },
                    update: {
                        amount: transaction.amount,
                        name: transaction.name,
                        merchantName: transaction.merchant_name,
                        category: transaction.category || [],
                        pending: transaction.pending,
                        paymentChannel: transaction.payment_channel,
                        transactionType: transaction.transaction_type,
                        updatedAt: new Date(),
                    },
                    create: {
                        plaidTransactionId: transaction.transaction_id,
                        accountId: account.id,
                        amount: transaction.amount,
                        date: new Date(transaction.date),
                        name: transaction.name,
                        merchantName: transaction.merchant_name,
                        category: transaction.category || [],
                        pending: transaction.pending,
                        paymentChannel: transaction.payment_channel,
                        transactionType: transaction.transaction_type,
                    },
                });
            }

            console.log(`Synced ${transactions.length} transactions for account ${account.name}`);
        } catch (error) {
            console.error(`Error syncing transactions for account ${account.name}:`, error);
        }
    }

    /**
     * Handles Plaid webhooks
     */
    static async handleWebhook(webhookData: any) {
        try {
            console.log('Processing webhook:', webhookData);

            if (webhookData.webhook_type === 'TRANSACTIONS') {
                if (webhookData.webhook_code === 'INITIAL_UPDATE' ||
                    webhookData.webhook_code === 'HISTORICAL_UPDATE' ||
                    webhookData.webhook_code === 'DEFAULT_UPDATE') {

                    // Trigger transaction sync
                    await this.syncTransactions();
                }
            }

            return { message: 'Webhook processed successfully' };
        } catch (error) {
            console.error('Error handling webhook:', error);
            throw error;
        }
    }
} 