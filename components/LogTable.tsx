"use client";
import React, { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  MapPin,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const itemsPerPage = 6;

  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);
  const filteredLogs = isManagement
    ? logs
    : logs.filter((log) => log.user_name === profile?.full_name);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentLogs = filteredLogs.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const modalData = useMemo(() => {
    if (!selectedStore) return null;
    const storeLogs = logs.filter((l) => l.store === selectedStore);

    // Robust check for root cause to avoid "0" counts due to case sensitivity
    return {
      name: selectedStore,
      total: storeLogs.length,
      stockouts: storeLogs.filter((l) =>
        l.root_cause?.toLowerCase().trim() !== "in backstock"
      ).length,
      serviceGaps: storeLogs.filter((l) =>
        l.root_cause?.toLowerCase().trim() === "in backstock"
      ).length,
      rawLogs: storeLogs,
    };
  }, [selectedStore, logs]);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-[10px] font-black text-slate-700 uppercase tracking-widest">
        Syncing Stream...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* PAGINATION HEADER */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div className="flex flex-col">
          <h3 className="text-xs font-black text-white uppercase italic tracking-widest leading-none mb-1">
            Live Stream
          </h3>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
            Field Activity Feed
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-slate-400 px-2 min-w-[40px] text-center">
            {currentPage}/{totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Stacked Cards (No horizontal scroll) */}
      <div className="block md:hidden divide-y divide-slate-800/50 overflow-y-auto">
        {currentLogs.map((log) => (
          <div
            key={log.id}
            onClick={() => setSelectedStore(log.store)}
            className="p-5 active:bg-slate-800 transition-colors flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-white uppercase truncate">
                  {log.brand}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {log.pack_type} • {log.location}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border shrink-0 ${log.root_cause?.toLowerCase().includes("backstock")
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                  }`}
              >
                {log.root_cause}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <MapPin size={10} className="text-pepsi-blue" />
                  <span className="text-xs font-black text-slate-300">
                    Store #{log.store}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={10} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {log.user_name || "Field User"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock size={10} />
                <span className="text-[9px] font-bold uppercase">
                  {new Date(log.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP/TABLET VIEW: Traditional Table */}
      <div className="hidden md:block overflow-x-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-950/30 border-b border-slate-800">
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Item Details
              </th>
              <th className="w-[120px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Store
              </th>
              <th className="w-[140px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                Logged By
              </th>
              <th className="w-[140px] p-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {currentLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedStore(log.store)}
                className="hover:bg-slate-800/40 transition-colors h-16 cursor-pointer"
              >
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">
                      {log.brand}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      {log.pack_type}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-600" />
                    <span className="text-xs font-black text-slate-300">
                      #{log.store}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                    <UserIcon size={10} className="text-pepsi-blue" />
                    <span>{log.user_name?.split(" ")[0] || "User"}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border inline-block ${log.root_cause?.toLowerCase().includes("backstock")
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                      }`}
                  >
                    {log.root_cause}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SECTION */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative w-full max-w-2xl bg-slate-900 border-t md:border border-slate-800 rounded-t-[2rem] md:rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                #{selectedStore} Summary
              </h2>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-slate-800 text-white rounded-xl"
              >
                <X size={20} />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[8px] font-black text-pepsi-blue uppercase mb-1 tracking-widest">
                    Verified OOS Events
                  </p>
                  <p className="text-xl font-black text-white italic">
                    {modalData.stockouts}
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[8px] font-black text-amber-500 uppercase mb-1 tracking-widest">
                    Internal Service Gaps
                  </p>
                  <p className="text-xl font-black text-white italic">
                    {modalData.serviceGaps}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Recent Activity
                </p>
                {modalData.rawLogs.slice(0, 5).map((log: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white uppercase">
                        {log.brand}
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase">
                        {log.location}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase ${log.root_cause?.toLowerCase().includes("backstock") ? "text-emerald-500" : "text-pepsi-red"
                      }`}>
                      {log.root_cause}
                    </span>
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