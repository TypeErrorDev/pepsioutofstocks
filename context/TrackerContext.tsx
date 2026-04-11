"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TrackerContextType {
  userName: string | null;
  registerUser: (name: string) => Promise<void>;
  logs: any[];
  addLog: (entry: any) => Promise<void>;
  archiveLogs: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Register or Login User
  const registerUser = async (name: string) => {
    const cleanName = name.trim().toLowerCase();

    // Check if user exists
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", cleanName)
      .single();

    // If not, create them
    if (!profile) {
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert([{ username: cleanName }])
        .select()
        .single();
      if (error) return alert("Registration failed");
      profile = newProfile;
    }

    setUserNameState(profile.username);
    localStorage.setItem("pepsi_user", profile.username);
  };

  useEffect(() => {
    const saved = localStorage.getItem("pepsi_user");
    if (saved) setUserNameState(saved);
  }, []);

  // Fetch initial logs
  const fetchLogs = async () => {
    if (!userName) return;
    const { data } = await supabase
      .from("stockouts")
      .select("*")
      .eq("user_name", userName)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  useEffect(() => {
    if (!userName) return;

    fetchLogs();

    // --- REALTIME SUBSCRIPTION ---
    const channel = supabase
      .channel("stockout-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all changes (Insert, Update, Delete)
          schema: "public",
          table: "stockouts",
          filter: `user_name=eq.${userName}`,
        },
        (payload) => {
          console.log("Realtime change received:", payload);
          fetchLogs(); // Refresh state whenever the DB changes
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName]);

  const addLog = async (entry: any) => {
    await supabase
      .from("stockouts")
      .insert([{ ...entry, user_name: userName }]);
    // No need to fetchLogs here manually, Realtime handles it!
  };

  const archiveLogs = async () => {
    await supabase
      .from("stockouts")
      .update({ is_archived: true })
      .eq("user_name", userName)
      .eq("is_archived", false);
  };

  return (
    <TrackerContext.Provider
      value={{ userName, registerUser, logs, addLog, archiveLogs }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context)
    throw new Error("useTracker must be used within TrackerProvider");
  return context;
};
