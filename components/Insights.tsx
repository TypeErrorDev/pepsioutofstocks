"use client";
import React, { useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  TrendingDown,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";

export default function Insights() {
  const { logs } = useTracker();

  const analytics = useMemo(() => {
    if (logs.length === 0) return null;

    // 1. Frequency Analysis: Identify the primary item driving stockouts
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      counts[l.product] = (counts[l.product] || 0) + 1;
    });

    const sortedProducts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topProduct = sortedProducts[0];

    // 2. Verified Cause Distribution based on your Schema
    const causes = {
      highDemand: logs.filter((l) => l.root_cause === "High Demand").length,
      execution: logs.filter(
        (l) => l.root_cause === "Ordering Error" || l.location !== "Home Shelf",
      ).length,
      warehouse: logs.filter((l) => l.root_cause === "Warehouse OOS").length,
    };

    return {
      topProduct,
      causes,
      total: logs.length,
    };
  }, [logs]);

  if (!analytics)
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-[2.5rem] border border-slate-800 border-dashed">
        <BarChart3 className="text-slate-700 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          Awaiting Field Data for Analysis
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mitigation Priority: The Top Offender */}
        <div className="md:col-span-2 lg:col-span-2 bg-pepsi-red/10 border border-pepsi-red/20 p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group transition-all hover:bg-pepsi-red/[0.15]">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Target size={140} className="text-pepsi-red" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-pepsi-red" />
              <span className="text-[10px] font-black text-pepsi-red uppercase tracking-[0.2em]">
                Priority Mitigation Target
              </span>
            </div>
            <h3 className="text-3xl font-black text-white leading-tight mb-2 uppercase tracking-tighter">
              {analytics.topProduct[0]}
            </h3>
            <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
              This product accounts for{" "}
              <span className="text-white font-bold">
                {((analytics.topProduct[1] / analytics.total) * 100).toFixed(0)}
                %
              </span>{" "}
              of active route alerts. Recommendation: Adjust order velocity or
              request secondary placement.
            </p>
          </div>
        </div>

        {/* Execution Gap Metric */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mb-6">
            <TrendingDown size={24} className="text-amber-500" />
          </div>
          <div>
            <p className="text-4xl font-black text-white">
              {analytics.causes.execution}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
              Execution Gaps
            </p>
            <p className="text-[10px] text-slate-400 mt-3 font-bold leading-relaxed italic">
              Items identified as in-building but not merched to the sales
              floor.
            </p>
          </div>
        </div>

        {/* Velocity Pressure Metric */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
          <div className="p-3 bg-pepsi-blue/10 rounded-2xl w-fit mb-6">
            <ShoppingCart size={24} className="text-pepsi-blue" />
          </div>
          <div>
            <p className="text-4xl font-black text-white">
              {analytics.causes.highDemand}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
              Velocity Pressure
            </p>
            <p className="text-[10px] text-slate-400 mt-3 font-bold leading-relaxed italic">
              Consumer demand exceeding current shelf holding capacity.
            </p>
          </div>
        </div>

        {/* Supply Constraint Metric */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
          <div className="p-3 bg-slate-800 rounded-2xl w-fit mb-6">
            <Warehouse size={24} className="text-slate-400" />
          </div>
          <div>
            <p className="text-4xl font-black text-white">
              {analytics.causes.warehouse}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
              Supply Constraints
            </p>
            <p className="text-[10px] text-slate-400 mt-3 font-bold leading-relaxed italic">
              External regional warehouse outages impacting availability.
            </p>
          </div>
        </div>
      </div>

      {/* Corporate Prevention Summary */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-lg">
        <div className="p-4 bg-emerald-500/20 rounded-full shrink-0">
          <CheckCircle2 className="text-emerald-500" size={32} />
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-tighter text-lg">
            Route Prevention Strategy
          </h4>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Targeting frequency-driven stockouts for{" "}
            <span className="text-white font-bold">
              {analytics.topProduct[0]}
            </span>
            will improve overall route shelf-availability by approximately{" "}
            <span className="text-emerald-400 font-black">
              {((analytics.topProduct[1] / analytics.total) * 100).toFixed(0)}%
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
