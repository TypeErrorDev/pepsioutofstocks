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
    const channel = supabase
      .channel("stockout-updates")
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
    await supabase
      .from("stockouts")
      .insert([{ ...entry, user_name: userName }]);
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
