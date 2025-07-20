"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, BarChart3, Plus, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Transactions", href: "/transactions", icon: CreditCard },
    { name: "Link Card", href: "/link-account", icon: Plus },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Credit Tracker
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
