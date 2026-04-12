"use client";
import React, { useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  PackageCheck,
  Target,
  CheckCircle2,
} from "lucide-react";

export default function Insights() {
  const { logs } = useTracker();

  const data = useMemo(() => {
    if (logs.length === 0) return null;

    // --- 1. SKU Frequency Analysis (Bar Chart) ---
    const productCounts: Record<string, number> = {};
    logs.forEach(
      (l) => (productCounts[l.product] = (productCounts[l.product] || 0) + 1),
    );
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- 2. Verified Cause Distribution (Pie Chart) ---
    const causeCounts: Record<string, number> = {};
    logs.forEach(
      (l) => (causeCounts[l.root_cause] = (causeCounts[l.root_cause] || 0) + 1),
    );
    const causeData = Object.entries(causeCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // --- 3. 7-Day Velocity Trend (Line Chart) ---
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString("en-US", { weekday: "short" });
      })
      .reverse();

    const trendData = last7Days.map((day) => {
      const count = logs.filter((log) => {
        const logDay = new Date(log.created_at).toLocaleDateString("en-US", {
          weekday: "short",
        });
        return logDay === day;
      }).length;
      return { day, count };
    });

    return {
      topProducts,
      causeData,
      trendData,
      total: logs.length,
      topItem: topProducts[0],
    };
  }, [logs]);

  const COLORS = ["#005cb4", "#e31837", "#f59e0b", "#10b981", "#6366f1"];

  if (!data)
    return (
      <div className="p-20 text-center bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed text-slate-500 uppercase font-black text-xs tracking-widest">
        Awaiting Data Stream for 7-Day Analysis...
      </div>
    );

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <TrendingUp className="text-pepsi-blue mb-4" size={24} />
          <p className="text-4xl font-black text-white">{data.total}</p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            Route Exceptions
          </p>
        </div>

        <div className="bg-pepsi-red/10 border border-pepsi-red/20 p-8 rounded-[2.5rem] shadow-xl">
          <AlertTriangle className="text-pepsi-red mb-4" size={24} />
          <p className="text-xl font-black text-white uppercase truncate">
            {data.topItem.name}
          </p>
          <p className="text-[10px] font-black text-pepsi-red uppercase tracking-widest mt-1">
            Critical Loss Risk
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-xl">
          <PackageCheck className="text-emerald-500 mb-4" size={24} />
          <p className="text-4xl font-black text-white">
            {(
              (logs.filter((l) => l.priority !== "Critical").length /
                data.total) *
              100
            ).toFixed(0)}
            %
          </p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
            Shelf Health Index
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 7-Day Velocity Trend */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">
              7-Day Outage Velocity
            </h3>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-black tracking-tighter">
              LIVE TREND
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "900",
                  }}
                  itemStyle={{ color: "#005cb4" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#005cb4"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#005cb4",
                    strokeWidth: 2,
                    stroke: "#0f172a",
                  }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cause Distribution (Donut) */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">
            Verified Root Causes
          </h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.causeData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {data.causeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">
                {data.total}
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                Total Analysis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prevention Strategy Logic */}
      <div className="bg-pepsi-blue/5 border border-pepsi-blue/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="p-4 bg-pepsi-blue rounded-3xl shadow-lg shadow-blue-900/40">
          <Target className="text-white" size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-1">
            Preventative Mitigation Strategy
          </h4>
          <p className="text-slate-400 text-sm font-medium">
            Data confirms{" "}
            <span className="text-white font-bold">{data.topItem.name}</span> is
            the primary driver of shelf gaps. Suggested: Adjust next delivery
            par by{" "}
            <span className="text-emerald-400 font-black">
              +{((data.topItem.count / data.total) * 50).toFixed(0)}%
            </span>{" "}
            to prevent recurring outages.
          </p>
        </div>
      </div>
    </div>
  );
}
