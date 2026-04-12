"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import { Clock, MapPin, Package, User as UserIcon, Tag } from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading } = useTracker();

  // Define management roles that can see everything
  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  // If not management, filter logs to only show entries made by this user's GPID
  // (Assuming we store the GPID in the logs table as well, or we can use username/email)
  const filteredLogs = isManagement
    ? logs
    : logs.filter(
        (log) =>
          log.user_name === profile?.full_name ||
          log.user_email === profile?.email,
      );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-700 font-black uppercase tracking-widest text-[10px]">
        Loading Verfied Logs...
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">
            Live Stream
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            {isManagement
              ? "Global Organizational View"
              : "Personal Field Activity"}
          </p>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            {filteredLogs.length} Records Detected
          </span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
            <tr className="border-b border-slate-800">
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Timestamp
              </th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Product
              </th>
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Store
              </th>
              {isManagement && (
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Logger
                </th>
              )}
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                    <Clock size={12} />
                    <span className="text-[11px] font-bold tracking-tight">
                      {new Date(log.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white uppercase tracking-tight">
                      {log.product}
                    </span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      {log.location}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
                      <MapPin size={12} />
                    </div>
                    <span className="text-xs font-black text-slate-300">
                      #{log.store}
                    </span>
                  </div>
                </td>
                {isManagement && (
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserIcon size={12} className="text-pepsi-blue" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {log.user_name || "Unknown"}
                      </span>
                    </div>
                  </td>
                )}
                <td className="p-4 text-right">
                  <span
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border ${
                      log.root_cause === "In Backstock"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
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
    </div>
  );
}
