import { PlaidTransaction, CategoryData, TimeSeriesData } from '@/types'
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'

export function processCategoryData(transactions: PlaidTransaction[]): CategoryData[] {
    const categoryMap = new Map<string, { amount: number; count: number }>()

    // Process transactions
    transactions.forEach(transaction => {
        if (transaction.amount < 0) { // Only process expenses (negative amounts)
            const category = transaction.category?.[0] || 'Uncategorized'
            const current = categoryMap.get(category) || { amount: 0, count: 0 }

            categoryMap.set(category, {
                amount: current.amount + Math.abs(transaction.amount),
                count: current.count + 1
            })
        }
    })

    // Convert to array and calculate percentages
    const totalAmount = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.amount, 0)

    const categoryData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([category, { amount, count }]) => ({
            category,
            amount,
            count,
            percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount) // Sort by amount descending

    return categoryData
}

export function processTimeSeriesData(
    transactions: PlaidTransaction[],
    startDate: string,
    endDate: string
): TimeSeriesData[] {
    const dateMap = new Map<string, { amount: number; count: number }>()

    // Initialize all dates in range with zero values
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const dateRange = eachDayOfInterval({ start, end })

    dateRange.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        dateMap.set(dateKey, { amount: 0, count: 0 })
    })

    // Process transactions
    transactions.forEach(transaction => {
        if (transaction.amount < 0) { // Only process expenses
            const dateKey = format(parseISO(transaction.date), 'yyyy-MM-dd')
            const current = dateMap.get(dateKey)

            if (current) {
                dateMap.set(dateKey, {
                    amount: current.amount + Math.abs(transaction.amount),
                    count: current.count + 1
                })
            }
        }
    })

    // Convert to array and sort by date
    const timeSeriesData: TimeSeriesData[] = Array.from(dateMap.entries())
        .map(([date, { amount, count }]) => ({
            date: format(parseISO(date), 'MMM dd'),
            amount,
            count
        }))
        .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

    return timeSeriesData
}

export function getAvailableCategories(transactions: PlaidTransaction[]): string[] {
    const categories = new Set<string>()

    transactions.forEach(transaction => {
        if (transaction.category && transaction.category.length > 0) {
            categories.add(transaction.category[0])
        }
    })

    return Array.from(categories).sort()
}

export function calculateCreditCardMetrics(transactions: PlaidTransaction[]) {
    const expenses = transactions.filter(t => t.amount < 0)
    const totalSpending = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const averageTransaction = expenses.length > 0 ? totalSpending / expenses.length : 0
    const largestTransaction = expenses.length > 0 ? Math.max(...expenses.map(t => Math.abs(t.amount))) : 0

    return {
        totalSpending,
        averageTransaction,
        largestTransaction,
        transactionCount: expenses.length
    }
}

export function getTopSpendingCategories(transactions: PlaidTransaction[], limit: number = 5): CategoryData[] {
    const categoryData = processCategoryData(transactions)
    return categoryData.slice(0, limit)
}

export function processTransactionsForCharts(transactions: PlaidTransaction[]) {
    const categoryBreakdown = processCategoryData(transactions)
    const topCategories = getTopSpendingCategories(transactions, 5)
    
    return {
        categoryBreakdown,
        topCategories
    }
} 