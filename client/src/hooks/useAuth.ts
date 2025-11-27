import { useState, useEffect, useCallback } from "react";
import { signInWithGoogle, logout, subscribeToAuthState, getIdToken, isConfigured, type User } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isConfigured: isConfigured(),
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        isConfigured: isConfigured(),
      });
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, []);

  return {
    ...authState,
    login,
    logout: signOut,
    getIdToken,
  };
}
