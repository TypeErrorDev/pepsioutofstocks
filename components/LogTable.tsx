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
  Info,
  Calendar,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const itemsPerPage = 6;

  const isManagement = profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);
  const filteredLogs = isManagement
    ? logs
    : logs.filter((log) => log.user_name === profile?.full_name);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const modalData = useMemo(() => {
    if (!selectedStore) return null;
    const storeLogs = logs.filter((l) => l.store === selectedStore);

    return {
      name: selectedStore,
      total: storeLogs.length,
      // Professional categories: Backstock is a service gap, others are stockouts
      stockouts: storeLogs.filter((l) => l.root_cause !== "Backstock").length,
      serviceGaps: storeLogs.filter((l) => l.root_cause === "Backstock").length,
      rawLogs: storeLogs,
    };
  }, [selectedStore, logs]);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-[10px] font-black text-app-muted uppercase tracking-widest">
        Syncing Field Data...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-app-card transition-colors">
      {/* HEADER & PAGINATION */}
      <div className="p-5 border-b border-app-border flex justify-between items-center bg-app-card/50 backdrop-blur-md">
        <div className="flex flex-col">
          <h3 className="text-xs font-black text-app-text uppercase italic tracking-widest leading-none mb-1">
            Live Stream
          </h3>
          <span className="text-[8px] font-bold text-app-muted uppercase tracking-widest">
            {filteredLogs.length} Records Detected
          </span>
        </div>
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl border border-app-border">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-app-text hover:bg-app-card rounded-lg transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-app-muted px-2 min-w-[40px] text-center">
            {currentPage}/{totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 text-app-text hover:bg-app-card rounded-lg transition-colors disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* MOBILE VIEW: Card Stack (Theme Responsive) */}
        <div className="block md:hidden divide-y divide-app-border/50">
          {currentLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedStore(log.store)}
              className="p-5 active:bg-app-bg/50 transition-colors flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-app-text uppercase truncate">
                    {log.brand}
                  </span>
                  <span className="text-[10px] font-bold text-app-muted uppercase">
                    {log.pack_type} • {log.location}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border shrink-0 ${log.root_cause === "Backstock"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                  }`}>
                  {log.root_cause}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={10} className="text-pepsi-blue" />
                    <span className="text-xs font-black text-app-text/80 uppercase">
                      #{log.store}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon size={10} className="text-app-muted" />
                    <span className="text-[10px] font-bold text-app-muted uppercase">
                      {log.user_name || "Field User"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-app-muted/60">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold uppercase">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Table (Theme Responsive) */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-app-bg/30 border-b border-app-border">
                <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">SKU Details</th>
                <th className="w-[140px] p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">Store</th>
                <th className="w-[160px] p-4 text-[9px] font-black text-app-muted uppercase tracking-widest text-center">Field Contact</th>
                <th className="w-[150px] p-4 text-right text-[9px] font-black text-app-muted uppercase tracking-widest">Log Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/30">
              {currentLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedStore(log.store)}
                  className="hover:bg-app-bg/40 transition-colors h-16 cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-app-text uppercase">{log.brand}</span>
                      <span className="text-[9px] font-bold text-app-muted uppercase">{log.pack_type} • {log.location}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-pepsi-blue" />
                      <span className="text-xs font-black text-app-text/90">#{log.store}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-app-muted uppercase bg-app-bg px-2 py-1 rounded-md border border-app-border group-hover:border-pepsi-blue/30 transition-all">
                      <UserIcon size={10} className="text-pepsi-blue" />
                      <span>{log.user_name?.split(" ")[0] || "User"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border inline-block ${log.root_cause === "Backstock"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                      }`}>
                      {log.root_cause}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STORE ANALYTICS MODAL */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-app-bg/80 backdrop-blur-sm" onClick={() => setSelectedStore(null)} />
          <div className="relative w-full max-w-2xl bg-app-card border-t md:border border-app-border rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom duration-300">
            <header className="p-6 border-b border-app-border flex justify-between items-center bg-app-card/50">
              <div>
                <h2 className="text-xl font-black text-app-text uppercase italic tracking-tighter">
                  Store <span className="text-pepsi-blue">#{selectedStore}</span>
                </h2>
                <p className="text-[10px] font-black text-app-muted uppercase tracking-widest">Account Priority Summary</p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-app-bg text-app-text rounded-xl border border-app-border hover:text-pepsi-red transition-all"
              >
                <X size={20} />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-app-bg/50 p-5 rounded-2xl border border-app-border">
                  <div className="flex items-center gap-2 text-pepsi-red mb-2">
                    <Info size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Inventory Gaps</span>
                  </div>
                  <p className="text-3xl font-black text-app-text italic">{modalData.stockouts}</p>
                </div>
                <div className="bg-app-bg/50 p-5 rounded-2xl border border-app-border">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <Clock size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Service Gaps</span>
                  </div>
                  <p className="text-3xl font-black text-app-text italic">{modalData.serviceGaps}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Calendar size={12} className="text-pepsi-blue" />
                  <p className="text-[9px] font-black text-app-muted uppercase tracking-widest">Recent Field Activity</p>
                </div>
                <div className="space-y-2">
                  {modalData.rawLogs.slice(0, 5).map((log: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-app-bg/30 rounded-2xl border border-app-border flex justify-between items-center group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-app-text uppercase group-hover:text-pepsi-blue transition-colors">
                          {log.brand} {log.pack_type}
                        </span>
                        <span className="text-[9px] font-bold text-app-muted uppercase">
                          {log.location} • {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase ${log.root_cause === "Backstock" ? "text-emerald-500" : "text-pepsi-red"
                        }`}>
                        {log.root_cause}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}