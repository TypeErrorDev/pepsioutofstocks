"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  MapPin,
  AlertCircle,
  MessageSquare,
  Hash,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const PACK_TYPES = [
  "18 Pack",
  "12 Pack",
  "10 Pack",
  "8 Pack",
  "6 Pack",
  "4 Pack",
  "28oz",
  "20oz",
  "2L",
  "1.25L",
  "Singles",
];
const LOCATIONS = [
  "Main Shelf",
  "Coolers",
  "Lobby",
  "Endcap",
  "Display",
  "Shippers",
];

export default function StockoutForm() {
  const { addLog, profile } = useTracker();

  // Form States
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [store, setStore] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("In Backstock");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !location) {
      alert("Please select both a Pack Type and a Store Location");
      return;
    }

    setIsSubmitting(true);
    try {
      await addLog({
        product: `${brand} ${type}`.trim(),
        brand,
        pack_type: type,
        store: store, // Now supports "Safeway #3213"
        location,
        root_cause: cause,
        notes,
        gpid: profile?.gpid, // Ensuring GPID is attached to the log
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reset brand and notes for next entry, keep Store # for convenience
      setBrand("");
      setNotes("");
    } catch (err) {
      console.error("Log failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-[2.5rem] flex flex-col items-center justify-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
            Entry Synced
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* BRAND INPUT */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Brand / SKU
          </label>
          <div className="relative">
            <Package
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <input
              className="w-full bg-slate-800/40 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold placeholder:text-slate-600 transition-all"
              placeholder="e.g. Starry, Pepsi, Dew"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
        </div>

        {/* PACK TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Pack Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PACK_TYPES.map((pType) => (
              <button
                key={pType}
                type="button"
                onClick={() => setType(pType)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${type === pType
                  ? "bg-pepsi-blue border-pepsi-blue text-white shadow-[0_0_15px_rgba(0,94,184,0.3)]"
                  : "bg-slate-800/20 border-slate-700/50 text-slate-500 hover:border-slate-400"
                  }`}
              >
                {pType}
              </button>
            ))}
          </div>
        </div>

        {/* LOCATION SELECTOR */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Store Location
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${location === loc
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                  : "bg-slate-800/20 border-slate-700/50 text-slate-500 hover:border-slate-400"
                  }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* STORE IDENTITY INPUT (Allows Text) */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Store Identity
          </label>
          <div className="relative group">
            <MapPin
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-pepsi-blue transition-colors"
              size={14}
            />
            <input
              type="text"
              className="w-full bg-slate-800/40 text-white p-3.5 pl-10 pr-10 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
              placeholder="e.g. Safeway #3213"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
            />
            {store && (
              <button
                type="button"
                onClick={() => setStore("")}
                className="absolute right-3 top-3 p-1 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-pepsi-red/20 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ROOT CAUSE */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Root Cause
          </label>
          <div className="relative">
            <AlertCircle
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <select
              className="w-full bg-slate-800/40 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold appearance-none cursor-pointer"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            >
              <option value="In Backstock">In Backstock</option>
              <option value="Promotion/Sale">Promotion/Sale</option>
              <option value="Order Miss">Order Miss</option>
              <option value="Store Denied Item From Delivery">Store Denied Item From Delivery</option>
              <option value="Warehouse OOS">Warehouse OOS</option>
            </select>
            <ChevronRight
              className="absolute right-4 top-4 text-slate-600 pointer-events-none rotate-90"
              size={14}
            />
          </div>
        </div>

        {/* OBSERVATIONS */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Field Observations
          </label>
          <div className="relative">
            <MessageSquare
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <textarea
              className="w-full bg-slate-800/40 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold min-h-[80px] transition-all"
              placeholder="Specific notes (e.g. manager requested endcap)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        disabled={isSubmitting}
        className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="tracking-widest">SYNCING</span>
          </div>
        ) : (
          <>
            LOG STOCKOUT
            <CheckCircle2
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
          </>
        )}
      </button>
    </form>
  );
}
