"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  MapPin,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function LogTable() {
  const { logs, profile, loading } = useTracker();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isManagement =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  const filteredLogs = isManagement
    ? logs
    : logs.filter(
        (log) =>
          log.user_name === profile?.full_name ||
          log.user_email === profile?.email,
      );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-slate-700 font-black uppercase tracking-widest text-[10px] animate-pulse">
        Syncing Field Logs...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">
            Live Stream
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Entry {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredLogs.length)} of{" "}
            {filteredLogs.length}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-20 transition-colors text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black text-slate-400 px-2 min-w-[45px] text-center">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-20 transition-colors text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-950/50 sticky top-0 z-10 border-b border-slate-800">
              {/* Flexible column for Item Details */}
              <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Item Details
              </th>
              {/* Increased fixed widths for columns that were wrapping */}
              <th className="w-[160px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Store
              </th>
              <th className="w-[110px] p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                User
              </th>
              <th className="w-[140px] p-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/30 transition-colors group h-16"
                >
                  <td className="p-4 overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-white uppercase tracking-tight truncate">
                        {log.brand || log.product || "Missing Brand"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">
                        {log.pack_type} • {log.location}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 overflow-hidden">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <MapPin size={12} className="text-slate-600 shrink-0" />
                      <span className="text-xs font-black text-slate-300">
                        #{log.store}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-center overflow-hidden">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase bg-slate-950 px-2 py-1 rounded-md border border-slate-800 whitespace-nowrap">
                      <UserIcon
                        size={10}
                        className="text-pepsi-blue shrink-0"
                      />
                      <span>{log.user_name?.split(" ")[0] || "User"}</span>
                    </div>
                  </td>

                  <td className="p-4 text-right overflow-hidden">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border inline-block whitespace-nowrap ${
                        log.root_cause === "In Backstock"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                      }`}
                    >
                      {log.root_cause}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic"
                >
                  No verified logs on this page
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
