"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  MapPin,
  AlertCircle,
  MessageSquare,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const PACK_TYPES = [
  "24 Pack",
  "18 Pack",
  "12 Pack",
  "10 Pack",
  "8 Pack",
  "6 Pack",
  "4 Pack",
  "64oz",
  "28oz",
  "20oz",
  "2L",
  "1.25L",
  "Singles",
];

const LOCATIONS = ["Main Shelf", "Coolers"];

const ROOT_CAUSES = [
  "Warehouse OOS",
  "Ordering Error",
  "On Sale/Promotion",
  "Discontinued",
];

export default function StockoutForm() {
  const { addLog, profile, logs } = useTracker();

  // Form States
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [store, setStore] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("Item In Backstock");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Autocomplete UI States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // 1. Extract distinct existing brands from your live database logs
  const distinctBrands = useMemo(() => {
    if (!logs) return [];
    const unique = new Set<string>();
    logs.forEach((log) => {
      if (log.brand && log.brand.trim() !== "") {
        unique.add(log.brand.trim());
      }
    });
    return Array.from(unique).sort();
  }, [logs]);

  // 2. Filter predictions dynamically as the user types
  const filteredSuggestions = useMemo(() => {
    if (!brand.trim()) return [];
    return distinctBrands.filter(
      (item) =>
        item.toLowerCase().includes(brand.toLowerCase()) &&
        item.toLowerCase() !== brand.toLowerCase(),
    );
  }, [brand, distinctBrands]);

  // 3. Close the predictive dropdown cleanly if clicking outside the input area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !location) {
      alert("Please select both a Pack Type and a Store Location");
      return;
    }

    setIsSubmitting(true);
    setShowSuggestions(false);
    try {
      await addLog({
        brand: brand.trim(),
        pack_type: type,
        store: store,
        location,
        root_cause: cause,
        notes,
        gpid: profile?.gpid ?? null,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Reset fields for the next entry
      setBrand("");
      setNotes("");
      setCause("Item In Backstock");
    } catch (err) {
      console.error("Log tracking transaction failed:", err);
      alert(
        "Connection timeout occurred. Please ensure you have service bars and try submitting again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <span className="text-[10px] font-black text-slate-50 uppercase tracking-[0.4em]">
            Entry Synced
          </span>
        </div>
      )}

      <div className="space-y-5">
        {/* BRAND INPUT WITH PREDICTIVE DROPDOWN */}
        <div className="space-y-1 relative" ref={autocompleteRef}>
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Brand / SKU
          </label>
          <div className="relative">
            <Package
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <input
              type="text"
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none focus:border-pepsi-blue text-sm font-bold placeholder:text-slate-500/50 transition-all"
              placeholder="e.g. Starry, Pepsi, Dew"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              required
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          {/* FLOATING SUGGESTIONS MENU */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-900 custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setBrand(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-5 py-3 text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900 transition-colors uppercase tracking-wide"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
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
                disabled={isSubmitting}
                onClick={() => setType(pType)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${
                  type === pType
                    ? "bg-pepsi-blue border-pepsi-blue text-white shadow-lg shadow-pepsi-blue/20"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-400 disabled:opacity-50"
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
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                disabled={isSubmitting}
                onClick={() => setLocation(loc)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${
                  location === loc
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-400 disabled:opacity-50"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* STORE IDENTITY INPUT */}
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
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-10 pr-10 rounded-2xl border border-slate-800 outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
              placeholder="e.g. Safeway #3213"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
              disabled={isSubmitting}
            />
            {store && !isSubmitting && (
              <button
                type="button"
                onClick={() => setStore("")}
                className="absolute right-3 top-3 p-1 rounded-lg bg-slate-800 text-slate-500 hover:text-slate-50 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ROOT CAUSE */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Logistical Cause
          </label>
          <div className="relative">
            <AlertCircle
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <select
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none focus:border-pepsi-blue text-sm font-bold appearance-none cursor-pointer disabled:opacity-50"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              disabled={isSubmitting}
            >
              {ROOT_CAUSES.map((c) => (
                <option key={c} value={c} className="bg-slate-950">
                  {c}
                </option>
              ))}
            </select>
            <ChevronRight
              className="absolute right-4 top-4 text-slate-500 pointer-events-none rotate-90"
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
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none focus:border-pepsi-blue text-sm font-bold min-h-20 transition-all disabled:opacity-50"
              placeholder="Specific notes (e.g. promo velocity surge)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="tracking-widest">SYNCING</span>
          </div>
        ) : (
          <>
            LOG FIELD ENTRY
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
