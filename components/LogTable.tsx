"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  MapPin,
  X,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ClipboardCheck,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading, toggleWorkedStatus, addLog } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [reasonModalId, setReasonModalId] = useState<string | null>(null);
  const [validationReason, setValidationReason] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedStore || reasonModalId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedStore, reasonModalId]);

  const activeLogs = useMemo(
    () => logs.filter((log) => !log.is_hidden),
    [logs],
  );

  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  const filteredLogs = isManagement
    ? activeLogs
    : activeLogs.filter((log) => log.user_name === profile?.full_name);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  // Handler to safely bump the verification count by 1 day using context deduplication logic
  const handleAddDay = async (e: React.MouseEvent, log: any) => {
    e.stopPropagation(); // Avoid triggering full store details overlay modal
    try {
      await addLog({
        store: log.store,
        brand: log.brand,
        pack_type: log.pack_type,
        location: log.location || "Main Shelf",
        root_cause: log.root_cause,
        notes: "Daily verification check-in",
        gpid: profile?.gpid ?? null,
      });
    } catch (err) {
      console.error("Failed to append verification day:", err);
    }
  };

  const handleOpenCloseoutModal = (e: React.MouseEvent, logId: string) => {
    e.stopPropagation();
    setReasonModalId(logId);
  };

  const submitCloseoutWithReason = async () => {
    if (reasonModalId) {
      await toggleWorkedStatus(reasonModalId, false, validationReason);
      setReasonModalId(null);
      setValidationReason("");
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
            Live Inventory Gaps
          </h3>
          <span className="text-[8px] font-bold text-app-muted uppercase tracking-widest">
            {filteredLogs.length} Tracks Active
          </span>
        </div>
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl border border-app-border">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30"
          >
            ◀
          </button>
          <span className="text-[10px] font-black text-app-muted px-2 min-w-10 text-center font-mono">
            {currentPage}/{totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30"
          >
            ▶
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
              <th className="p-4 text-center text-[9px] font-black text-app-muted uppercase tracking-widest">
                Streak
              </th>
              <th className="p-4 text-right text-[9px] font-black text-app-muted uppercase tracking-widest">
                Actions
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
                      className="text-app-muted/30 mx-auto group-hover:text-amber-500/50 transition-colors"
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
                      {log.store}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${log.verification_count > 3 ? "bg-red-500/10 text-red-400" : "bg-app-bg text-app-muted"}`}
                  >
                    {log.verification_count || 1}d
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {!log.is_worked && (
                    <>
                      {/* ADD A DAY ACTION BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => handleAddDay(e, log)}
                        className="px-2 py-1 bg-slate-950 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 border border-slate-800 text-[9px] font-black uppercase rounded-lg transition-all"
                        title="Add Day Missing"
                      >
                        + 1 Day
                      </button>

                      {/* WORKED LOG STATUS ACTION BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenCloseoutModal(e, log.id)}
                        className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-[9px] font-black uppercase rounded-lg transition-all"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REASON CAPTURE POPUP GATED INSIDE ACTION SHEET */}
      {reasonModalId && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setReasonModalId(null)}
          />
          <div className="relative bg-app-card border border-app-border w-full max-w-sm rounded-4xl shadow-2xl p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pepsi-blue text-[10px] font-black uppercase tracking-widest">
                <ClipboardCheck size={12} /> Verification Note Required
              </div>
              <h3 className="text-xl font-black text-app-text uppercase italic">
                Resolve Active Gap
              </h3>
            </div>
            <textarea
              autoFocus
              value={validationReason}
              onChange={(e) => setValidationReason(e.target.value)}
              placeholder="What resolution path fixed this item outage?"
              className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-xs text-app-text focus:outline-none focus:border-pepsi-blue min-h-25 resize-none font-bold"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setReasonModalId(null)}
                className="flex-1 py-3 bg-app-bg text-app-muted text-[10px] font-black uppercase rounded-xl border border-app-border"
              >
                Cancel
              </button>
              <button
                onClick={submitCloseoutWithReason}
                className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg"
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
