"use client";
import React, { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Download,
  MapPin,
  Package,
  AlertCircle,
  LayoutDashboard,
  X,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const COLORS = ["#005eb8", "#e6192e", "#059669", "#d97706", "#7c3aed"];

export default function InsightsPage() {
  const { logs, loading } = useTracker();

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [causeFilter, setCauseFilter] = useState("all");

  // Custom Date Range States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- 1. CUSTOM DATE RANGE ENGINE ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search Logic
      const matchesSearch =
        log.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date Range Logic
      const logDate = new Date(log.created_at);
      logDate.setHours(0, 0, 0, 0); // Normalize for day-only comparison

      let matchesDate = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && logDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && logDate <= end;
      }

      // Cause Filtering
      const matchesCause =
        causeFilter === "all" || log.root_cause === causeFilter;

      return matchesSearch && matchesDate && matchesCause;
    });
  }, [logs, searchTerm, startDate, endDate, causeFilter]);

  // --- 2. DATA AGGREGATION ---
  const analytics = useMemo(() => {
    const causeObj = filteredLogs.reduce((acc: any, log) => {
      acc[log.root_cause] = (acc[log.root_cause] || 0) + 1;
      return acc;
    }, {});

    const brandObj = filteredLogs.reduce((acc: any, log) => {
      acc[log.brand] = (acc[log.brand] || 0) + 1;
      return acc;
    }, {});

    const storeObj = filteredLogs.reduce((acc: any, log) => {
      acc[log.store] = (acc[log.store] || 0) + 1;
      return acc;
    }, {});

    return {
      causes: Object.entries(causeObj).map(([name, value]) => ({
        name,
        value,
      })),
      brands: Object.entries(brandObj)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5),
      stores: Object.entries(storeObj)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [filteredLogs]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pepsi-blue/10 border-t-pepsi-blue rounded-full animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-10">
      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-400 hover:text-white transition-all shadow-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-pepsi-blue mb-1">
              <LayoutDashboard size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Management Suite
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Market <span className="text-pepsi-blue">Intelligence</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-pepsi-blue text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-3 shadow-lg shadow-pepsi-blue/20"
        >
          <Download size={16} /> Print Report
        </button>
      </header>

      {/* ADVANCED FILTER BAR */}
      <section className="max-w-[1400px] mx-auto space-y-4 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/40 p-5 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md items-center">
          {/* SEARCH */}
          <div className="lg:col-span-4 relative">
            <Search
              className="absolute left-4 top-4 text-slate-600"
              size={18}
            />
            <input
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-xs font-bold outline-none focus:border-pepsi-blue transition-all"
              placeholder="Store, Brand, or Logger..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* DATE PICKERS */}
          <div className="lg:col-span-5 flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
            <div className="relative flex-1">
              <input
                type="date"
                className="w-full bg-transparent p-2 pl-8 text-[10px] font-black uppercase outline-none text-slate-300"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar
                className="absolute left-2 top-2.5 text-slate-600"
                size={14}
              />
            </div>
            <ArrowRight size={14} className="text-slate-700" />
            <div className="relative flex-1">
              <input
                type="date"
                className="w-full bg-transparent p-2 pl-8 text-[10px] font-black uppercase outline-none text-slate-300"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar
                className="absolute left-2 top-2.5 text-slate-600"
                size={14}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="p-2 text-slate-500 hover:text-pepsi-red transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* CAUSE FILTER */}
          <div className="lg:col-span-3 relative">
            <Filter
              className="absolute left-4 top-4 text-slate-600"
              size={18}
            />
            <select
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-xs font-bold appearance-none outline-none focus:border-pepsi-blue cursor-pointer"
              value={causeFilter}
              onChange={(e) => setCauseFilter(e.target.value)}
            >
              <option value="all">All Root Causes</option>
              <option value="In Backstock">In Backstock</option>
              <option value="Warehouse OOS">Warehouse OOS</option>
              <option value="Ordering Error">Ordering Error</option>
              <option value="Delivery Delayed">Delivery Delayed</option>
            </select>
          </div>
        </div>
      </section>

      {/* KPI METRICS */}
      <section className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Records Found"
          value={filteredLogs.length}
          icon={<AlertCircle size={16} />}
          color="text-pepsi-blue"
        />
        <StatCard
          title="Targeted Stores"
          value={new Set(filteredLogs.map((l) => l.store)).size}
          icon={<MapPin size={16} />}
          color="text-emerald-500"
        />
        <StatCard
          title="Volatile Brand"
          value={analytics.brands[0]?.name || "N/A"}
          icon={<Package size={16} />}
          color="text-pepsi-red"
        />
        <StatCard
          title="Date Coverage"
          value={startDate && endDate ? "Custom Range" : "All Time"}
          icon={<Calendar size={16} />}
          color="text-amber-500"
        />
      </section>

      {/* CHARTS GRID */}
      <section className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] h-[450px] shadow-2xl flex flex-col">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
            Root Cause Breakdown
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.causes}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {analytics.causes.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "16px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] h-[450px] shadow-2xl flex flex-col">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
            Top 5 SKU Risk Exposure
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.brands}>
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={10}
                  fontWeight="black"
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
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "none",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#005eb8" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CRITICAL STORE RANKINGS */}
      <section className="max-w-[1400px] mx-auto bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
        <h3 className="text-xl font-black uppercase tracking-tighter italic mb-10">
          High-Volume <span className="text-pepsi-red">Stores</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.stores.length > 0 ? (
            analytics.stores.map(([store, count]: any) => (
              <div
                key={store}
                className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pepsi-red/10 rounded-2xl flex items-center justify-center text-pepsi-red border border-pepsi-red/20 group-hover:scale-110 transition-transform">
                    <MapPin size={20} />
                  </div>
                  <p className="text-sm font-black text-white uppercase">
                    {store}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {count}
                  </p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase">
                    Incidents
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">
              No results match the current date range
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl hover:bg-slate-800/50 transition-colors">
      <div
        className={`w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center mb-4 ${color} border border-slate-800`}
      >
        {icon}
      </div>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h4 className="text-lg font-black text-white tracking-tighter truncate">
        {value}
      </h4>
    </div>
  );
}
