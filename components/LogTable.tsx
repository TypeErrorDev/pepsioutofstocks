"use client";
import { useTracker } from "@/context/TrackerContext";

export default function LogTable() {
  const { logs } = useTracker();
  return (
    <table className="w-full text-left">
      <thead className="bg-slate-50">
        <tr>
          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Product
          </th>
          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            Priority
          </th>
          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            Days
          </th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id} className="border-b border-slate-100">
            <td className="p-5 font-bold text-slate-800 text-sm">
              {log.product} <br />
              <span className="text-[10px] text-slate-400">{log.store}</span>
            </td>
            <td className="p-5 text-center">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black ${log.priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-[#004C97]"}`}
              >
                {log.priority}
              </span>
            </td>
            <td className="p-5 text-center font-black">{log.days_oos}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
