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

// --- STRICT SYSTEM TYPES ---
export type UserRole =
  | "admin"
  | "team_lead"
  | "sales_rep"
  | "merchandiser"
  | "user";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  gpid: string;
  role: UserRole;
  created_at: string;
}

export interface StockoutLog {
  id: string;
  store: string;
  location: string;
  brand: string;
  pack_type: string;
  root_cause: string;
  notes: string | null;
  gpid: string | null;
  is_worked: boolean;
  is_hidden: boolean;
  user_name: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TrackerContextType {
  user: User | null;
  profile: Profile | null;
  logs: StockoutLog[];
  loading: boolean;
  fetchLogs: () => Promise<void>;
  addLog: (
    logData: Omit<
      StockoutLog,
      | "id"
      | "is_worked"
      | "is_hidden"
      | "created_at"
      | "updated_at"
      | "user_name"
      | "updated_by"
    >,
  ) => Promise<{ success: boolean }>;
  toggleWorkedStatus: (id: string, currentStatus: boolean) => Promise<void>;
  hideLog: (id: string, reason: string) => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    full_name: string,
    gpid: string,
    role: UserRole,
  ) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<StockoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CORE SYSTEM DATA FETCHERS ---
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) setProfile(data as Profile);
    } catch (e) {
      console.error("Profile core synchronization exception:", e);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setLogs(data as StockoutLog[]);
    } catch (e) {
      console.error("Logs database fetching exception:", e);
    }
  }, []);

  // --- RESILIENT REALTIME NETWORKING & MOBILE BACKGROUND LIFECYCLE ---
  useEffect(() => {
    if (!user) return;

    // Initialize our primary Postgres change listener pipeline
    let channel = supabase
      .channel("realtime_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs" },
        () => {
          fetchLogs();
        },
      );

    channel.subscribe();

    // Fix for Mobile Device Wake/Unlock Event Dropouts
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log(
          "Device focus restored. Re-authenticating database websocket pipe...",
        );

        // 1. Force state machine sync with network boundary
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // 2. Fetch trailing records missed while phone screen was locked
          fetchLogs();

          // 3. Purge broken sockets and spin up a resilient fresh channel
          supabase.removeChannel(channel);
          channel = supabase
            .channel("realtime_logs")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "logs" },
              () => {
                fetchLogs();
              },
            );
          channel.subscribe();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  // --- AUTH SUBSCRIPTION ARCHITECTURE ---
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        }
      } catch (error) {
        console.error("Auth security engine initialization failure:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();

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

  // --- INTERACTIVE OPERATIONS METHODS (WITH HARD TIMEOUT GUARDS) ---
  const addLog = async (logData: any) => {
    // 8-Second Circuit Breaker: Prevents UI from hanging infinitely on dead store arrays
    const networkTimeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Database write transaction timeout")),
        8000,
      ),
    );

    try {
      const dbInsertTask = supabase.from("logs").insert([
        {
          ...logData,
          user_name: profile?.full_name || "Unknown Operator",
          is_worked: false,
          is_hidden: false,
        },
      ]);

      // Race database execution task against our local network timer guard
      const { error } = (await Promise.race([
        dbInsertTask,
        networkTimeout,
      ])) as any;
      if (error) throw error;

      await fetchLogs();
      return { success: true };
    } catch (error: any) {
      console.error("Critical submission disruption:", error);
      // Re-verify network credentials locally on execution faults
      await supabase.auth.getSession();
      throw error;
    }
  };

  const toggleWorkedStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("logs")
        .update({
          is_worked: !currentStatus,
          updated_by: profile?.full_name || "System Validator",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error("Failed to alter resolution state map:", error);
    }
  };

  const hideLog = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("logs")
        .update({
          is_hidden: true,
          notes: reason
            ? `${logs.find((l) => l.id === id)?.notes || ""} [Archive Reason: ${reason}]`
            : logs.find((l) => l.id === id)?.notes,
          updated_by: profile?.full_name || "System Archivist",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error("Failed to archive entry from feed view:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      await Promise.all([fetchProfile(data.user.id), fetchLogs()]);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    full_name: string,
    gpid: string,
    role: UserRole,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: email.split("@")[0],
          full_name,
          gpid,
          role,
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) throw profileError;
      setUser(data.user);
      await Promise.all([fetchProfile(data.user.id), fetchLogs()]);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setLogs([]);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <TrackerContext.Provider
      value={{
        user,
        profile,
        logs,
        loading,
        fetchLogs,
        addLog,
        toggleWorkedStatus,
        hideLog,
        signOut,
        signIn,
        signUp,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error(
      "useTracker hook execution context isolated outside target TrackerProvider boundary.",
    );
  }
  return context;
};
