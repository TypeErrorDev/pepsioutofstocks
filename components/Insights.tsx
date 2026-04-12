"use client";
import React, { useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  TrendingDown,
  AlertTriangle,
  Warehouse,
  ShoppingCart,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

export default function Insights() {
  const { logs } = useTracker();

  const metrics = useMemo(() => {
    const total = logs.length;
    if (total === 0) return null;

    // 1. Identify Top Offender
    const productCounts: Record<string, number> = {};
    logs.forEach(
      (l) => (productCounts[l.product] = (productCounts[l.product] || 0) + 1),
    );
    const topProduct = Object.entries(productCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // 2. Root Cause Breakdown
    const causes = {
      demand: logs.filter((l) => l.root_cause === "High Demand").length,
      backstock: logs.filter(
        (l) => l.root_cause === "Ordering Error" || l.location === "Backroom",
      ).length,
      warehouse: logs.filter((l) => l.root_cause === "Warehouse OOS").length,
    };

    return { total, topProduct, causes };
  }, [logs]);

  if (!metrics)
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
        <BarChart3 className="text-slate-700 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
          Insufficient Data for Trends
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Prevention Alert: Top Offender */}
      <div className="lg:col-span-2 bg-pepsi-red/10 border border-pepsi-red/20 p-6 rounded-[2rem] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-pepsi-red" />
            <span className="text-[10px] font-black text-pepsi-red uppercase tracking-widest">
              Priority Mitigation
            </span>
          </div>
          <h3 className="text-2xl font-black text-white leading-tight">
            {metrics.topProduct[0]}
          </h3>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            This item has been OOS{" "}
            <span className="text-white font-bold">
              {metrics.topProduct[1]} times
            </span>{" "}
            this month. Recommendation: Increase order par by 15% for next
            delivery.
          </p>
        </div>
      </div>

      {/* Execution Insight: Execution Gap */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between">
        <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mb-4">
          <TrendingDown size={20} className="text-amber-500" />
        </div>
        <div>
          <p className="text-3xl font-black text-white">
            {metrics.causes.backstock}
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            Refill Oversights
          </p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold leading-relaxed">
            Items likely in backstock but not yet merched to floor.
          </p>
        </div>
      </div>

      {/* Warehouse Impact */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col justify-between">
        <div className="p-3 bg-pepsi-blue/10 rounded-2xl w-fit mb-4">
          <Warehouse size={20} className="text-pepsi-blue" />
        </div>
        <div>
          <p className="text-3xl font-black text-white">
            {metrics.causes.warehouse}
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            Supply Chain Issues
          </p>
          <p className="text-[9px] text-slate-400 mt-2 font-bold leading-relaxed">
            Verified warehouse outages impacting store availability.
          </p>
        </div>
      </div>
    </div>
  );
}
