"use client";
import { useTracker } from "@/context/TrackerContext";
import { Package, MapPin, Map as MapIcon, ShieldAlert } from "lucide-react";

export default function LogTable() {
  const { logs, userName } = useTracker();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <Package className="text-slate-700 mb-4 opacity-50" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
          No Active Stockouts
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Historical Frequency Engine Active
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-emerald-500 uppercase">
            Synced
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Product / Details
              </th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                Auto Priority
              </th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                OOS Days
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-white/[0.03] transition-all duration-150"
              >
                <td className="p-6">
                  <p className="font-black text-white text-base mb-2">
                    {log.product}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase bg-slate-800 px-2 py-1 rounded-lg">
                      <MapPin size={10} className="text-pepsi-red" />{" "}
                      {log.store}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase bg-pepsi-blue/10 border border-pepsi-blue/20 px-2 py-1 rounded-lg">
                      <MapIcon size={10} className="text-pepsi-blue" />{" "}
                      {log.location || "Shelf"}
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black border shadow-sm ${
                      log.priority === "Critical"
                        ? "bg-pepsi-red text-white border-pepsi-red shadow-red-500/20"
                        : log.priority === "High"
                          ? "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                          : "bg-pepsi-blue/10 text-blue-400 border-pepsi-blue/20"
                    }`}
                  >
                    {log.priority === "Critical" && <ShieldAlert size={12} />}
                    {log.priority.toUpperCase()}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <span className="text-lg font-black text-white">
                    {log.days_oos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
