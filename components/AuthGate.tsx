"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { userName, registerUser } = useTracker();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!input) return;
    setLoading(true);
    await registerUser(input);
    setLoading(false);
  };

  if (!userName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#004C97] p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border-t-8 border-[#E31837]">
          <div className="mb-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-[#004C97] flex items-center justify-center mb-4 shadow-lg">
              <div className="h-8 w-8 rounded-full border-4 border-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              MerchTrack
            </h1>
            <p className="text-slate-500 font-medium">
              PepsiCo Field Inventory Tracker
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <input
                className="w-full mt-1 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 outline-none focus:border-[#004C97] focus:bg-white transition-all font-bold text-slate-700"
                placeholder="Enter display name..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full rounded-2xl bg-[#004C97] py-4 font-black text-white hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
