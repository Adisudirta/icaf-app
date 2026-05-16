"use client";

import { createContext, useContext } from "react";

interface AuthContextValue {
  user: { name: string; email: string } | null;
  signIn: () => Promise<void>;
  openSignInModal: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  signIn: async () => {},
  openSignInModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
