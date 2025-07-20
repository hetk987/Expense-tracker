"use client";

import { useState, useEffect } from "react";
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
import CategoryBarChart from "@/components/charts/CategoryBarChart";
import SpendingLineChart from "@/components/charts/SpendingLineChart";
import {
  CreditCard,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { plaidApi } from "@/lib/api";
import { PlaidTransaction, PlaidAccount, TransactionFilters } from "@/types";
import {
  formatCurrency,
  formatDate,
  getCurrentMonthRange,
  getLast30DaysRange,
} from "@/lib/utils";
import {
  processCategoryData,
  processTimeSeriesData,
  calculateCreditCardMetrics,
  getAvailableCategories,
} from "@/lib/chartUtils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 50,
    offset: 0,
    ...getCurrentMonthRange(),
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [chartView, setChartView] = useState<"pie" | "bar" | "line">("pie");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData] = await Promise.all([
        plaidApi.getTransactions(filters),
        plaidApi.getAccounts(),
      ]);
      setTransactions(transactionsData.transactions);
      setPagination({
        total: transactionsData.total,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });
      setAccounts(accountsData);

      // Get all transactions for category analysis (without pagination)
      const allTransactionsData = await plaidApi.getTransactions({
        ...filters,
        limit: 1000,
        offset: 0,
      });
      setAvailableCategories(
        getAvailableCategories(allTransactionsData.transactions)
      );
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTransactions = async () => {
    try {
      setSyncing(true);
      await plaidApi.syncTransactions();
      await loadData();
    } catch (error) {
      console.error("Error syncing transactions:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleFilterChange = (
    key: keyof TransactionFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const calculatedCurrentPage =
    Math.floor(pagination.offset / pagination.limit) + 1;

  const creditCardMetrics = calculateCreditCardMetrics(transactions);
  const categoryData = processCategoryData(transactions);
  const timeSeriesData = processTimeSeriesData(
    transactions,
    filters.startDate || getCurrentMonthRange().startDate,
    filters.endDate || getCurrentMonthRange().endDate
  );

  const categories = [
    "all",
    ...Array.from(
      new Set(transactions.flatMap((t) => t.category || []).filter(Boolean))
    ),
  ];
  const paginatedTransactions = transactions.slice(
    (calculatedCurrentPage - 1) * itemsPerPage,
    calculatedCurrentPage * itemsPerPage
  );

  const totalSpending = transactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Credit Card Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and analyze your credit card spending
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCharts(!showCharts)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showCharts ? (
              <CreditCard className="h-4 w-4" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {showCharts ? "Hide Charts" : "Show Charts"}
          </Button>
          <Button
            onClick={handleSyncTransactions}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Transactions"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactions.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {transactions.length} of {pagination.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalSpending)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Transaction
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                transactions.length > 0
                  ? totalSpending / transactions.length
                  : 0
              )}
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
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                transactions.reduce(
                  (max, t) => Math.max(max, Math.abs(t.amount)),
                  0
                )
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Single purchase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {showCharts && (
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
              <CategoryPieChart data={categoryData} title="" />
            ) : (
              <CategoryBarChart data={categoryData} title="" />
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
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Filters
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Search and filter your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={String(category)} value={String(category)}>
                    {category === "all" ? "All Categories" : String(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-") as [
                  "date" | "amount" | "name",
                  "asc" | "desc"
                ];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="amount-desc">
                  Amount (High to Low)
                </SelectItem>
                <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Transaction History
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {paginatedTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                No transactions found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or sync your accounts to get the
                latest transactions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.account && (
                          <>
                            <span>•</span>
                            <span>{transaction.account.name}</span>
                          </>
                        )}
                      </div>
                      {transaction.merchantName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.merchantName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium text-lg ${
                        transaction.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {transaction.amount < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {transaction.pending && (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                      {transaction.category &&
                        transaction.category.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category[0]}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to{" "}
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(
                      Math.max(0, pagination.offset - pagination.limit)
                    )
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(pagination.offset + pagination.limit)
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
