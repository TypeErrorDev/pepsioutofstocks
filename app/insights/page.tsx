"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Search,
  X,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  const { logs, profile, loading } = useTracker();

  // Search, Filtering, and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogModal, setSelectedLogModal] = useState<any | null>(null);

  const itemsPerPage = 10;

  // 1. DETERMINE ROLE ACCESS
  // Matches your platform specification rules: admin, team_lead, sales_rep
  const isAdmin = profile?.role === "admin";
  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  // 2. DISABLE PAGE SCROLLING BEHIND MODALS
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

  // 3. PST FORMATTING HELPER
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

  // 4. MULTI-LEVEL FILTERING LOGIC (Role Matrix + Search Query + Date Windows)
  const filteredLogs = useMemo(() => {
    // Stage A: Filter unhidden items & apply role visibility restrictions
    let data = logs.filter((log) => !log.is_hidden);
    if (!isManagement) {
      data = data.filter((log) => log.user_name === profile?.full_name);
    }

    // Stage B: Filter by Target Store input string
    if (searchQuery.trim() !== "") {
      data = data.filter((log) =>
        log.store.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      );
    }

    // Stage C: Apply Date Range Filters
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

    return data;
  }, [logs, profile, isManagement, searchQuery, startDate, endDate]);

  // 5. PAGINATION COMPUTATIONS
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = useMemo(() => {
    return filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredLogs, indexOfFirstItem, indexOfLastItem]);

  // Reset pagination indexes on input parameter adjustments
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  // 6. PERFORMANCE-OPTIMIZED CLIENT EXCEL GENERATION
  const handleExportToExcel = async () => {
    try {
      // Lazy load library to preserve critical-path client performance
      const XLSX = await import("xlsx");

      // Map analytics structure into human-readable columns
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Metrics");

      // Format column widths beautifully within the output worksheet
      const maxColumnWidths = [
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
      worksheet["!cols"] = maxColumnWidths;

      // Flush workbook down to system shell filesystem as binary attachment download
      XLSX.writeFile(
        workbook,
        `pepsi_stockout_report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (err) {
      console.error("Critical Excel compiling exception occurred:", err);
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
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-pepsi-blue text-xs font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity mb-2"
            >
              <ArrowLeft size={12} /> Back to Dashboard
            </Link>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            Data <span className="text-blue-600">Insights</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Operator: {profile?.full_name || "Unknown"} | Scope:{" "}
            {profile?.role?.toUpperCase() || "USER"}
          </p>
        </div>

        {/* ADMIN EXCEL PORTAL CONTROL */}
        {isAdmin && (
          <button
            onClick={handleExportToExcel}
            className="group flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 px-6 py-4 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-300 shadow-xl cursor-pointer text-xs font-black uppercase tracking-wider"
          >
            <FileSpreadsheet
              size={18}
              className="animate-pulse group-hover:scale-110 transition-transform"
            />
            <span>Export Master Sheet (.XLSX)</span>
          </button>
        )}
      </header>

      {/* SEARCH CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-2">
          <SlidersHorizontal size={14} className="text-blue-500" />
          <span>Query Configuration Engine</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Store Input Element */}
          <div className="lg:col-span-6 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER SEARCH BY STORE NUMBER (E.G. 5406)..."
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

          {/* Date Window Fields */}
          <div className="lg:col-span-3 relative flex items-center">
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
                className="absolute right-3 text-slate-600 hover:text-slate-300 text-xs font-bold"
              >
                CLEAR
              </button>
            )}
          </div>

          <div className="lg:col-span-3 relative flex items-center">
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
                className="absolute right-3 text-slate-600 hover:text-slate-300 text-xs font-bold"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER RESULTS FEED MODULE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex flex-col">
            <h3 className="text-xs font-black uppercase italic tracking-widest leading-none mb-1 text-slate-300">
              Query Index Feed
            </h3>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              {filteredLogs.length} Matching Records Identified
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
                    <td className="p-4 font-black text-xs text-blue-500">
                      {log.store}
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
                          log.root_cause === "Backstock"
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
                    No matching records discovered inside current parameter
                    matrix.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRILL DOWN LOG ENTRY MODAL SCREEN - SCROLL IS COMPLETELY LOCKED OUTSIDE WINDOW */}
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
