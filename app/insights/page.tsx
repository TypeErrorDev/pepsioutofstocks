"use client";
import React, { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Search,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Package,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  const { logs, loading } = useTracker();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatPST = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Combined Filter Logic: Store Search + Date Range
  const filteredLogs = useMemo(() => {
    let results = logs.filter((l) => !l.is_hidden);

    // Filter by Store
    if (searchQuery.trim()) {
      results = results.filter((l) =>
        l.store.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by Start Date
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      results = results.filter((l) => new Date(l.created_at) >= start);
    }

    // Filter by End Date
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      results = results.filter((l) => new Date(l.created_at) <= end);
    }

    return results;
  }, [logs, searchQuery, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const worked = filteredLogs.filter((l) => l.is_worked).length;
    const pending = total - worked;
    return { total, worked, pending };
  }, [filteredLogs]);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <p className="text-[10px] font-black text-app-muted uppercase tracking-[0.3em] animate-pulse">
          Syncing Market Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-8">
      {/* --- HEADER --- */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-pepsi-blue text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity mb-2"
          >
            <ArrowLeft size={12} /> Back to Command
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-app-text">
            Market <span className="text-pepsi-blue">Insights</span>
          </h1>
        </div>

        {/* --- FILTER CONTROLS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:max-w-3xl">
          {/* Store Search */}
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted group-focus-within:text-pepsi-blue transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="STORE #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-app-text uppercase tracking-widest focus:outline-none focus:border-pepsi-blue transition-all shadow-lg"
            />
          </div>

          {/* Start Date */}
          <div className="relative group">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted"
              size={16}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-app-text uppercase focus:outline-none focus:border-pepsi-blue transition-all shadow-lg"
            />
          </div>

          {/* End Date */}
          <div className="relative group">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted"
              size={16}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-app-card border border-app-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-app-text uppercase focus:outline-none focus:border-pepsi-blue transition-all shadow-lg"
            />
          </div>
        </div>
      </header>

      {/* --- RESET ACTION --- */}
      {(searchQuery || startDate || endDate) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-[9px] font-black text-pepsi-red uppercase tracking-widest hover:underline"
        >
          <X size={12} /> Clear Active Filters
        </button>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-app-card border border-app-border p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-app-muted uppercase tracking-widest mb-1">
            In-Scope Logs
          </p>
          <h3 className="text-4xl font-black text-app-text italic tracking-tighter">
            {stats.total}
          </h3>
        </div>
        <div className="bg-app-card border border-app-border p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-app-muted uppercase tracking-widest mb-1">
            Resolved
          </p>
          <h3 className="text-4xl font-black text-emerald-500 italic tracking-tighter">
            {stats.worked}
          </h3>
        </div>
        <div className="bg-app-card border border-app-border p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-app-muted uppercase tracking-widest mb-1">
            Unresolved Gaps
          </p>
          <h3 className="text-4xl font-black text-pepsi-red italic tracking-tighter">
            {stats.pending}
          </h3>
        </div>
      </div>

      {/* --- RESULTS FEED --- */}
      <main className="bg-app-card border border-app-border rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-app-bg/30 border-b border-app-border">
                <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">
                  Store
                </th>
                <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">
                  Product Details
                </th>
                <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest text-right">
                  Status
                </th>
                <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest text-right">
                  Logged At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/30">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-app-bg/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-pepsi-blue" />
                        <span className="text-xs font-black text-app-text/90">
                          #{log.store}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-app-text uppercase">
                          {log.brand}
                        </span>
                        <span className="text-[10px] font-bold text-app-muted uppercase">
                          {log.pack_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {log.is_worked ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                            <CheckCircle2 size={10} /> Worked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-black text-pepsi-red uppercase">
                            <AlertCircle size={10} /> Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-app-muted uppercase">
                        <Clock size={10} /> {formatPST(log.created_at)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Package
                      size={32}
                      className="mx-auto text-app-muted/20 mb-4"
                    />
                    <p className="text-xs font-black text-app-muted uppercase tracking-widest">
                      No matching records found for this criteria
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
