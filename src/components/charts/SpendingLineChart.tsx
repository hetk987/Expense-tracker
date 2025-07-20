"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { TimeSeriesData } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpendingLineChartProps {
  data: TimeSeriesData[];
  title?: string;
}

export default function SpendingLineChart({
  data,
  title = "Spending Over Time",
}: SpendingLineChartProps) {
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
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Daily Spending",
        data: data.map((item) => Math.abs(item.amount)),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#EF4444",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color:
            typeof window !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#e5e7eb"
              : "#374151",
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
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
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
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
