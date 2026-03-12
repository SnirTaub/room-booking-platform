import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getAccessToken,
  getFullNameForEmail,
  getUserDisplayName,
  getUserEmail,
  removeAccessToken,
  removeUserDisplayName,
  removeUserEmail,
  setAccessToken,
  setUserDisplayName,
  setUserEmail,
} from "../utils/storage";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  userDisplayName: string | null;
  login: (token: string, email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setToken] = useState<string | null>(null);
  const [userDisplayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const email = getUserEmail();
    const storedDisplayName = getUserDisplayName();
    setToken(token);
    setDisplayName(storedDisplayName || email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      userDisplayName,
      login: (token: string, email?: string) => {
        setAccessToken(token);
        setToken(token);
        if (email) {
          setUserEmail(email);
          const fullName = getFullNameForEmail(email);
          const displayName = fullName || email;
          setUserDisplayName(displayName);
          setDisplayName(displayName);
        }
      },
      logout: () => {
        removeAccessToken();
        removeUserDisplayName();
        removeUserEmail();
        setToken(null);
        setDisplayName(null);
      },
    }),
    [accessToken, userDisplayName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}