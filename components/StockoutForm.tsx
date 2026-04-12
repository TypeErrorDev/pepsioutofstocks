"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Send, MapPin, Package, Clock, LayoutGrid } from "lucide-react";

export default function StockoutForm() {
  const { addLog } = useTracker();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    store: "",
    location: "Home Shelf",
    category: "Salty",
    days_oos: 1,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addLog(formData);
    // Reset product only, keep store for multi-item logging in one stop
    setFormData({ ...formData, product: "" });
    setLoading(false);
  };

  const locations = ["Home Shelf", "Cooler", "Endcap", "Lobby", "Checkstand"];

  return (
    <form onSubmit={submit} className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-pepsi-blue/10 rounded-lg">
          <LayoutGrid className="text-pepsi-blue" size={20} />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
          Log Stockout
        </h3>
      </div>

      {/* Product Input Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Product Details
        </label>
        <div className="relative">
          <Package className="absolute left-4 top-4 text-slate-500" size={18} />
          <input
            className="w-full bg-slate-800/50 text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue focus:bg-slate-800 transition-all font-bold"
            placeholder="e.g. Doritos Nacho 9.25oz"
            value={formData.product}
            onChange={(e) =>
              setFormData({ ...formData, product: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Store & Days Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Store ID
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-4 top-4 text-slate-500"
              size={18}
            />
            <input
              className="w-full bg-slate-800/50 text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue focus:bg-slate-800 transition-all font-bold"
              placeholder="Store #"
              value={formData.store}
              onChange={(e) =>
                setFormData({ ...formData, store: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-4 text-slate-500" size={18} />
            <input
              type="number"
              className="w-full bg-slate-800/50 text-white pl-12 pr-4 py-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue focus:bg-slate-800 transition-all font-bold"
              value={formData.days_oos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days_oos: parseInt(e.target.value) || 1,
                })
              }
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Location Selector Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Store Location
        </label>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setFormData({ ...formData, location: loc })}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                formData.location === loc
                  ? "bg-pepsi-blue border-pepsi-blue text-white shadow-lg shadow-blue-950"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <button
          disabled={loading}
          className="w-full bg-pepsi-blue text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-950/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <Send
            size={20}
            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
          />
          {loading ? "PROCESSING..." : "SUBMIT LOG"}
        </button>
        <p className="text-[9px] text-center text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">
          Priority is auto-calculated based on frequency
        </p>
      </div>
    </form>
  );
}
