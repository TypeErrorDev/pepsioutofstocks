"use client";
import React, { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  MapPin,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  Package,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const itemsPerPage = 10;

  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  const filteredLogs = isManagement
    ? logs
    : logs.filter(
        (log) =>
          log.user_name === profile?.full_name ||
          log.user_email === profile?.email,
      );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Modal Data Logic (Group logs for the selected store)
  const modalData = useMemo(() => {
    if (!selectedStore) return null;
    const storeLogs = logs.filter((l) => l.store === selectedStore);
    const stockouts = storeLogs.filter(
      (l) => l.root_cause !== "In Backstock",
    ).length;
    const serviceGaps = storeLogs.filter(
      (l) => l.root_cause === "In Backstock",
    ).length;
    return { name: selectedStore, stockouts, serviceGaps, rawLogs: storeLogs };
  }, [selectedStore, logs]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-700 font-black uppercase text-[10px] animate-pulse">
        Syncing Field Logs...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">
            Live Stream
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Entry {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredLogs.length)} of{" "}
            {filteredLogs.length}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 text-white disabled:opacity-20"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black text-slate-400 px-2 min-w-[45px] text-center">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 text-white disabled:opacity-20"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
          <thead>
            <tr className="bg-slate-950/50 sticky top-0 z-10 border-b border-slate-800">
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Item Details
              </th>
              <th className="w-[160px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Store
              </th>
              <th className="w-[110px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                User
              </th>
              <th className="w-[140px] p-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {currentLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-800/30 transition-colors h-16 cursor-pointer group"
                onClick={() => setSelectedStore(log.store)}
              >
                <td className="p-4 overflow-hidden">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-white uppercase truncate group-hover:text-pepsi-blue transition-colors">
                      {log.brand || log.product}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase truncate">
                      {log.pack_type} • {log.location}
                    </span>
                  </div>
                </td>
                <td className="p-4 overflow-hidden">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <MapPin size={12} className="text-slate-600 shrink-0" />
                    <span className="text-xs font-black text-slate-300">
                      #{log.store}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center overflow-hidden">
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-950 px-2 py-1 rounded-md border border-slate-800 whitespace-nowrap">
                    <UserIcon size={10} className="text-pepsi-blue shrink-0" />
                    <span>{log.user_name?.split(" ")[0] || "User"}</span>
                  </div>
                </td>
                <td className="p-4 text-right overflow-hidden">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border whitespace-nowrap ${log.root_cause === "In Backstock" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"}`}
                    >
                      {log.root_cause}
                    </span>
                    <Info
                      size={14}
                      className="text-slate-700 group-hover:text-pepsi-blue"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEEP DIVE MODAL */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-pepsi-blue" />
                <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter">
                  Directives: #{selectedStore}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </header>
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-[9px] font-black text-pepsi-blue uppercase mb-3 tracking-widest flex items-center gap-2">
                    <RefreshCw size={12} /> Inventory Correction
                  </h4>
                  <p className="text-xs md:text-sm text-white font-bold leading-relaxed italic">
                    Verified Stockouts: {modalData.stockouts}. Action: Zero the
                    inventory count in handheld.
                  </p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-[9px] font-black text-amber-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <AlertCircle size={12} /> Service Efficiency
                  </h4>
                  <p className="text-xs md:text-sm text-white font-bold leading-relaxed italic">
                    Service Gaps: {modalData.serviceGaps}. Action: Confirm
                    backroom inventory was pulled.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Verified Field Logs
                </h4>
                {modalData.rawLogs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-white"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase truncate">
                        {log.brand} {log.pack_type}
                      </p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest truncate">
                        {log.location}
                      </p>
                    </div>
                    <p className="text-[9px] font-black text-pepsi-blue uppercase shrink-0">
                      {log.root_cause}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
