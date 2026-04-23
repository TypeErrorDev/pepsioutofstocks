"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  MapPin,
  AlertCircle,
  MessageSquare,
  X,
  CheckCircle2,
  ChevronRight,
  Box,
} from "lucide-react";

const PACK_TYPES = [
  "18 Pack", "12 Pack", "10 Pack", "8 Pack", "6 Pack",
  "4 Pack", "28oz", "20oz", "2L", "1.25L", "Singles",
];

const LOCATIONS = [
  "Main Shelf", "Coolers", "Lobby", "Endcap", "Display", "Shippers",
];

// Professional logistical causes to avoid placing blame
const ROOT_CAUSES = [
  "Backstock",
  "Warehouse Error",
  "Delivery Refusal",
  "Forecast Gap",
  "Velocity Surge"
];

export default function StockoutForm() {
  const { addLog, profile } = useTracker();

  // Form States
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [store, setStore] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("Backstock");
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
        store: store,
        location,
        root_cause: cause,
        notes,
        gpid: profile?.gpid,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reset specific fields for next entry
      setBrand("");
      setNotes("");
      setCause("Backstock");
    } catch (err) {
      console.error("Log failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* Success Overlay - Updated to semantic theme */}
      {showSuccess && (
        <div className="absolute inset-0 bg-app-card/95 backdrop-blur-md z-50 rounded-[2.5rem] flex flex-col items-center justify-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <span className="text-[10px] font-black text-app-text uppercase tracking-[0.4em]">
            Entry Synced
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* BRAND INPUT */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Brand / SKU
          </label>
          <div className="relative">
            <Package className="absolute left-4 top-3.5 text-app-muted" size={16} />
            <input
              className="w-full bg-app-bg/40 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold placeholder:text-app-muted/50 transition-all"
              placeholder="e.g. Starry, Pepsi, Dew"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>
        </div>

        {/* PACK TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Pack Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PACK_TYPES.map((pType) => (
              <button
                key={pType}
                type="button"
                onClick={() => setType(pType)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${type === pType
                    ? "bg-pepsi-blue border-pepsi-blue text-white shadow-lg shadow-pepsi-blue/20"
                    : "bg-app-bg/20 border-app-border text-app-muted hover:border-app-text/30"
                  }`}
              >
                {pType}
              </button>
            ))}
          </div>
        </div>

        {/* LOCATION SELECTOR */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Store Location
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${location === loc
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-app-bg/20 border-app-border text-app-muted hover:border-app-text/30"
                  }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* STORE IDENTITY INPUT */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Store Identity
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-3.5 text-app-muted group-focus-within:text-pepsi-blue transition-colors" size={14} />
            <input
              type="text"
              className="w-full bg-app-bg/40 text-app-text p-3.5 pl-10 pr-10 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
              placeholder="e.g. Safeway #3213"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
            />
            {store && (
              <button
                type="button"
                onClick={() => setStore("")}
                className="absolute right-3 top-3 p-1 rounded-lg bg-app-border text-app-muted hover:text-app-text hover:bg-pepsi-red/20 transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ROOT CAUSE - Professional Logistical Terms */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Logistical Cause
          </label>
          <div className="relative">
            <AlertCircle className="absolute left-4 top-3.5 text-app-muted" size={16} />
            <select
              className="w-full bg-app-bg/40 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold appearance-none cursor-pointer"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            >
              {ROOT_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-4 text-app-muted pointer-events-none rotate-90" size={14} />
          </div>
        </div>

        {/* OBSERVATIONS */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-app-muted uppercase ml-1 tracking-[0.2em]">
            Field Observations
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-3.5 text-app-muted" size={16} />
            <textarea
              className="w-full bg-app-bg/40 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold min-h-[80px] transition-all"
              placeholder="Specific notes (e.g. promo velocity surge)..."
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
            LOG FIELD ENTRY
            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}