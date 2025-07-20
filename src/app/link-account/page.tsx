"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import { plaidApi } from "@/lib/api";
import { ExchangeTokenResponse, PlaidAccount } from "@/types";
import Link from "next/link";

export default function LinkAccountPage() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ExchangeTokenResponse | null>(null);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    createLinkToken();
    fetchAccounts();
  }, []);

  const createLinkToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plaidApi.createLinkToken();
      setLinkToken(response.link_token);
    } catch (err) {
      console.error("Error creating link token:", err);
      setError("Failed to initialize card linking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await plaidApi.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const onSuccess = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await plaidApi.exchangePublicToken(publicToken);
      setSuccess(response);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/");
      }, 3000);

      await fetchAccounts(); // Refresh accounts list
    } catch (err) {
      console.error("Error exchanging token:", err);
      setError("Failed to link credit card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onExit = (err: any, metadata: any) => {
    if (err != null) {
      setError(
        "Credit card linking was cancelled or failed. Please try again."
      );
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  const handleLinkAccount = () => {
    if (ready) {
      open();
    }
  };

  const handleSyncAccounts = async () => {
    setSyncing(true);
    try {
      await plaidApi.syncTransactions();
      await fetchAccounts(); // Refresh accounts list
    } catch (error) {
      console.error("Error syncing accounts:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Credit Card Linked Successfully!
            </CardTitle>
            <CardDescription>
              Your credit card has been successfully connected to your expense
              tracker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Linked Cards:
                </h3>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-gray-600">
                          {account.mask} • {account.type}
                        </p>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                You'll be redirected to the dashboard in a few seconds...
              </p>
              <Button asChild>
                <Link href="/">Go to Dashboard Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Link Your Credit Card
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect your credit card to automatically track your spending
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Connect Your Card
            </CardTitle>
            <CardDescription>
              Securely link your credit card using Plaid's trusted platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Bank-Level Security
                  </p>
                  <p className="text-sm text-blue-700">
                    Your credentials are never stored and are protected by
                    bank-level encryption
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Automatic transaction syncing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Real-time spending tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Categorized spending insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Secure, read-only access
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleLinkAccount}
              disabled={!ready || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing...
                </>
              ) : (
                "Link Credit Card"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Credit Cards</CardTitle>
              <CardDescription>
                Connect cards from major banks and credit unions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Chase Credit Cards
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  American Express
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Capital One
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Citi Credit Cards
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Discover
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Bank of America
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  And thousands more...
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security & Privacy</CardTitle>
              <CardDescription>
                Your financial data is protected with industry-leading security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Bank-Level Encryption</p>
                  <p className="text-gray-600">
                    All data is encrypted using 256-bit SSL
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Read-Only Access</p>
                  <p className="text-gray-600">
                    We can only view your transactions, never modify them
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">No Credential Storage</p>
                  <p className="text-gray-600">
                    Your card credentials are never stored on our servers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sync Transactions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Sync Transactions
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Manually sync transactions from your linked credit cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Sync Latest Transactions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Import the most recent transactions from all linked cards
                </p>
              </div>
            </div>
            <Button
              onClick={handleSyncAccounts}
              disabled={syncing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>{syncing ? "Syncing..." : "Sync Now"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Linked Credit Cards
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your currently connected credit cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No credit cards linked yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Link your first credit card to start tracking expenses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.mask} • {account.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
