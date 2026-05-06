"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "team_lead" | "sales_rep" | "merchandiser";

interface Profile {
  id: string;
  full_name: string;
  gpid: string;
  role: UserRole;
  email: string;
}

export interface StockoutLog {
  id: string;
  created_at: string;
  store: string;
  brand: string;
  pack_type: string;
  location: string;
  root_cause: string;
  notes?: string;
  user_name: string;
  is_worked: boolean;
  is_hidden: boolean;
  resolution_reason?: string;
  updated_at?: string;
  updated_by?: string;
}

interface TrackerContextType {
  user: User | null;
  profile: Profile | null;
  logs: StockoutLog[];
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (
    email: string,
    pass: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => Promise<any>;
  signOut: () => Promise<void>;
  addLog: (logData: any) => Promise<void>;
  toggleWorkedStatus: (logId: string, currentStatus: boolean) => Promise<void>;
  hideLog: (logId: string, reason: string) => Promise<void>;
  fetchLogs: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<StockoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) setProfile(data);
    } catch (e) {
      console.error("Profile fetch error", e);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });
<<<<<<< HEAD

      if (error) throw error;
      if (data) setLogs(data as StockoutLog[]);
=======
      if (error) throw error;
      if (data) setLogs(data);
>>>>>>> 8dd64aa761e38d3f4f161fd388b63878e240c631
    } catch (e) {
      console.error("Logs fetch error", e);
    }
  }, []);

  // REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs" },
        () => {
          fetchLogs();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, restore session from sessionStorage
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
<<<<<<< HEAD
=======
        // Set loading to false only after session restoration is complete
>>>>>>> 8dd64aa761e38d3f4f161fd388b63878e240c631
        setLoading(false);
      }
    };
    initializeAuth();

    // Set up listener for future auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLogs([]);
        }
      },
    );
    return () => authListener.subscription.unsubscribe();
  }, [fetchLogs]);

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: fullName, gpid: gpid, role: role } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.replace("/");
  };

  const addLog = async (logData: any) => {
    const { error } = await supabase.from("logs").insert([
      {
        ...logData,
        user_name: profile?.full_name,
        is_worked: false,
        is_hidden: false,
      },
    ]);
    if (error) throw error;
    await fetchLogs();
  };

  const toggleWorkedStatus = async (logId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("logs")
      .update({
        is_worked: !currentStatus,
        updated_by: profile?.full_name || "System",
        updated_at: new Date().toISOString(),
      })
      .eq("id", logId);
    if (error) throw error;
    await fetchLogs();
  };

  const hideLog = async (logId: string, reason: string) => {
    const { error } = await supabase
      .from("logs")
      .update({
        is_hidden: true,
        resolution_reason: reason,
        updated_by: profile?.full_name || "System",
        updated_at: new Date().toISOString(),
      })
      .eq("id", logId);
    if (error) throw error;
    await fetchLogs();
  };

  return (
    <TrackerContext.Provider
      value={{
        user,
        profile,
        logs,
        loading,
        signIn,
        signUp,
        signOut,
        addLog,
        toggleWorkedStatus,
        hideLog,
        fetchLogs,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context)
    throw new Error("useTracker must be used within a TrackerProvider");
  return context;
};