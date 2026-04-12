"use client";
import { useState, useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  MapPin,
  Map as MapIcon,
  ShieldAlert,
  ChevronRight,
  X,
  TrendingUp,
  Calendar,
  AlertCircle,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function LogTable() {
  const { logs } = useTracker();
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Automated math for Duration and Historical Trends
  const analysisData = useMemo(() => {
    if (!selectedLog) return null;

    const sameProductLogs = logs.filter(
      (l) => l.product === selectedLog.product,
    );
    const sortedLogs = [...sameProductLogs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    const lastDate =
      sortedLogs.length > 1
        ? new Date(sortedLogs[1].created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "First Occurrence";

    const start = new Date(selectedLog.created_at);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const duration = diff === 0 ? "Today" : `${diff}d`;

    return {
      totalOccurrences: sameProductLogs.length,
      avgDays: (
        sameProductLogs.reduce((acc, curr) => acc + curr.days_oos, 0) /
        sameProductLogs.length
      ).toFixed(1),
      lastSeen: lastDate,
      duration,
    };
  }, [selectedLog, logs]);

  if (logs.length === 0)
    return (
      <div className="p-12 text-center bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          Awaiting Field Data
        </p>
      </div>
    );

  return (
    <div className="relative flex flex-col h-full bg-slate-900 overflow-hidden rounded-[2.5rem] border border-slate-800">
      {/* Header with Adjusted Spacing */}
      <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Frequency Analysis Active
        </span>
        <div className="flex items-center gap-4">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
            Synced
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left table-fixed">
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`transition-all cursor-pointer hover:bg-white/[0.02] active:bg-pepsi-blue/10 ${selectedLog?.id === log.id ? "bg-pepsi-blue/5" : ""}`}
              >
                <td className="p-4 md:p-6">
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-white text-sm md:text-base truncate">
                      {log.product}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase overflow-hidden">
                      <MapPin size={10} className="text-pepsi-red shrink-0" />
                      <span className="truncate">{log.store}</span>
                      <span className="text-slate-700">•</span>
                      <span className="truncate text-pepsi-blue">
                        {log.location}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 w-20 md:w-28 text-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-[9px] font-black border uppercase ${
                      log.priority === "Critical"
                        ? "bg-pepsi-red text-white border-pepsi-red"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {log.priority}
                  </span>
                </td>
                <td className="p-4 w-10 text-center">
                  <ChevronRight
                    size={18}
                    className={`text-slate-700 transition-transform ${selectedLog?.id === log.id ? "rotate-90 text-pepsi-blue" : ""}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive Detail View (Modal on Mobile / Side Panel on Desktop) */}
      {selectedLog && (
        <>
          {/* Backdrop for Mobile Only */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
            onClick={() => setSelectedLog(null)}
          />

          <div
            className={`
            fixed z-50 bg-slate-900 border-slate-800 shadow-2xl transition-all duration-300 transform
            /* Mobile View: Bottom Sheet Modal */
            inset-x-0 bottom-0 rounded-t-[2.5rem] border-t max-h-[85vh] p-6
            /* Tablet/Desktop View: Side Panel Menu */
            lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 lg:rounded-none lg:border-l lg:max-h-screen lg:p-8
            animate-in slide-in-from-bottom lg:slide-in-from-right
          `}
          >
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Inventory Analysis
              </h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 bg-slate-800 rounded-xl text-slate-400 cursor-pointer hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <header className="border-b border-slate-800 pb-6">
                <h2 className="text-2xl font-black text-white leading-tight uppercase mb-2">
                  {selectedLog.product}
                </h2>
                <div className="flex gap-2">
                  <span className="text-[9px] font-black text-pepsi-blue bg-pepsi-blue/10 px-2 py-1 rounded border border-pepsi-blue/20 uppercase">
                    Store: {selectedLog.store}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 uppercase">
                    {selectedLog.location}
                  </span>
                </div>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <Calendar size={18} className="text-slate-600 mb-2" />
                  <p className="text-2xl font-black text-white">
                    {analysisData?.totalOccurrences}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Total Logs
                  </p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <Clock size={18} className="text-emerald-500 mb-2" />
                  <p className="text-2xl font-black text-white">
                    {analysisData?.duration}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Current Duration
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2 text-emerald-500">
                  <CheckCircle2 size={16} />
                  <p className="text-[10px] font-black uppercase">
                    Mitigation Plan
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  {selectedLog.root_cause === "High Demand"
                    ? "Recommendation: Secure secondary display to increase holding capacity."
                    : "Action: Review delivery cycle vs. store pull with Management."}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={18} className="text-pepsi-red" />
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">
                      Verified Cause
                    </p>
                    <p className="text-sm font-black text-white uppercase">
                      {selectedLog.root_cause || "Unknown"}
                    </p>
                  </div>
                </div>
                {selectedLog.notes && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">
                      Field Observations
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      "{selectedLog.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 sm:pb-0 pb-10">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-5 bg-pepsi-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
