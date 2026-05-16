"use client";

import { createContext, useContext } from "react";

interface AuthContextValue {
  user: { name: string; email: string } | null;
  signIn: () => Promise<void>;
  openSignInModal: () => void;
  weeklyLimitReached: boolean;
  openLimitModal: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => {},
  openSignInModal: () => {},
  weeklyLimitReached: false,
  openLimitModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
