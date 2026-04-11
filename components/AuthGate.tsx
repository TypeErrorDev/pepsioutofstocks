"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { userName, setUserName } = useTracker();
  const [input, setInput] = useState("");

  if (!userName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#004C97] p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
          <h1 className="mb-2 text-2xl font-bold text-[#004C97]">
            PepsiCo Tracker
          </h1>
          <p className="mb-6 text-gray-500">
            Please enter your name to start tracking.
          </p>
          <input
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-[#004C97]"
            placeholder="Your Name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={() => input && setUserName(input)}
            className="mt-4 w-full rounded-lg bg-[#E31837] py-3 font-bold text-white hover:bg-red-700 transition-colors"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
