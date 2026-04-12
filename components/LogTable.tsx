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

  // Automated Analysis Logic
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
      lastSeen: lastDate,
      duration,
    };
  }, [selectedLog, logs]);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-pepsi-red text-white border-pepsi-red shadow-[0_0_12px_rgba(227,24,55,0.25)]";
      case "High":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Medium":
        return "bg-pepsi-blue/10 text-pepsi-blue border-pepsi-blue/20";
      default:
        return "bg-slate-800 text-slate-500 border-slate-700";
    }
  };

  if (logs.length === 0)
    return (
      <div className="p-12 text-center bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
        <Package className="text-slate-800 mb-4 mx-auto opacity-20" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          Awaiting Field Data
        </p>
      </div>
    );

  return (
    <div className="relative flex flex-col h-full bg-slate-900 overflow-hidden rounded-[2.5rem] border border-slate-800">
      {/* Refined Header Spacing */}
      <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/30 backdrop-blur-md">
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

      {/* Main Table Body */}
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
                    <p className="font-black text-white text-sm md:text-base leading-tight truncate uppercase tracking-tight">
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
                <td className="p-4 w-24 md:w-32 text-center align-middle">
                  <span
                    className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-[9px] font-black border uppercase tracking-tighter transition-all ${getPriorityStyles(log.priority)}`}
                  >
                    {log.priority === "Critical" && (
                      <ShieldAlert size={12} className="animate-pulse" />
                    )}
                    {log.priority}
                  </span>
                </td>
                <td className="p-4 w-10 text-center">
                  <ChevronRight
                    size={18}
                    className={`text-slate-700 transition-transform ${selectedLog?.id === log.id ? "rotate-90 text-pepsi-blue scale-110" : ""}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive Detail View (Modal/Side Panel) */}
      {selectedLog && (
        <>
          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
            onClick={() => setSelectedLog(null)}
          />

          <div
            className={`
            fixed z-50 bg-slate-900 border-slate-800 shadow-2xl transition-all duration-300 transform
            inset-x-0 bottom-0 rounded-t-[2.5rem] border-t max-h-[85vh] p-6 
            lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 lg:rounded-none lg:border-l lg:max-h-screen lg:p-8 
            animate-in slide-in-from-bottom lg:slide-in-from-right overflow-hidden flex flex-col
          `}
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Inventory Analysis
              </h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 bg-slate-800 rounded-xl text-slate-400 cursor-pointer hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
              {/* Cleaned Header - Grey Box Removed */}
              <header className="border-b border-slate-800 pb-6">
                <div className="flex flex-col gap-3">
                  <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                    {selectedLog.product}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-pepsi-blue/10 border border-pepsi-blue/20 rounded-lg">
                      <MapPin size={10} className="text-pepsi-blue" />
                      <span className="text-[10px] font-black text-pepsi-blue uppercase tracking-widest leading-none">
                        {selectedLog.store}
                      </span>
                    </div>
                    {selectedLog.location && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg">
                        <MapIcon size={10} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          {selectedLog.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <Calendar size={18} className="text-slate-600 mb-2" />
                  <p className="text-2xl font-black text-white leading-none mb-1">
                    {analysisData?.totalOccurrences}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Total Logs
                  </p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <Clock size={18} className="text-emerald-500 mb-2" />
                  <p className="text-2xl font-black text-white leading-none mb-1">
                    {analysisData?.duration}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Duration
                  </p>
                </div>
              </div>

              {/* Mitigation Logic */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-3 text-emerald-500">
                  <CheckCircle2 size={16} />
                  <p className="text-[10px] font-black uppercase">
                    Mitigation Plan
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  {selectedLog.root_cause === "High Demand"
                    ? "Secure secondary display to increase total shelf holding capacity."
                    : "Review delivery cycle versus store pull rates with local Management."}
                </p>
              </div>

              {/* Observations & Cause */}
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={18} className="text-pepsi-red" />
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">
                      Verified Cause
                    </p>
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      {selectedLog.root_cause || "Unassigned"}
                    </p>
                  </div>
                </div>
                {selectedLog.notes && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                      Observations
                    </p>
                    <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                      "{selectedLog.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-6 sm:pb-0 pb-10 mt-auto shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-5 bg-pepsi-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                Return to Audit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
