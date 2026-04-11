"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Send } from "lucide-react";

export default function StockoutForm() {
  const { addLog } = useTracker();
  const [formData, setFormData] = useState({
    product: "",
    store: "",
    category: "Salty",
    priority: "Medium",
    days_oos: 1,
  });

  const submit = async (e: any) => {
    e.preventDefault();
    await addLog(formData);
    setFormData({ ...formData, product: "", store: "" });
  };

  const inputStyle =
    "w-full bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue transition-all";

  return (
    <form onSubmit={submit} className="space-y-5">
      <h3 className="text-xl font-black text-white mb-2">Record Stockout</h3>
      <input
        className={inputStyle}
        placeholder="Product Name"
        value={formData.product}
        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
        required
      />
      <input
        className={inputStyle}
        placeholder="Store Location"
        value={formData.store}
        onChange={(e) => setFormData({ ...formData, store: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <select
          className={inputStyle}
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          type="number"
          className={inputStyle}
          value={formData.days_oos}
          onChange={(e) =>
            setFormData({ ...formData, days_oos: parseInt(e.target.value) })
          }
        />
      </div>
      <button className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl shadow-lg hover:brightness-110 flex justify-center gap-2 cursor-pointer transition-all">
        <Send size={18} /> LOG STOCKOUT
      </button>
    </form>
  );
}
