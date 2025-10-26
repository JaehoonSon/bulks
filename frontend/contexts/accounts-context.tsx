"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Tables } from "@/database.types";
import { getToken } from "@/lib/utils";
// import { getToken } from "@/hooks/use-job-manager";
export type TiktokAccount = Tables<"tiktok_accounts">;

type AccountsContextValue = {
  accounts: TiktokAccount[] | null;
  loading: boolean;
  refreshAccounts: () => Promise<void>;
  startConnect: () => Promise<string>;
  relinkAccount: (openId: string) => Promise<string>;
  unlinkAccount: (openId: string) => Promise<void>;
};

const AccountsContext = createContext<AccountsContextValue | undefined>(
  undefined
);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { user, loading: authLoading } = useAuth();
  const [accounts, setAccounts] = useState<TiktokAccount[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setAccounts(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tiktok_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      console.log(data);

      if (error) {
        console.error("Error fetching TikTok accounts:", error);
        setAccounts(null);
      } else {
        setAccounts(data ?? []);
      }
    } catch (error) {
      console.error("Unexpected error fetching TikTok accounts:", error);
      setAccounts(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!authLoading) {
      void fetchAccounts();
    }
  }, [authLoading, fetchAccounts]);

  const startConnect = useCallback(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/tiktok/start`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );

    if (!response.ok) {
      let message = "Failed to start TikTok authorization.";
      try {
        const data = (await response.json()) as {
          error?: { message?: string };
        };
        message = data?.error?.message ?? message;
      } catch (error) {
        console.error("Failed to parse authorization error response", error);
      }
      throw new Error(message);
    }

    const data = (await response.json()) as { authorize_url?: string };
    if (!data?.authorize_url) {
      throw new Error("Authorization URL was not returned by the server.");
    }

    return data.authorize_url;
  }, []);

  const relinkAccount = useCallback(async (openId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/tiktok/relink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ open_id: openId }),
      }
    );

    if (!response.ok) {
      let message = "Failed to relink TikTok account.";
      try {
        const data = (await response.json()) as {
          error?: { message?: string };
        };
        message = data?.error?.message ?? message;
      } catch (error) {
        console.error("Failed to parse relink error response", error);
      }
      throw new Error(message);
    }

    const data = (await response.json()) as { authorize_url?: string };
    if (!data?.authorize_url) {
      throw new Error("Relink URL was not returned by the server.");
    }

    return data.authorize_url;
  }, []);

  const unlinkAccount = useCallback(
    async (openId: string) => {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/auth/tiktok/unlink?open_id=${encodeURIComponent(openId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to unlink TikTok account.";
        try {
          const data = (await response.json()) as {
            error?: { message?: string };
          };
          message = data?.error?.message ?? message;
        } catch (error) {
          console.error("Failed to parse unlink error response", error);
        }
        throw new Error(message);
      }

      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const value = useMemo(
    () => ({
      accounts,
      loading,
      refreshAccounts: fetchAccounts,
      startConnect,
      relinkAccount,
      unlinkAccount,
    }),
    [
      accounts,
      loading,
      fetchAccounts,
      startConnect,
      relinkAccount,
      unlinkAccount,
    ]
  );

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}
