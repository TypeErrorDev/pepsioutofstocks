"use client";
import React, { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  MapPin,
  X,
  MessageSquare,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCheck,
  Clock,
  EyeOff,
  ClipboardCheck,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading, toggleWorkedStatus, hideLog } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [reasonModalId, setReasonModalId] = useState<string | null>(null);
  const [tempReason, setTempReason] = useState("");

  const itemsPerPage = 10;

  // Filter out hidden items for display
  const activeLogs = useMemo(
    () => logs.filter((log) => !log.is_hidden),
    [logs],
  );
  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);
  const filteredLogs = isManagement
    ? activeLogs
    : activeLogs.filter((log) => log.user_name === profile?.full_name);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentLogs = filteredLogs.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // PST Formatting Helper
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

  const modalData = useMemo(() => {
    if (!selectedStore) return null;
    return activeLogs.filter((l) => l.store === selectedStore);
  }, [selectedStore, activeLogs]);

  const submitHide = () => {
    if (reasonModalId && tempReason.trim() !== "") {
      hideLog(reasonModalId, tempReason);
      setReasonModalId(null);
      setTempReason("");
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-[10px] font-black text-app-muted uppercase tracking-widest">
        Syncing Records...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-app-card transition-colors">
      <div className="p-5 border-b border-app-border flex justify-between items-center bg-app-card/50">
        <div className="flex flex-col">
          <h3 className="text-xs font-black text-app-text uppercase italic tracking-widest leading-none mb-1">
            Live Inventory Logs
          </h3>
          <span className="text-[8px] font-bold text-app-muted uppercase tracking-widest">
            {filteredLogs.length} Active Records
          </span>
        </div>
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl border border-app-border">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-app-muted px-2 min-w-10 text-center">
            {currentPage}/{totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-app-bg/30 border-b border-app-border">
              <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest w-12 text-center">
                Status
              </th>
              <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">
                Product Details
              </th>
              <th className="p-4 text-[9px] font-black text-app-muted uppercase tracking-widest">
                Store
              </th>
              <th className="p-4 text-right text-[9px] font-black text-app-muted uppercase tracking-widest">
                Cause
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border/30">
            {currentLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedStore(log.store)}
                className="hover:bg-app-bg/40 transition-colors cursor-pointer group"
              >
                <td className="p-4 text-center">
                  {log.is_worked ? (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mx-auto"
                    />
                  ) : (
                    <Circle
                      size={16}
                      className="text-app-muted/30 mx-auto group-hover:text-pepsi-blue/50 transition-colors"
                    />
                  )}
                </td>
                <td className="p-4 font-black text-xs uppercase text-app-text">
                  {log.brand}{" "}
                  <span className="text-app-muted font-bold ml-1">
                    {log.pack_type}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-pepsi-blue" />
                    <span className="text-xs font-black text-app-text/90">
                      #{log.store}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border inline-block ${log.root_cause === "Backstock" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"}`}
                  >
                    {log.root_cause}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Detail Modal */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative bg-app-card border border-app-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-app-border flex justify-between items-center bg-app-card/50">
              <div>
                <h2 className="text-xl font-black text-app-text uppercase italic tracking-tighter">
                  Store{" "}
                  <span className="text-pepsi-blue">#{selectedStore}</span>
                </h2>
                <p className="text-[10px] font-black text-app-muted uppercase tracking-widest">
                  Active Audit
                </p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-app-bg text-app-text rounded-xl border border-app-border hover:text-pepsi-red transition-all"
              >
                <X size={20} />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {modalData.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-app-bg/30 rounded-2xl border border-app-border space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-app-text uppercase">
                        {log.brand} {log.pack_type}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-app-muted uppercase">
                        <Clock size={10} />
                        <span>{formatPST(log.created_at)} PST</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkedStatus(log.id, log.is_worked);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${log.is_worked ? "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20" : "bg-app-card text-app-text border-app-border hover:border-pepsi-blue"}`}
                      >
                        {log.is_worked ? "Worked" : "Mark Worked"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReasonModalId(log.id);
                        }}
                        className="p-1.5 bg-app-bg text-app-muted hover:text-pepsi-red border border-app-border rounded-lg transition-colors"
                      >
                        <EyeOff size={14} />
                      </button>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="flex gap-2 p-3 bg-app-bg/50 rounded-xl border border-app-border/50 italic text-[10px] text-app-text/80 leading-relaxed">
                      <MessageSquare
                        size={12}
                        className="text-pepsi-blue shrink-0 mt-0.5"
                      />
                      <span>"{log.notes}"</span>
                    </div>
                  )}

                  {/* Audit Trail Section */}
                  {log.is_worked && log.updated_by && (
                    <div className="pt-2 border-t border-app-border/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <UserCheck size={10} className="text-emerald-500" />
                        <p className="text-[8px] font-black text-app-muted uppercase tracking-widest">
                          Verified by{" "}
                          <span className="text-app-text">
                            {log.updated_by}
                          </span>
                        </p>
                      </div>
                      <p className="text-[7px] font-bold text-app-muted uppercase ml-4">
                        Updated: {formatPST(log.updated_at)} PST
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Resolution Reason */}
      {reasonModalId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setReasonModalId(null)}
          />
          <div className="relative bg-app-card border border-app-border w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-6 space-y-6 animate-in zoom-in-95">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pepsi-blue text-[10px] font-black uppercase tracking-widest">
                <ClipboardCheck size={12} /> Reason Code Required
              </div>
              <h3 className="text-xl font-black text-app-text uppercase italic">
                Archive Entry
              </h3>
            </div>
            <textarea
              autoFocus
              value={tempReason}
              onChange={(e) => setTempReason(e.target.value)}
              placeholder="Why is this issue being closed?"
              className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-xs text-app-text focus:outline-none focus:border-pepsi-blue min-h-[100px] resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setReasonModalId(null)}
                className="flex-1 py-3 bg-app-bg text-app-muted text-[10px] font-black uppercase rounded-xl border border-app-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitHide}
                disabled={tempReason.trim() === ""}
                className="flex-1 py-3 bg-pepsi-blue text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-pepsi-blue/20 hover:bg-pepsi-blue-dark transition-all disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
