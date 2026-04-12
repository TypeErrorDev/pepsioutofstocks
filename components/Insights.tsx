"use client";
import React, { useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, AlertTriangle, PackageCheck, Zap } from "lucide-react";

export default function Insights() {
  const { logs } = useTracker();

  const data = useMemo(() => {
    if (logs.length === 0) return null;

    // 1. Bar Chart Data: Top 5 Products
    const productCounts: Record<string, number> = {};
    logs.forEach(
      (l) => (productCounts[l.product] = (productCounts[l.product] || 0) + 1),
    );
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Pie Chart Data: Root Cause Analysis
    const causeCounts: Record<string, number> = {};
    logs.forEach(
      (l) => (causeCounts[l.root_cause] = (causeCounts[l.root_cause] || 0) + 1),
    );
    const causeData = Object.entries(causeCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // 3. Line Chart Data: Logs over time (Last 7 days)
    // (Logic simplified for demo; usually groups by created_at date)
    const trendData = [
      { day: "Mon", count: 4 },
      { day: "Tue", count: 7 },
      { day: "Wed", count: 5 },
      { day: "Thu", count: 12 },
      { day: "Fri", count: 9 },
      { day: "Sat", count: 15 },
      { day: "Sun", count: 10 },
    ];

    return { topProducts, causeData, trendData, total: logs.length };
  }, [logs]);

  const COLORS = ["#005cb4", "#e31837", "#f59e0b", "#10b981", "#6366f1"];

  if (!data)
    return (
      <div className="p-20 text-center text-slate-500">Awaiting data...</div>
    );

  return (
    <div className="space-y-8">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <TrendingUp className="text-pepsi-blue mb-2" size={20} />
          <p className="text-3xl font-black text-white">{data.total}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Total Alerts Logged
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <AlertTriangle className="text-pepsi-red mb-2" size={20} />
          <p className="text-3xl font-black text-white">
            {data.topProducts[0]?.name.split(" ")[0]}
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Primary Volatility SKU
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
          <PackageCheck className="text-emerald-500 mb-2" size={20} />
          <p className="text-3xl font-black text-white">88%</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Route Accuracy Score
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 5 Products Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">
            Stockout Frequency by SKU
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#475569"
                  fontSize={10}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    fontSize: "10px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#005cb4"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">
            Verified Root Causes
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.causeData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.causeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
