import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AppRole = "patient" | "professional";

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
};

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole | null;
  profile: { full_name: string | null; avatar_url: string | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  profile: null,
  loading: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem("current_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const loadCurrentUser = async () => {
    const token = localStorage.getItem("access_token");
    const storedUser = getStoredUser();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (!storedUser) {
      setLoading(true);
    } else {
      setUser(storedUser);
      setLoading(false);
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      const normalizedUser: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url ?? null,
        role: data.role,
      };

      localStorage.setItem("current_user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    } catch (error) {
      console.error("Failed to load current user:", error);

      if (storedUser) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        profile: user
          ? {
              full_name: user.full_name,
              avatar_url: user.avatar_url,
            }
          : null,
        loading,
        signOut,
        refreshUser: loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);