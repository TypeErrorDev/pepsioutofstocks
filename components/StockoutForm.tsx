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
  Layers,
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

  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [store, setStore] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("Ordering Error");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDuplicatedFlash, setIsDuplicatedFlash] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const distinctBrands = useMemo(() => {
    if (!logs) return [];
    const unique = new Set<string>();
    logs.forEach((log) => {
      if (log.brand) unique.add(log.brand.trim());
    });
    return Array.from(unique).sort();
  }, [logs]);

  const filteredSuggestions = useMemo(() => {
    if (!brand.trim()) return [];
    return distinctBrands.filter(
      (item) =>
        item.toLowerCase().includes(brand.toLowerCase()) &&
        item.toLowerCase() !== brand.toLowerCase(),
    );
  }, [brand, distinctBrands]);

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
    if (!brand.trim() || !store.trim() || !type || !location) return;

    setIsSubmitting(true);
    setShowSuggestions(false);
    try {
      const result = await addLog({
        brand: brand.trim(),
        pack_type: type,
        store: store.trim(),
        location,
        root_cause: cause,
        notes,
        gpid: profile?.gpid ?? null,
      });

      if (result?.duplicated) {
        setIsDuplicatedFlash(true);
        setTimeout(() => setIsDuplicatedFlash(false), 2200);
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2200);
      }

      setBrand("");
      setNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {/* STANDARD SUCCESS MODAL OVERLAY */}
      {showSuccess && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
          <span className="text-[10px] font-black text-slate-50 uppercase tracking-[0.4em]">
            New Gap Synced
          </span>
        </div>
      )}

      {/* DEDUPLICATION OVERLAY */}
      {isDuplicatedFlash && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center">
          <Layers size={32} className="text-blue-500 mb-2 animate-bounce" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] text-center px-4">
            Gap Re-verified (+1 Day Streak)
          </span>
        </div>
      )}

      <div className="space-y-5">
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
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold uppercase"
              placeholder="ex: Pepsi, Diet Coke, etc."
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              required
              autoComplete="off"
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-900">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setBrand(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-5 py-3 text-xs font-black text-slate-300 hover:bg-slate-900 uppercase"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

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
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${type === pType ? "bg-pepsi-blue border-pepsi-blue text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}
              >
                {pType}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Store Location
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${location === loc ? "bg-emerald-600 border-emerald-600 text-white" : "bg-slate-950 border-slate-800 text-slate-500"}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Store Identity
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-4 top-3.5 text-slate-500"
              size={14}
            />
            <input
              type="text"
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-10 rounded-2xl border border-slate-800 outline-none text-sm font-bold uppercase"
              placeholder="ex: Safeway #1143, Walmart #5678, etc."
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
            />
          </div>
        </div>

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
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold appearance-none cursor-pointer"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            >
              {ROOT_CAUSES.map((c) => (
                <option key={c} value={c}>
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
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold min-h-20"
              placeholder="Specific notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
      >
        {isSubmitting ? "SYNCING..." : "LOG FIELD GAP / VERIFY"}
      </button>
    </form>
  );
}
