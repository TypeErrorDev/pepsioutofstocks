"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Search,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FileSpreadsheet,
  MapPin,
  TrendingUp,
  Clock,
  Calendar,
  FilterX,
} from "lucide-react";
import Link from "next/link";

type TimeModeType = "rolling" | "custom";
type TimeRangeType = "days" | "weeks" | "months" | "quarters" | "years";

export default function InsightsPage() {
  const { logs, profile, loading } = useTracker();

  // Filter Configuration States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<TimeModeType>("rolling");

  // Rolling Mode States
  const [timeValue, setTimeValue] = useState<number>(14); // Defaults to your 14-day cycle
  const [timeUnit, setTimeUnit] = useState<TimeRangeType>("days");

  // Custom Date States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogModal, setSelectedLogModal] = useState<any | null>(null);

  const itemsPerPage = 10;

  const isAdmin = profile?.role === "admin";
  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  // Background page scrolling lock when drill-down modal is open
  useEffect(() => {
    if (selectedLogModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedLogModal]);

  // PST Formatting Helper
  const formatPST = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --- MULTI-LEVEL FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    let data = logs.filter((log) => !log.is_hidden);

    // 1. RBAC Scope Boundary
    if (!isManagement) {
      data = data.filter((log) => log.user_name === profile?.full_name);
    }

    // 2. Live Target Store Filter
    if (searchQuery.trim() !== "") {
      data = data.filter((log) =>
        log.store.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      );
    }

    // 3. Time Filter Application
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
        data = data.filter((log) => new Date(log.created_at) >= cutoff);
      }
    } else {
      // Custom Date Range Processing
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
    isManagement,
    searchQuery,
    filterMode,
    timeValue,
    timeUnit,
    startDate,
    endDate,
  ]);

  // --- ACCOUNT PRIORITY INDEX AGGREGATION ---
  const storeRankings = useMemo(() => {
    const storeMap: Record<
      string,
      { name: string; stockouts: number; gaps: number; total: number }
    > = {};

    filteredLogs.forEach((log) => {
      if (!storeMap[log.store]) {
        storeMap[log.store] = {
          name: log.store,
          stockouts: 0,
          gaps: 0,
          total: 0,
        };
      }
      if (
        log.root_cause === "Backstock" ||
        log.root_cause === "Item In Backstock"
      ) {
        storeMap[log.store].gaps++;
      } else {
        storeMap[log.store].stockouts++;
      }
      storeMap[log.store].total++;
    });

    return Object.values(storeMap).sort((a, b) => b.total - a.total);
  }, [filteredLogs]);

  // --- PAGINATION COMPUTATIONS ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentLogs = useMemo(() => {
    return filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredLogs, indexOfFirstItem, indexOfLastItem]);

  // Reset page position index on search parameters adjustment
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMode, timeValue, timeUnit, startDate, endDate]);

  // --- CLIENT SIDE SHEETJS COMPILER ---
  const handleExportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const cleanExportData = filteredLogs.map((log) => ({
        "Record ID": log.id,
        "Timestamp (PST)": formatPST(log.created_at),
        "Store Number": `${log.store}`,
        Brand: log.brand,
        Configuration: log.pack_type,
        "Root Cause Gaps": log.root_cause,
        "Audit Status": log.is_worked ? "Worked / Resolved" : "Open Status",
        "Auditor Identity": log.user_name || "System Operator",
        "Verification Authority": log.updated_by || "Unverified",
        "Field Notes": log.notes || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(cleanExportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ShelfHealth Data");

      worksheet["!cols"] = [
        { wch: 12 },
        { wch: 22 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 22 },
        { wch: 35 },
      ];

      XLSX.writeFile(
        workbook,
        `shelfhealth_report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (err) {
      console.error("Excel tracking generation fault:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] bg-slate-950 min-h-screen">
        Syncing Analytical Core...
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10 text-slate-100 bg-slate-950 min-h-screen">
      {/* HEADER SEGMENT */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-pepsi-blue text-xs font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity mb-2"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Shelf<span className="text-blue-600">Health</span> Analytics
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Operator: {profile?.full_name || "Unknown"} | Access Rank:{" "}
            {profile?.role?.toUpperCase() || "USER"}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleExportToExcel}
            className="group flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 px-6 py-4 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-300 shadow-xl cursor-pointer text-xs font-black uppercase tracking-wider"
          >
            <FileSpreadsheet
              size={18}
              className="animate-pulse group-hover:scale-110 transition-transform"
            />
            <span>Export Filtered Range (.XLSX)</span>
          </button>
        )}
      </header>

      {/* TACTICAL METRIC CONFIGURATION CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
            <SlidersHorizontal size={14} className="text-blue-500" />
            <span>Query Configuration Engine</span>
          </div>

          {/* FILTER MODE TOGGLE SWITCHES */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode("rolling")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filterMode === "rolling"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Rolling Window
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("custom")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filterMode === "custom"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Custom Dates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Store Finder Search Input */}
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
                placeholder="FILTER BY STORE NUMBER (IE: 3213)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-10 py-3.5 text-xs text-slate-200 font-bold placeholder-slate-600 focus:outline-none focus:border-blue-600 tracking-wider uppercase"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC RENDERING INTERCHANGEABLE CONTROLS */}
          {filterMode === "rolling" ? (
            <>
              {/* Rolling Interval Value Input */}
              <div className="lg:col-span-3 flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Accumulation Magnitude
                </label>
                <input
                  type="number"
                  min={1}
                  value={timeValue || ""}
                  onChange={(e) => setTimeValue(parseInt(e.target.value) || 0)}
                  placeholder="ENTER VALUE..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-200 font-black placeholder-slate-700 focus:outline-none focus:border-blue-600 tracking-widest"
                />
              </div>

              {/* Timeframe Incremental Unit Selector */}
              <div className="lg:col-span-4 flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Rolling Scale Unit
                </label>
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as TimeRangeType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-slate-400 font-black focus:outline-none focus:border-blue-600 uppercase tracking-widest cursor-pointer"
                >
                  <option value="days">Rolling Days</option>
                  <option value="weeks">Rolling Weeks</option>
                  <option value="months">Rolling Months</option>
                  <option value="quarters">Rolling Quarters</option>
                  <option value="years">Rolling Years</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Custom Date Range Picker Fields */}
              <div className="lg:col-span-3 relative flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Timeline Window (Start)
                </label>
                <div className="relative flex items-center">
                  <Calendar
                    className="absolute left-4 text-slate-600 pointer-events-none"
                    size={14}
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-xs text-slate-400 font-bold focus:outline-none focus:border-blue-600 uppercase"
                  />
                  {startDate && (
                    <button
                      onClick={() => setStartDate("")}
                      className="absolute right-3 text-slate-600 hover:text-slate-300 text-[10px] font-black"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 relative flex flex-col justify-end">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1.5 tracking-widest">
                  Timeline Window (End)
                </label>
                <div className="relative flex items-center">
                  <Calendar
                    className="absolute left-4 text-slate-600 pointer-events-none"
                    size={14}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-xs text-slate-400 font-bold focus:outline-none focus:border-blue-600 uppercase"
                  />
                  {endDate && (
                    <button
                      onClick={() => setEndDate("")}
                      className="absolute right-3 text-slate-600 hover:text-slate-300 text-[10px] font-black"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- STORE VELOCITY INDEX (INTERACTIVE ROW SELECTION) --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-pepsi-blue" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Timeframe Store Velocity Index (Click row to isolate query feed)
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <FilterX size={12} />
              Reset Active Filter
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-950 max-h-96 overflow-y-auto custom-scrollbar">
          {storeRankings.length > 0 ? (
            storeRankings.map((store, idx) => (
              <div
                key={store.name}
                onClick={() => setSearchQuery(store.name)}
                className={`p-5 flex items-center justify-between hover:bg-slate-950/60 cursor-pointer transition-all duration-150 group ${
                  searchQuery === store.name
                    ? "bg-slate-950/80 border-l-4 border-l-blue-600 pl-4"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-600 w-6">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                      Store #{store.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">
                      {store.stockouts} Logistical Interruptions • {store.gaps}{" "}
                      Backstock Replenishment Gaps
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                    store.total > 5
                      ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/5"
                      : "bg-slate-950 text-slate-400 border-slate-800 group-hover:border-slate-600"
                  }`}
                >
                  {store.total} Total Logs
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs font-black text-slate-600 uppercase tracking-widest">
              No store logs registered within selected timeframe parameters.
            </div>
          )}
        </div>
      </div>

      {/* MASTER DATA QUERY GRID VIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase italic tracking-widest leading-none mb-1 text-slate-300">
              Query Index Feed{" "}
              {searchQuery && `— Isolated to Store #${searchQuery}`}
            </h3>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              {filteredLogs.length} Records Found For Current Criteria
            </span>
          </div>

          {/* Table Feed Pagination Navigation controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-black text-slate-500 px-2 min-w-10 text-center">
              {currentPage}/{totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* FEED GRID MATRIX ELEMENT */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800">
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Timestamp
                </th>
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Location ID
                </th>
                <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Product Segment
                </th>
                <th className="p-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Root Cause Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogModal(log)}
                    className="hover:bg-slate-950/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {formatPST(log.created_at)} PST
                    </td>
                    <td className="p-4 font-black text-xs text-blue-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-600" />
                      <span>{log.store}</span>
                    </td>
                    <td className="p-4 font-black text-xs uppercase text-slate-200">
                      {log.brand}{" "}
                      <span className="text-slate-500 font-bold ml-1">
                        {log.pack_type}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border inline-block ${
                          log.root_cause === "Backstock" ||
                          log.root_cause === "Item In Backstock"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {log.root_cause}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-20 text-center text-xs font-black text-slate-600 uppercase tracking-widest"
                  >
                    No matching records discovered inside current rolling window
                    array.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL DOWN LOG ENTRY MODAL SCREEN */}
      {selectedLogModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedLogModal(null)}
          />
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase italic tracking-tighter">
                  Store{" "}
                  <span className="text-blue-500">
                    {selectedLogModal.store}
                  </span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Audit Trail
                </p>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                className="p-2 bg-slate-950 text-slate-400 rounded-xl border border-slate-800 hover:text-red-500 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">
                      Product Name
                    </span>
                    <span className="text-sm font-black text-slate-200 uppercase">
                      {selectedLogModal.brand} {selectedLogModal.pack_type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-slate-500 block font-black uppercase text-[8px]">
                      Logged Timestamp
                    </span>
                    <span className="font-bold text-slate-300">
                      {formatPST(selectedLogModal.created_at)} PST
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-black uppercase text-[8px]">
                      Merchandiser
                    </span>
                    <span className="font-bold text-slate-300">
                      {selectedLogModal.user_name || "Field Agent"}
                    </span>
                  </div>
                </div>

                {selectedLogModal.notes && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 italic text-slate-400 leading-relaxed">
                    "{selectedLogModal.notes}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
