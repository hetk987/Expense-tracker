"use client";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ChartOptions,
} from "chart.js";
import { CategoryData } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

interface CategoryPieChartProps {
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

export default function CategoryPieChart({
  data,
  title = "Spending by Category",
}: CategoryPieChartProps) {
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
        data: data.map((item) => Math.abs(item.amount)),
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#e5e7eb"
              : "#374151",
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
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
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
