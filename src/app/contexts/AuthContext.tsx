import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../../lib/api";
import type { OnboardingData, UserProfile } from "../../lib/types";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, name: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
  completeOnboarding: (data: OnboardingData) => Promise<UserProfile>;
  updateProfile: (updates: Parameters<typeof api.updateProfile>[0]) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await api.fetchCurrentUser();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await api.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { user: registered } = await api.register(email, password, name);
    setUser(registered);
    return registered;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    const updated = await api.saveOnboarding(data);
    setUser(updated);
    return updated;
  }, []);

  const updateProfile = useCallback(
    async (updates: Parameters<typeof api.updateProfile>[0]) => {
      const updated = await api.updateProfile(updates);
      setUser(updated);
      return updated;
    },
    [user?.onboardingCompleted],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      completeOnboarding,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, refreshUser, completeOnboarding, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
