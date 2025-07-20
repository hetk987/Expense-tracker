"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import SpendingLineChart from "@/components/charts/SpendingLineChart";
import {
  CreditCard,
  TrendingDown,
  Plus,
  RefreshCw,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
} from "lucide-react";
import { plaidApi } from "@/lib/api";
import { PlaidAccount, PlaidTransaction } from "@/types";
import { formatCurrency, formatDate, getCurrentMonthRange } from "@/lib/utils";
import {
  processCategoryData,
  processTimeSeriesData,
  calculateCreditCardMetrics,
  getTopSpendingCategories,
  processTransactionsForCharts,
} from "@/lib/chartUtils";
import CategoryBarChart from "@/components/charts/CategoryBarChart";

export default function Dashboard() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    PlaidTransaction[]
  >([]);
  const [allTransactions, setAllTransactions] = useState<PlaidTransaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [chartView, setChartView] = useState<"pie" | "bar" | "line">("pie");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [accountsData, recentTransactionsData, allTransactionsData] =
        await Promise.all([
          plaidApi.getAccounts(),
          plaidApi.getTransactions({ limit: 10 }),
          plaidApi.getTransactions({
            limit: 1000,
            ...getCurrentMonthRange(),
          }),
        ]);
      setAccounts(accountsData);
      setRecentTransactions(recentTransactionsData.transactions);
      setAllTransactions(allTransactionsData.transactions);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTransactions = async () => {
    try {
      setSyncing(true);
      await plaidApi.syncTransactions();
      await loadDashboardData(); // Reload data after sync
    } catch (error) {
      console.error("Error syncing transactions:", error);
    } finally {
      setSyncing(false);
    }
  };

  const creditCardMetrics = calculateCreditCardMetrics(allTransactions);
  const categoryData = processCategoryData(allTransactions);
  const timeSeriesData = processTimeSeriesData(
    allTransactions,
    getCurrentMonthRange().startDate,
    getCurrentMonthRange().endDate
  );
  const topCategories = getTopSpendingCategories(allTransactions, 5);

  const filteredTransactions =
    selectedCategory === "all"
      ? allTransactions
      : allTransactions.filter(
          (t) => t.category && t.category.includes(selectedCategory)
        );
  const chartData = processCategoryData(filteredTransactions);

  const totalSpending = filteredTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const averageTransaction =
    filteredTransactions.length > 0
      ? totalSpending / filteredTransactions.length
      : 0;
  const largestTransaction =
    filteredTransactions.length > 0
      ? Math.max(...filteredTransactions.map((t) => Math.abs(t.amount)))
      : 0;

  const categories = [
    "all",
    ...Array.from(
      new Set(
        filteredTransactions.flatMap((t) => t.category || []).filter(Boolean)
      )
    ),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Credit Card Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your credit card spending and expenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSyncTransactions}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Transactions"}
          </Button>
          <Button asChild>
            <Link href="/link-account" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Link Account
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={String(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(String(category))}
              className="text-sm"
            >
              {category === "all" ? "All Categories" : String(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalSpending)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Across {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Transaction
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(averageTransaction)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Largest Transaction
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(largestTransaction)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Highest single charge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Linked Cards
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {accounts.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connected accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Spending Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Spending by Category
            </h2>
            <div className="flex gap-2">
              <Button
                variant={chartView === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("pie")}
                className="flex items-center gap-1"
              >
                <PieChart className="h-4 w-4" />
                Pie
              </Button>
              <Button
                variant={chartView === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("bar")}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                Bar
              </Button>
            </div>
          </div>

          {chartView === "pie" ? (
            <CategoryPieChart data={topCategories} title="" />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Spending Categories
              </h3>
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3B82F6",
                            "#EF4444",
                            "#10B981",
                            "#F59E0B",
                            "#8B5CF6",
                          ][index],
                        }}
                      />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spending Over Time Chart */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Spending Over Time
          </h2>
          <SpendingLineChart data={timeSeriesData} title="" />
        </div>
      </div>

      {/* Accounts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Linked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Linked Credit Cards
            </CardTitle>
            <CardDescription>
              Your connected credit card accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No credit cards linked yet</p>
                <Button asChild>
                  <Link href="/link-account">Link Your First Card</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-gray-600">
                          {account.type} • {account.subtype}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {account.mask ? `****${account.mask}` : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Your latest credit card activity</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No transactions yet</p>
                <Button asChild>
                  <Link href="/transactions">View All Transactions</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.category &&
                          transaction.category.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {transaction.category[0]}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {transaction.pending && (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/transactions">View All Transactions</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Detailed spending by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <CategoryBarChart data={chartData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
