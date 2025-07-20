import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-primary-600 text-white dark:bg-primary-600 dark:text-white",
    secondary: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    destructive: "bg-red-600 text-white dark:bg-red-600 dark:text-white",
    outline:
      "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
