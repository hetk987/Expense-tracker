"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { CategoryData } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryBarChartProps {
  data: CategoryData[];
  title?: string;
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
  "#F43F5E",
  "#A855F7",
  "#0EA5E9",
  "#22C55E",
];

export default function CategoryBarChart({
  data,
  title = "Spending by Category",
}: CategoryBarChartProps) {
  // Handle undefined or null data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: "Amount ($)",
        data: data.map((item) => Math.abs(item.amount)),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: COLORS.slice(0, data.length).map((color) => color + "80"),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor:
          typeof window !== "undefined" &&
          document.documentElement.classList.contains("dark")
            ? "#1f2937"
            : "#ffffff",
        titleColor:
          typeof window !== "undefined" &&
          document.documentElement.classList.contains("dark")
            ? "#f9fafb"
            : "#111827",
        bodyColor:
          typeof window !== "undefined" &&
          document.documentElement.classList.contains("dark")
            ? "#d1d5db"
            : "#374151",
        borderColor:
          typeof window !== "undefined" &&
          document.documentElement.classList.contains("dark")
            ? "#374151"
            : "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `$${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Category",
        },
        grid: {
          display: false,
        },
        ticks: {
          color:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#9ca3af"
              : "#6b7280",
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Amount ($)",
        },
        grid: {
          color:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#374151"
              : "#e5e7eb",
        },
        ticks: {
          color:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#9ca3af"
              : "#6b7280",
          callback: function (value: any) {
            return "$" + value.toFixed(0);
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
