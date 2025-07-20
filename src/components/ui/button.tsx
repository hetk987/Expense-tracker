import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<
  HTMLDivElement | HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClasses = {
      default:
        "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200",
      link: "text-primary-600 underline-offset-4 hover:underline dark:text-primary-400",
    };

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild) {
      return (
        <div
          className={classes}
          ref={ref as React.Ref<HTMLDivElement>}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </div>
      );
    }

    return (
      <button
        className={classes}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
