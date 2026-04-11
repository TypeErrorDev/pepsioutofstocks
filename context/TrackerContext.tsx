"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TrackerContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  logs: any[];
  addLog: (entry: any) => Promise<void>;
  archiveLogs: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Set name and persist in localStorage so they don't have to re-type it every refresh
  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("pepsi_user", name);
  };

  useEffect(() => {
    const saved = localStorage.getItem("pepsi_user");
    if (saved) setUserNameState(saved);
  }, []);

  // Fetch logs from Supabase
  const fetchLogs = async () => {
    const { data } = await supabase
      .from("stockouts")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  useEffect(() => {
    if (userName) fetchLogs();
  }, [userName]);

  const addLog = async (entry: any) => {
    const { error } = await supabase
      .from("stockouts")
      .insert([{ ...entry, user_name: userName }]);
    if (!error) fetchLogs();
  };

  const archiveLogs = async () => {
    const { error } = await supabase
      .from("stockouts")
      .update({ is_archived: true })
      .eq("user_name", userName)
      .eq("is_archived", false);
    if (!error) setLogs([]);
  };

  return (
    <TrackerContext.Provider
      value={{ userName, setUserName, logs, addLog, archiveLogs }}
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
