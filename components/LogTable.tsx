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
  const { logs, userName } = useTracker();
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const historicalStats = useMemo(() => {
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
        : "No Prior History";

    return {
      totalOccurrences: sameProductLogs.length,
      avgDays: (
        sameProductLogs.reduce((acc, curr) => acc + curr.days_oos, 0) /
        sameProductLogs.length
      ).toFixed(1),
      lastOOSDate: lastDate,
    };
  }, [selectedLog, logs]);

  if (logs.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed">
        <Package className="text-slate-800 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          Awaiting Field Data
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden rounded-[2rem] border border-slate-800">
      {/* Fixed Spacing Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Historical Frequency Engine Active
        </span>
        <div className="flex items-center gap-3 ml-4">
          {" "}
          {/* Added margin and gap here */}
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
            Synced
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-left table-fixed">
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="transition-colors cursor-pointer hover:bg-white/[0.02] active:bg-pepsi-blue/10"
              >
                <td className="p-4 md:p-6 align-middle">
                  <div className="flex flex-col gap-1">
                    <p className="font-black text-white text-sm md:text-base leading-tight truncate">
                      {log.product}
                    </p>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="flex items-center gap-1 text-slate-500 text-[9px] font-black uppercase whitespace-nowrap">
                        <MapPin size={10} className="text-pepsi-red shrink-0" />{" "}
                        {log.store}
                      </span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-500 text-[9px] font-black uppercase truncate">
                        {log.location}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 md:p-6 text-center align-middle w-24">
                  <span
                    className={`inline-flex items-center justify-center h-6 px-3 rounded-lg text-[9px] font-black border ${
                      log.priority === "Critical"
                        ? "bg-pepsi-red text-white border-pepsi-red shadow-lg shadow-red-500/10"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {log.priority.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 md:p-6 text-center align-middle w-12">
                  <ChevronRight size={18} className="mx-auto text-slate-700" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] border-x border-t sm:border border-slate-800 shadow-2xl p-6 sm:p-8 transform animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Item Intelligence
              </h4>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                    {historicalStats?.totalOccurrences}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Total Logs
                  </p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <TrendingUp size={18} className="text-emerald-500 mb-2" />
                  <p className="text-2xl font-black text-white">
                    {historicalStats?.avgDays}
                  </p>
                  <p className="text-[9px] font-black text-slate-500 uppercase">
                    Avg Days OOS
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-2 text-emerald-500">
                  <CheckCircle2 size={16} />
                  <p className="text-[10px] font-black uppercase">
                    Prevention Plan
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
                      Root Cause
                    </p>
                    <p className="text-sm font-black text-white uppercase">
                      {selectedLog.root_cause || "Unknown"}
                    </p>
                  </div>
                </div>
                {selectedLog.notes && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">
                      Field Notes
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      "{selectedLog.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 pb-8 sm:pb-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-5 bg-pepsi-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 cursor-pointer"
              >
                Close Intelligence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
