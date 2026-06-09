"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTracker, type StockoutLog } from "@/context/TrackerContext";
import { supabase } from "@/lib/supabase";
import { isManagement } from "@/lib/permissions";
import { formatPST } from "@/lib/format";
import type { PromoCalendarRow } from "@/lib/analytics";
import InsightsAnalytics from "@/components/InsightsAnalytics";
import {
  Search,
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  Circle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

type TimeModeType = "rolling" | "custom";
type TimeRangeType = "days" | "weeks" | "months" | "quarters" | "years";
type StatusFilterType = "all" | "open" | "resolved";

export default function InsightsPage() {
  const { logs, profile, loading, toggleWorkedStatus } = useTracker();

  // Filter Configuration States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<TimeModeType>("rolling");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

  // Rolling Mode States
  const [timeValue, setTimeValue] = useState<number>(14);
  const [timeUnit, setTimeUnit] = useState<TimeRangeType>("days");

  // Custom Date States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogModal, setSelectedLogModal] = useState<StockoutLog | null>(
    null,
  );

  // Closeout Reason Sub-Modal States
  const [reasonModalId, setReasonModalId] = useState<string | null>(null);
  const [validationReason, setValidationReason] = useState("");

  // Promo calendar for the promo-impact analytics. Loaded here (not in the
  // shared TrackerContext) so the live auth/logging path stays untouched, and
  // failures degrade gracefully to an empty list.
  const [promos, setPromos] = useState<PromoCalendarRow[]>([]);

  const itemsPerPage = 10;

  const userIsManagement = isManagement(profile);

  useEffect(() => {
    if (!userIsManagement) return;
    let active = true;
    supabase
      .from("promo_calendar")
      .select("*")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to load promo calendar:", error);
          return;
        }
        setPromos((data as PromoCalendarRow[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [userIsManagement]);

  useEffect(() => {
    if (selectedLogModal || reasonModalId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedLogModal, reasonModalId]);

  const currentModalData = useMemo(() => {
    if (!selectedLogModal) return null;
    return logs.find((l) => l.id === selectedLogModal.id) || selectedLogModal;
  }, [selectedLogModal, logs]);

  const parseObservationLedger = (notes: string) => {
    const reverifyNotes = Array.from(
      notes.matchAll(/\[Re-verified Note:\s*([^\]]+)\]/gi),
      (match) => match[1].trim(),
    ).filter(Boolean);

    if (reverifyNotes.length > 0) {
      return reverifyNotes;
    }

    return notes
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleConfirmValidation = async () => {
    if (!reasonModalId) return;
    try {
      const targetLog = logs.find((l) => l.id === reasonModalId);
      if (!targetLog) return;

      await toggleWorkedStatus(
        reasonModalId,
        targetLog.is_worked,
        validationReason,
      );
      setReasonModalId(null);
      setValidationReason("");
    } catch (err) {
      console.error("Validation confirmation exception:", err);
    }
  };

  // --- MULTI-LEVEL FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    let data = logs.filter((log) => !log.is_hidden);

    if (!userIsManagement) {
      data = data.filter((log) => log.user_name === profile?.full_name);
    }

    if (statusFilter === "open") {
      data = data.filter((log) => !log.is_worked);
    } else if (statusFilter === "resolved") {
      data = data.filter((log) => log.is_worked);
    }

    if (searchQuery.trim() !== "") {
      data = data.filter((log) =>
        log.store.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      );
    }

    if (filterMode === "rolling") {
      if (timeValue && timeValue > 0) {
        const now = new Date();
        const cutoff = new Date(now);

        switch (timeUnit) {
          case "days":
            cutoff.setDate(now.getDate() - timeValue);
            break;
          case "weeks":
            cutoff.setDate(now.getDate() - timeValue * 7);
            break;
          case "months":
            cutoff.setMonth(now.getMonth() - timeValue);
            break;
          case "quarters":
            cutoff.setMonth(now.getMonth() - timeValue * 3);
            break;
          case "years":
            cutoff.setFullYear(now.getFullYear() - timeValue);
            break;
        }
        data = data.filter(
          (log) => new Date(log.last_verified_at || log.created_at) >= cutoff,
        );
      }
    } else {
      if (startDate) {
        const startBounds = new Date(startDate);
        startBounds.setHours(0, 0, 0, 0);
        data = data.filter((log) => new Date(log.created_at) >= startBounds);
      }
      if (endDate) {
        const endBounds = new Date(endDate);
        endBounds.setHours(23, 59, 59, 999);
        data = data.filter((log) => new Date(log.created_at) <= endBounds);
      }
    }

    return data;
  }, [
    logs,
    profile,
    userIsManagement,
    searchQuery,
    filterMode,
    statusFilter,
    timeValue,
    timeUnit,
    startDate,
    endDate,
  ]);

  // --- ACCOUNT VELOCITY RANKINGS ---
  const storeRankings = useMemo(() => {
    const storeMap: Record<
      string,
      { name: string; distinctGaps: number; trackingImpact: number }
    > = {};

    filteredLogs.forEach((log) => {
      if (!storeMap[log.store]) {
        storeMap[log.store] = {
          name: log.store,
          distinctGaps: 0,
          trackingImpact: 0,
        };
      }
      storeMap[log.store].distinctGaps++;
      storeMap[log.store].trackingImpact += log.verification_count || 1;
    });

    return Object.values(storeMap).sort(
      (a, b) => b.trackingImpact - a.trackingImpact,
    );
  }, [filteredLogs]);

  // --- PAGINATION COMPUTATIONS ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentLogs = useMemo(() => {
    return filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredLogs, indexOfFirstItem, indexOfLastItem]);

  // Reset to the first page whenever the active filter set changes. Using the
  // "adjust state during render" pattern (per the React docs) instead of an
  // effect avoids an extra render pass and the set-state-in-effect lint rule.
  const filterKey = [
    searchQuery,
    filterMode,
    statusFilter,
    timeValue,
    timeUnit,
    startDate,
    endDate,
  ].join("|");
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

  // Early returns live below every hook so the hook order stays identical on
  // every render (React's rules-of-hooks). Returning above the hooks above would
  // crash with "rendered more hooks than during the previous render".
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-app-bg text-app-text">
        <p className="text-sm text-app-muted uppercase tracking-[0.3em] font-black">
          Loading Insights...
        </p>
      </div>
    );
  }

  if (!profile || !userIsManagement) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-app-bg text-app-text">
        <div className="max-w-xl w-full bg-app-card border border-app-border rounded-3xl shadow-2xl p-10 text-center">
          <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-4">
            Access Denied
          </h1>
          <p className="text-sm text-app-muted mb-6">
            Insights are only available to elevated users.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-pepsi-blue px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10 text-slate-100 bg-slate-950 min-h-screen">
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none !important;
          -webkit-appearance: none !important;
        }
        input[type="date"]::-moz-calendar-picker-indicator {
          display: none !important;
          appearance: none !important;
        }
        input[type="date"] {
          position: relative;
        }
      `}</style>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-pepsi-blue text-xs font-black uppercase tracking-[0.3em] hover:opacity-70 mb-2"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Shelf<span className="text-blue-600">Health</span> Analytics
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Operator: {profile?.full_name || "Unknown"} | Access:{" "}
            {profile?.role?.toUpperCase()}
          </p>
        </div>
      </header>

      {/* CONTROL INPUT ENGINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
            <SlidersHorizontal size={14} className="text-blue-500" />
            <span>Query Configuration Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg cursor-pointer ${statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-500"}`}
              >
                All Logs
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("open")}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg cursor-pointer ${statusFilter === "open" ? "bg-amber-600/20 text-amber-400" : "text-slate-500"}`}
              >
                Open Gaps
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("resolved")}
                className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg cursor-pointer ${statusFilter === "resolved" ? "bg-emerald-600/20 text-emerald-400" : "text-slate-500"}`}
              >
                Resolved
              </button>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode("rolling")}
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg cursor-pointer ${filterMode === "rolling" ? "bg-blue-600 text-white" : "text-slate-500"}`}
              >
                Rolling Window
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("custom")}
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg cursor-pointer ${filterMode === "custom" ? "bg-blue-600 text-white" : "text-slate-500"}`}
              >
                Custom Dates
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 relative flex flex-col justify-end">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
              Store Account Filter
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTER BY STORE NUMBER..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3.5 text-xs text-slate-200 font-bold uppercase"
              />
            </div>
          </div>

          {filterMode === "rolling" ? (
            <>
              <div className="lg:col-span-3 flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Magnitude
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    min={1}
                    value={timeValue || ""}
                    onChange={(e) =>
                      setTimeValue(parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-xs text-slate-200 font-black"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-60 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setTimeValue((p) => (p || 0) + 1)}
                      className="p-0.5 text-slate-500 hover:text-blue-500 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTimeValue((p) => Math.max(1, (p || 0) - 1))
                      }
                      className="p-0.5 text-slate-500 hover:text-blue-500 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Scale Unit
                </label>
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as TimeRangeType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-400 font-black uppercase"
                >
                  <option value="days">Rolling Days</option>
                  <option value="weeks">Rolling Weeks</option>
                  <option value="months">Rolling Months</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-3 relative flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Timeline Start
                </label>
                <input
                  type="date"
                  value={startDate}
                  onFocus={(e) => e.target.showPicker()}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 font-bold uppercase cursor-pointer"
                />
              </div>
              <div className="lg:col-span-4 relative flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Timeline End
                </label>
                <input
                  type="date"
                  value={endDate}
                  onFocus={(e) => e.target.showPicker()}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 font-bold uppercase cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* AT-A-GLANCE ANALYTICS (clickable tiles -> charted modals) */}
      <InsightsAnalytics logs={filteredLogs} promos={promos} />

      {/* VELOCITY LEDGER CORES */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Store Outage Velocity Index (Highest Total Visibility Gaps First)
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-950 max-h-96 overflow-y-auto custom-scrollbar">
          {storeRankings.map((store, idx) => (
            <div
              key={store.name}
              onClick={() => setSearchQuery(store.name)}
              className="p-5 flex items-center justify-between hover:bg-slate-950/60 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-600 w-6 font-mono">
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-sm font-black text-white uppercase">
                    Store #{store.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                    {store.distinctGaps} Unresolved Items Missing Across
                    displays
                  </p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-[9px] font-black bg-slate-950 text-slate-400 border border-slate-800">
                {store.trackingImpact} Aggregated Outage Days
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MASTER DATA GRID MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xs font-black uppercase italic text-slate-300">
              Query Index Feed
            </h3>
            <span className="text-[8px] font-bold text-slate-500 uppercase">
              {filteredLogs.length} Distinct Item Tracks Open
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 disabled:opacity-20"
            >
              ◀
            </button>
            <span className="text-[10px] font-black text-slate-500 px-2 min-w-10 text-center font-mono">
              {currentPage}/{totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 text-slate-400 disabled:opacity-20"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800">
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest w-12 text-center">
                  Status
                </th>
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Last Verified
                </th>
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Store
                </th>
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Product Segment
                </th>
                <th className="p-4 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Streak Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {currentLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLogModal(log)}
                  className="hover:bg-slate-950/30 transition-colors cursor-pointer group"
                >
                  <td className="p-4 text-center">
                    {log.is_worked ? (
                      <CheckCircle
                        size={16}
                        className="text-emerald-500 mx-auto"
                      />
                    ) : (
                      <Circle size={16} className="text-slate-700 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-xs font-bold text-slate-400 uppercase">
                    {formatPST(log.last_verified_at || log.created_at, {
                      withYear: true,
                    })}
                  </td>
                  <td className="p-4 font-black text-xs text-blue-500 flex items-center gap-1.5">
                    <MapPin size={12} />
                    {log.store}
                  </td>
                  <td className="p-4 font-black text-xs uppercase text-slate-200">
                    {log.product}{" "}
                    <span className="text-slate-500 font-bold ml-1">
                      {log.pack_type}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-mono font-black border ${(log.verification_count || 1) > 3 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                    >
                      {log.verification_count || 1}x Days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL DOWN DETAILED MODAL SCREEN */}
      {currentModalData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedLogModal(null)}
          />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase italic">
                  Store{" "}
                  <span className="text-blue-500">
                    {currentModalData.store}
                  </span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase">
                  Audit Track History
                </p>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
              >
                ✕
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block font-black text-[8px] uppercase">
                      Product Name
                    </span>
                    <span className="text-sm font-black text-slate-200 uppercase">
                      {currentModalData.product} {currentModalData.pack_type}
                    </span>
                  </div>
                  {userIsManagement && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentModalData.is_worked) {
                          toggleWorkedStatus(currentModalData.id, true);
                        } else {
                          setReasonModalId(currentModalData.id);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer ${currentModalData.is_worked ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}
                    >
                      {currentModalData.is_worked
                        ? "✓ Open Issue"
                        : "Validate & Close"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500 block font-black text-[8px] uppercase">
                      First Logged
                    </span>
                    <span className="font-bold text-slate-300">
                      {formatPST(currentModalData.created_at, {
                        withYear: true,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-black text-[8px] uppercase">
                      Last Re-Verified
                    </span>
                    <span className="font-bold text-slate-300">
                      {formatPST(
                        currentModalData.last_verified_at ||
                          currentModalData.created_at,
                        { withYear: true },
                      )}
                    </span>
                  </div>
                </div>

                {currentModalData.notes && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 space-y-3">
                    <span className="text-slate-500 block font-black text-[7px] uppercase tracking-[0.2em]">
                      Observations Feed Ledger
                    </span>
                    {parseObservationLedger(currentModalData.notes).map(
                      (entry, index) => (
                        <p
                          key={index}
                          className="text-[11px] leading-snug text-slate-300"
                        >
                          {entry}
                        </p>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASON SUB-MODAL */}
      {reasonModalId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setReasonModalId(null);
              setValidationReason("");
            }}
          />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2rem] p-6 space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic">
              Validate & Close Gap
            </h3>
            <textarea
              autoFocus
              value={validationReason}
              onChange={(e) => setValidationReason(e.target.value)}
              placeholder="Enter resolution actions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 min-h-[100px] font-bold"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setReasonModalId(null);
                  setValidationReason("");
                }}
                className="flex-1 py-3 bg-slate-950 text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmValidation}
                className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
