import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function getMonthName(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
    };
}

export function getLast30DaysRange() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
    };
} 