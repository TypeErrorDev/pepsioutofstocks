"use client";
import { useTracker } from "@/context/TrackerContext";
import { Package, MapPin } from "lucide-react";

export default function LogTable() {
  const { logs, userName } = useTracker();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <Package className="text-slate-700 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
          No Data Found
        </p>
        <p className="text-slate-600 text-sm mt-1 font-medium">
          Viewing logs for: <span className="text-pepsi-blue">{userName}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 transition-colors duration-300">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Live Inventory Feed
        </span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase">
            Synced
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Product / Store
              </th>
              <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">
                Priority
              </th>
              <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">
                Days
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="p-5">
                  <p className="font-bold text-white text-sm">{log.product}</p>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase mt-1">
                    <MapPin size={10} /> {log.store}
                  </div>
                </td>
                <td className="p-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                      log.priority === "High"
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {log.priority.toUpperCase()}
                  </span>
                </td>
                <td className="p-5 text-center font-black text-white text-sm">
                  {log.days_oos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
