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
  ClipboardCheck,
  Search,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading, toggleWorkedStatus, addLog } = useTracker();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [reasonModalId, setReasonModalId] = useState<string | null>(null);
  const [validationReason, setValidationReason] = useState("");

  // Live store input filter state
  const [currentStoreInput, setCurrentStoreInput] = useState("");

  const itemsPerPage = 10;

  // --- SCROLL LOCK BOUNDARY ---
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

  // Reset pagination index to page 1 whenever the query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentStoreInput]);

  const activeLogs = useMemo(
    () => logs.filter((log) => !log.is_hidden),
    [logs],
  );

  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  // --- HYBRID ROUTE FILTERING SYSTEM ---
  const finalFilteredLogs = useMemo(() => {
    // Isolate basic unhidden logs
    let data = activeLogs;

    // SCENARIO A: A store search query is active -> Open the gates to see ALL matching rows
    if (currentStoreInput.trim() !== "") {
      return data.filter((log) =>
        log.store
          .toString()
          .toLowerCase()
          .includes(currentStoreInput.trim().toLowerCase()),
      );
    }

    // SCENARIO B: No store search query -> Enforce default user ownership constraints
    if (!isManagement) {
      data = data.filter((log) => log.user_name === profile?.full_name);
    }

    return data;
  }, [activeLogs, isManagement, profile, currentStoreInput]);

  // --- PAGINATION MATHEMATICS ---
  const totalPages = Math.ceil(finalFilteredLogs.length / itemsPerPage);
  const currentLogs = useMemo(() => {
    return finalFilteredLogs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [finalFilteredLogs, currentPage]);

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

  const buildAuditHistory = (log: any) => {
    const history: Array<{
      label: string;
      description: string;
      timestamp?: string;
    }> = [];

    history.push({
      label: "Created",
      description: `Created by ${log.user_name || "Unknown user"}`,
      timestamp: formatPST(log.created_at),
    });

    if (log.verification_count > 1) {
      history.push({
        label: "Verification",
        description: `Verified ${log.verification_count - 1} more time${
          log.verification_count - 1 === 1 ? "" : "s"
        }`,
        timestamp: log.updated_at ? formatPST(log.updated_at) : undefined,
      });
    }

    if (log.updated_by) {
      const actionLabel = log.is_worked ? "Resolved" : "Updated";
      history.push({
        label: actionLabel,
        description: `${actionLabel} by ${log.updated_by}`,
        timestamp: log.updated_at ? formatPST(log.updated_at) : undefined,
      });
    }

    if (log.notes) {
      const resolutionMatch = log.notes.match(/Resolution Note:\s*(.+)$/);
      if (resolutionMatch) {
        history.push({
          label: "Resolution",
          description: resolutionMatch[1].trim(),
        });
      }

      const reverifyCount = (log.notes.match(/\[Re-verified Note:/g) || [])
        .length;
      if (reverifyCount > 0) {
        history.push({
          label: "Re-verify",
          description: `${reverifyCount} re-verification note${
            reverifyCount === 1 ? "" : "s"
          } recorded`,
        });
      }
    }

    return history;
  };

  // Dedicated detail drawer compilation matching the active query state
  const modalData = useMemo(() => {
    if (!selectedStore) return null;
    return activeLogs.filter((l) => l.store === selectedStore);
  }, [selectedStore, activeLogs]);

  const handleAddDay = async (e: React.MouseEvent, log: any) => {
    e.stopPropagation();
    try {
      await addLog({
        store: log.store,
        product: log.product,
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
    if (!reasonModalId) return;

    const targetLog = logs.find((l) => l.id === reasonModalId);
    if (!targetLog) return;

    await toggleWorkedStatus(
      reasonModalId,
      targetLog.is_worked,
      validationReason,
    );
    setReasonModalId(null);
    setValidationReason("");
  };

  if (loading)
    return (
      <div className="p-20 text-center text-[10px] font-black text-app-muted uppercase tracking-widest">
        Syncing Records...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-app-card transition-colors">
      {/* HEADER CONTROLS BAR */}
      <div className="p-5 border-b border-app-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-app-card/50">
        <div className="flex flex-col">
          <h3 className="text-xs font-black text-app-text uppercase italic tracking-widest leading-none mb-1">
            Live Inventory Gaps
          </h3>
          <span className="text-[8px] font-bold text-app-muted uppercase tracking-widest">
            {finalFilteredLogs.length} Gaps Displayed
          </span>
        </div>

        {/* CURRENT LOCATION SEARCH FILTER BAR */}
        <div className="w-full sm:w-64 relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-600"
            size={14}
          />
          <input
            type="text"
            value={currentStoreInput}
            onChange={(e) => setCurrentStoreInput(e.target.value)}
            placeholder="TYPE CURRENT STORE NUMBER..."
            className="w-full bg-slate-950 border border-slate-850 p-2 rounded-xl pl-9 pr-8 text-[10px] font-black tracking-wider text-slate-200 placeholder:text-slate-700 outline-none focus:border-blue-600 uppercase transition-all"
          />
          {currentStoreInput && (
            <button
              onClick={() => setCurrentStoreInput("")}
              className="absolute right-2.5 top-2.5 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* FEED TABLE PAGINATION FOOTPRINT */}
        <div className="flex items-center gap-1 bg-app-bg p-1 rounded-xl border border-app-border self-end sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30 cursor-pointer"
          >
            ◀
          </button>
          <span className="text-[10px] font-black text-app-muted px-2 min-w-10 text-center font-mono">
            {currentPage}/{totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 text-app-text hover:bg-app-card rounded-lg disabled:opacity-30 cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>

      {/* FEED DATA MATRIX OVERVIEW */}
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
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
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
                    {log.product}{" "}
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
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleAddDay(e, log)}
                          className="px-2 py-1 bg-slate-950 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 border border-slate-800 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                          title="Verify Gap Still Exists"
                        >
                          + 1 Day
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenCloseoutModal(e, log.id)}
                          className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-20 text-center text-xs font-black text-slate-600 uppercase tracking-widest"
                >
                  You have not logged any gaps yet. Use the form to the left to
                  add <br />
                  your first out of stock record and start tracking your stores!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Main Location Gaps Breakdown Drawer */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
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
                  Active Gaps Audit
                </p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-app-bg text-app-text rounded-xl border border-app-border hover:text-pepsi-red transition-all cursor-pointer"
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
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-app-text uppercase">
                        {log.product} {log.pack_type}
                      </span>
                      <span className="text-[9px] text-app-muted font-bold uppercase mt-1">
                        Streak: {log.verification_count || 1} Days Out of Stock
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                        Logged By: {log.user_name}
                      </span>
                    </div>
                    {!log.is_worked && (
                      <button
                        onClick={(e) => handleOpenCloseoutModal(e, log.id)}
                        className="px-3 py-1.5 rounded-lg text-[9px] font-black bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white transition-all cursor-pointer"
                      >
                        Resolve Gap
                      </button>
                    )}
                  </div>

                  <div className="border-t border-app-border pt-4 mt-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-3">
                      Activity History
                    </div>
                    <div className="space-y-3">
                      {buildAuditHistory(log).map((entry) => (
                        <div
                          key={`${log.id}-${entry.label}-${entry.timestamp || entry.description}`}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                              {entry.label}
                            </span>
                            {entry.timestamp ? (
                              <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">
                                {entry.timestamp}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-app-text/80 leading-snug">
                            {entry.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION NOTES INPUT WINDOW */}
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
              className="w-full bg-app-bg border border-app-border rounded-xl p-4 text-xs text-app-text focus:outline-none focus:border-pepsi-blue min-h-25 resize-none font-bold placeholder:text-slate-700"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReasonModalId(null)}
                className="flex-1 py-3 bg-app-bg text-app-muted text-[10px] font-black uppercase rounded-xl border border-app-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCloseoutWithReason}
                className="flex-1 py-3 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg cursor-pointer"
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
