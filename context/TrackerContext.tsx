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

  const registerUser = async (name: string) => {
    const cleanName = name.trim().toLowerCase();
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", cleanName)
      .single();

    if (!profile) {
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert([{ username: cleanName }])
        .select()
        .single();
      if (error) return;
      profile = newProfile;
    }

    setUserNameState(profile.username);
    localStorage.setItem("pepsi_user", profile.username);
  };

  useEffect(() => {
    const saved = localStorage.getItem("pepsi_user");
    if (saved) setUserNameState(saved);
  }, []);

  const fetchLogs = async () => {
    if (!userName) return;
    const { data, error } = await supabase
      .from("stockouts")
      .select("*")
      .eq("user_name", userName)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch Error:", error.message);
    setLogs(data || []);
  };

  useEffect(() => {
    if (!userName) return;
    fetchLogs();
    const channel = supabase
      .channel(`db-changes-${userName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stockouts",
          filter: `user_name=eq.${userName}`,
        },
        () => fetchLogs(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userName]);

  const addLog = async (entry: any) => {
    if (!userName) return;

    // 1. Calculate the timestamps for our checks
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Query historical frequency for this product (including archived ones)
    const { data: history } = await supabase
      .from("stockouts")
      .select("created_at")
      .eq("user_name", userName)
      .eq("product", entry.product);

    const recentCount =
      history?.filter((h) => new Date(h.created_at) >= sevenDaysAgo).length ||
      0;
    const monthlyCount =
      history?.filter((h) => new Date(h.created_at) >= thirtyDaysAgo).length ||
      0;

    // 3. Determine Priority based on counts
    let autoPriority = "Low";
    if (recentCount >= 5) {
      autoPriority = "Critical";
    } else if (recentCount >= 2) {
      autoPriority = "High";
    } else if (monthlyCount > 1) {
      autoPriority = "Medium";
    }

    // 4. Insert the log with the calculated priority
    const { error } = await supabase.from("stockouts").insert([
      {
        ...entry,
        user_name: userName,
        priority: autoPriority,
      },
    ]);

    if (error) console.error("Insert Error:", error.message);
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
