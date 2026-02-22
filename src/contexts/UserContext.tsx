import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import apiClient from "../utils/api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  googleId?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  isClient: boolean;
  isFreelancer: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data.user);
    } catch (err: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    refreshUser,
    setUser,
    isClient: user?.role === "client",
    isFreelancer: user?.role === "freelancer",
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
