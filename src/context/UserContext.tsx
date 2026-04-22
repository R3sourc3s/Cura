"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth as authApi } from "@/lib/api";
import type { User } from "@/types";
import type { Permission } from "@/lib/permissions";

interface UserContextValue {
  user: User | null;
  permissions: Permission[];
  loading: boolean;
  can: (p: Permission) => boolean;
  refresh: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  permissions: [],
  loading: true,
  can: () => false,
  refresh: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, p] = await Promise.all([
        authApi.me(),
        fetch("/api/auth/permissions", { credentials: "include" })
          .then(r => r.json())
          .then(d => (d.permissions ?? []) as Permission[])
          .catch(() => [] as Permission[]),
      ]);
      setUser(u);
      setPermissions(p);
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("profile-updated", load);
    return () => window.removeEventListener("profile-updated", load);
  }, [load]);

  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);

  return (
    <UserContext.Provider value={{ user, permissions, loading, can, refresh: load }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
